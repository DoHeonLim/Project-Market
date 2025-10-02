/**
 * File Name : app/403/page
 * Description : 접근 권한 거부 안내 페이지
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.09  임도헌   Created   403 전용 페이지
 * 2025.09.06  임도헌   Created   reason/username/next/sid에 따라 CTA 제공 (비번 언락 지원)
 */

import AccessDeniedClient from "@/components/stream/AccessDeniedClient";

export default function AccessDeniedPage({
  searchParams,
}: {
  searchParams: {
    reason?: "PRIVATE" | "FOLLOWERS_ONLY" | "UNKNOWN";
    username?: string;
    next?: string;
    sid?: string; // stream id
    uid?: string; // ← 방송 소유자 id
  };
}) {
  const reason = searchParams.reason ?? "UNKNOWN";
  const username = searchParams.username ?? "unknown";
  const next = searchParams.next ?? "/";
  const sid = Number(searchParams.sid ?? 0);
  const uid = Number(searchParams.uid ?? 0);

  return (
    <AccessDeniedClient
      reason={reason}
      username={username}
      next={next}
      streamId={Number.isFinite(sid) ? sid : undefined}
      ownerId={Number.isFinite(uid) ? uid : undefined}
    />
  );
}
