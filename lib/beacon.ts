/**
 * File Name : lib/utils/beacon
 * Description : 언로드 시 신뢰도 높은 전송을 위한 유틸 (sendBeacon / fetch keepalive)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.23  임도헌   Created   sendBeacon 우선 + keepalive 폴백 유틸 추가(소용량/헤더 유연)
 */

export interface PostOnUnloadOptions {
  maxBytes?: number; // 기본 60KB
  contentType?: string; // 기본 application/json (빈 본문이면 생략)
}

/**
 * postOnUnload
 * - 같은 출처(same-origin)에서 페이지가 닫히거나 이동할 때도 전송을 최대한 보장
 * - 우선 navigator.sendBeacon 사용, 실패/미지원 시 fetch keepalive로 폴백
 * - payload가 크면(>maxBytes) 본문을 생략하여 전송 성공률을 높임
 */
export async function postOnUnload(
  url: string,
  payload?: unknown,
  opts: PostOnUnloadOptions = {}
): Promise<void> {
  const maxBytes = opts.maxBytes ?? 60 * 1024; // 60KB
  let bodyStr = "";

  if (payload !== undefined && payload !== null) {
    try {
      bodyStr = JSON.stringify(payload);
    } catch {
      // 직렬화 실패 시 본문 생략
      bodyStr = "";
    }
  }

  // 본문이 너무 크면 과감히 생략(언로드 신뢰도↑)
  if (bodyStr.length > maxBytes) {
    bodyStr = "";
  }

  // 1) sendBeacon 시도 (동일 출처를 가정)
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    try {
      // 헤더를 커스텀할 수 없어 text/plain 으로 전송
      const blob = new Blob([bodyStr], { type: "text/plain" });
      const queued = navigator.sendBeacon(url, blob);
      if (queued) return; // 큐에 성공적으로 올림
    } catch {
      // fallthrough to keepalive fetch
    }
  }

  // 2) keepalive fetch 폴백
  try {
    const headers =
      bodyStr.length > 0
        ? { "Content-Type": opts.contentType ?? "application/json" }
        : undefined; // 빈 본문이면 헤더 생략(서버 유연성↑)
    await fetch(url, {
      method: "POST",
      body: bodyStr.length > 0 ? bodyStr : undefined,
      headers,
      keepalive: true,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    // 마지막 시도 실패: 언로드 상황에서 재시도 여지 없음
  }
}
