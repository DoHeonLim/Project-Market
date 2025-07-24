/**
 * File Name : lib/chat/messages/createMessage
 * Description : 채팅 메시지 저장 및 실시간 브로드캐스트/푸시알림
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.13  임도헌   Created   메시지 저장 및 실시간 브로드캐스트
 */

import db from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { sendPushNotification } from "@/lib/push-notification";

/**
 * createMessage
 * - 채팅 메시지를 DB에 저장
 * - Supabase로 실시간 브로드캐스트
 * - 수신자에게 알림 생성 및 푸시 전송
 * payload - 메시지 내용
 * chatRoomId - 채팅방 ID
 * senderId - 보낸 사람 ID
 */
export async function createMessage(
  payload: string,
  chatRoomId: string,
  senderId: number
) {
  try {
    // 1단계: 메시지 저장
    const message = await db.productMessage.create({
      data: {
        payload,
        userId: senderId,
        productChatRoomId: chatRoomId,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });

    // 2단계: Supabase 브로드캐스트 (해당 채널에 메시지 전송)
    await supabase.channel(`room-${chatRoomId}`).send({
      type: "broadcast",
      event: "message",
      payload: {
        id: message.id,
        payload: message.payload,
        created_at: message.created_at,
        isRead: message.isRead,
        productChatRoomId: chatRoomId,
        user: {
          id: message.user.id,
          username: message.user.username,
          avatar: message.user.avatar,
        },
      },
    });

    // 3단계: 수신자 찾기 (해당 채팅방의 나 외의 사용자)
    const receiver = await db.user.findFirst({
      where: {
        product_chat_rooms: { some: { id: chatRoomId } },
        NOT: { id: senderId },
      },
      select: {
        id: true,
        username: true,
        notification_preferences: true,
        avatar: true,
      },
    });

    // 4단계: 알림 수신 설정이 켜져 있을 경우
    if (receiver?.notification_preferences?.chat) {
      // 알림 생성 (DB에 저장)
      const notification = await db.notification.create({
        data: {
          userId: receiver.id,
          title: "새 메시지",
          body: `${message.user.username}님이 메시지를 보냈습니다: ${payload.slice(0, 20)}${payload.length > 20 ? "..." : ""}`,
          type: "CHAT",
          link: `/chats/${chatRoomId}`,
          image: message.user.avatar || "",
          isPushSent: false,
        },
      });

      // Supabase 알림 브로드캐스트
      await supabase.channel("notifications").send({
        type: "broadcast",
        event: "notification",
        payload: {
          userId: receiver.id,
          title: notification.title,
          body: notification.body,
          link: notification.link,
          type: notification.type,
        },
      });

      // 푸시 알림 전송
      sendPushNotification({
        targetUserId: receiver.id,
        title: notification.title,
        message: notification.body,
        url: notification.link || "",
        type: "CHAT",
      }).then(async (result) => {
        if (result.success) {
          await db.notification.update({
            where: { id: notification.id },
            data: { isPushSent: true, sentAt: new Date() },
          });
        }
      });
    }

    // 최종 응답 반환
    return { success: true, message };
  } catch (error) {
    console.error("saveMessage 실패:", error);
    return { success: false, error: "메시지 전송에 실패했습니다." };
  }
}
