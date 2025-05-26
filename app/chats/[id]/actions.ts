/**
File Name : app/chats/actions
Description : 제품 채팅 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.09  임도헌   Created
2024.11.09  임도헌   Modified  채팅 메시지 저장 추가
2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
2024.12.12  임도헌   Modified  message모델을 productMessage로 변경
2024.12.22  임도헌   Modified  채팅 메시지 웹 푸시 기능 추가
2024.12.26  임도헌   Modified  채팅방 제품 정보 추가
2025.01.12  임도헌   Modified  푸시 알림 시 채팅 유저 이미지 추가
2025.04.18  임도헌   Modified  checkQuickResponseBadge함수를 서버 액션으로 처리
2025.05.23  임도헌   Modified  카테고리 필드명 변경(name->kor_name)
2025.05.26  임도헌   Modified  .tsx -> .ts로 변경
*/

"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidateTag } from "next/cache";
import { sendPushNotification } from "@/lib/push-notification";
import { supabase } from "@/lib/supabase";
import { checkQuickResponseBadge } from "@/lib/check-badge-conditions";

export interface ChatMessage {
  id: number;
  payload: string;
  created_at: Date;
  userId: number;
  isRead: boolean;
  user: {
    username: string;
    avatar: string | null;
  };
}

export interface ChatRoom {
  id: string;
  product: {
    title: string;
    images: {
      url: string;
    }[];
  };
  users: {
    id: number;
  }[];
}

export type InitialChatMessages = ChatMessage[];

// 채팅방 찾고 해당 유저들인지 체크
export const getRoom = async (id: string) => {
  const room = await db.productChatRoom.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          game_type: true,
          images: {
            where: { order: 0 },
            select: { url: true },
            take: 1,
          },
          purchase_userId: true,
          reservation_userId: true,
          category: {
            select: {
              kor_name: true,
              icon: true,
              parent: {
                select: {
                  kor_name: true,
                  icon: true,
                },
              },
            },
          },
          min_players: true,
          max_players: true,
          play_time: true,
          condition: true,
          completeness: true,
          has_manual: true,
          search_tags: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (room) {
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id!));
    if (!canSee) {
      return null;
    }
  }
  return room;
};

// 채팅방의 모든 메시지를 가져오는 함수
export const getMessages = async (productChatRoomId: string) => {
  const messages = await db.productMessage.findMany({
    where: {
      productChatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      isRead: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages as ChatMessage[];
};

// 채팅방의 유저 정보
export const getUserProfile = async () => {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id!,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
};

export const saveMessage = async (
  payload: string,
  productChatRoomId: string
) => {
  "use server";

  const session = await getSession();

  try {
    // 1. 메시지 생성
    await db.productMessage.create({
      data: {
        payload,
        productChatRoomId,
        userId: session.id!,
      },
    });

    // 2. 수신자 정보 조회 (내가 아닌 사용자)
    const receiver = await db.user.findFirst({
      where: {
        product_chat_rooms: {
          some: { id: productChatRoomId },
        },
        NOT: { id: session.id! },
      },
      select: {
        id: true,
        username: true,
        notification_preferences: true,
        avatar: true,
      },
    });

    // 3. 알림 생성 및 푸시 알림 전송
    if (receiver?.notification_preferences?.chat) {
      // 알림 생성
      const notification = await db.notification.create({
        data: {
          userId: receiver.id,
          title: "새 메시지",
          body: `${receiver.username}님이 메시지를 보냈습니다: ${payload.slice(
            0,
            20
          )}${payload.length > 20 ? "..." : ""}`,
          type: "CHAT",
          link: `/chats/${productChatRoomId}`,
          image: receiver.avatar ? `${receiver.avatar}/public` : "",
          isPushSent: false,
        },
      });

      // 4. 알림 브로드캐스트 (즉시 실행)
      await Promise.all([
        // Supabase 브로드캐스트
        supabase.channel("notifications").send({
          type: "broadcast",
          event: "notification",
          payload: {
            userId: receiver.id,
            title: notification.title,
            body: notification.body,
            link: notification.link,
            type: notification.type,
          },
        }),

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
        }),
      ]);
    }

    revalidateTag("messages");
    revalidateTag("chatroom-list");

    return { success: true };
  } catch (error) {
    console.error("메시지 저장 중 오류 발생:", error);
    return { success: false, error: "메시지 전송에 실패했습니다." };
  }
};

export const readMessageUpdate = async (
  productChatRoomId: string,
  userId: number
) => {
  "use server";

  const updateMessage = await db.productMessage.updateMany({
    where: {
      productChatRoomId,
      isRead: false,
      // 내가 보낸 메시지는 업데이트 하지 않는다. 내가 아닌 유저가 보낸 메시지 일 경우에만 업데이트한다.
      NOT: {
        userId,
      },
    },
    data: {
      isRead: true,
    },
  });
  revalidateTag("chatroom-list");
  return updateMessage;
};

/**
 * web-push 라이브러리는 Node.js 환경에서만 동작
 * chat-messages-list는 클라이언트 컴포넌트인데 여기서 checkQuickResponseBadge함수를 직접 호출
 * checkQuickResponseBadge 함수는 내부적으로 sendPushNotification을 호출하는데 이 함수는 web-push 라이브러리를 사용
 * 클라이언트 컴포넌트에서 web-push 라이브러리를 사용하므로 에러가 생김
 * 이 때문에 server action으로 분리해서 사용하는 방식으로 해결
 **/
export async function checkQuickResponseBadgeAction(userId: number) {
  try {
    await checkQuickResponseBadge(userId);
    return { success: true };
  } catch (error) {
    console.error("뱃지 체크 중 오류:", error);
    return { success: false, error: "뱃지 체크 중 오류가 발생했습니다." };
  }
}
