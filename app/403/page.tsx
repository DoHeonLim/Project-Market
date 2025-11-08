/**
 * File Name : app/403/page
 * Description : 접근 권한 거부 안내 페이지
 * Author : 임도헌
 *
 * History
 * 2025.08.09  임도헌   Created   403 전용 페이지
 * 2025.09.06  임도헌   Created   reason/username/next/sid에 따라 CTA 제공 (비번 언락 지원)
 * 2025.11.01  임도헌   Modified  next → callbackUrl 통일(하위호환: next도 허용)
 */

import AccessDeniedClient from "@/components/stream/AccessDeniedClient";

export default function AccessDeniedPage({
  searchParams,
}: {
  searchParams: {
    reason?: "PRIVATE" | "FOLLOWERS_ONLY" | "UNKNOWN";
    username?: string;
    next?: string; // ← 과거 링크 하위 호환
    callbackUrl?: string; // ← 신규 표준
    sid?: string; // stream id
    uid?: string; // 방송 소유자 id
  };
}) {
  const reason = searchParams.reason ?? "UNKNOWN";
  const username = searchParams.username ?? "unknown";

  // 하위 호환: ?callbackUrl= 가 우선, 없으면 ?next=, 둘 다 없으면 '/'
  const callbackUrl = searchParams.callbackUrl ?? searchParams.next ?? "/";

  const sid = Number(searchParams.sid ?? 0);
  const uid = Number(searchParams.uid ?? 0);

  return (
    <AccessDeniedClient
      reason={reason}
      username={username}
      callbackUrl={callbackUrl}
      streamId={Number.isFinite(sid) ? sid : undefined}
      ownerId={Number.isFinite(uid) ? uid : undefined}
    />
  );
}
