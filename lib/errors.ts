/**
 * File Name : lib/errors
 * Description : Prisma 등 런타임 에러 판별 유틸 모음
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2025.12.22  임도헌   Created    P2002 Unique 에러 가드 유틸 추가
 * 2025.12.23  임도헌   Modified   meta.target 정규화(배열/문자열) 처리 보강
 */

import { Prisma } from "@/generated/prisma/client";

/**
 * Prisma Unique Constraint Error(P2002) 여부 판정
 * - fields 미지정: P2002면 true
 * - fields 지정: meta.target(배열/문자열)에 모든 필드가 포함되면 true
 */
export function isUniqueConstraintError(
  err: unknown,
  fields?: string[]
): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code !== "P2002") return false;

  if (!fields?.length) return true;

  const targetRaw = (err.meta as any)?.target;

  // target은 보통 string[]로 오지만, 드물게 string일 수도 있음
  const targets: string[] = Array.isArray(targetRaw)
    ? targetRaw.map(String)
    : typeof targetRaw === "string"
      ? [targetRaw]
      : [];

  if (!targets.length) return false;

  // 배열이면 exact includes, 문자열이면 부분 includes 로 매칭될 수 있음(방어적)
  return fields.every((f) => targets.some((t) => t.includes(f)));
}
