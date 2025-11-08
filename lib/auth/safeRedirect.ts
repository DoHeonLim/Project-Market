// lib/auth/safeRedirect.ts
export function sanitizeCallbackUrl(raw: unknown): string {
  const val = typeof raw === "string" ? raw : "";
  if (!val) return "/";

  // 외부/절대 URL 차단
  if (/^https?:\/\//i.test(val)) return "/";
  // network-path 차단 (//evil.com)
  if (val.startsWith("//")) return "/";
  // 내부 경로만 허용
  if (!val.startsWith("/")) return "/";

  try {
    const dec = decodeURIComponent(val);
    if (/^https?:\/\//i.test(dec)) return "/";
    if (dec.startsWith("//")) return "/";
    if (!dec.startsWith("/")) return "/";
    return dec || "/";
  } catch {
    return "/";
  }
}
