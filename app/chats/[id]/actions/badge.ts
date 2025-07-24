/**
 * File Name : app/chats/[id]/actions/badge
 * Description : 채팅 메시지 뱃지 체크
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.21  임도헌   Created   app/chats/[id]/actions.ts 파일을 기능별로 분리
 */
"use server";
import { checkQuickResponseBadge } from "@/lib/check-badge-conditions";

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
