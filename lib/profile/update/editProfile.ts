/**
 * File Name : lib/profile/update/editProfile
 * Description : 프로필 수정 서버 액션(폼 제출 처리) - phone은 인증 API에서만 변경
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.11.25  임도헌   Created    app/(tabs)/profile/edit/actions 안 EditProfile 최초 구현
 * 2025.10.08  임도헌   Moved      actions → lib/profile/edit 로 분리(editProfile)
 * 2025.10.31  임도헌   Modified   P2002(Unique) 처리 + 필드 에러 반환 + 태그/경로 재검증
 * 2025.12.09  임도헌   Modified   profileEditFormSchema 옵션(needsPasswordSetup) 반영
 * 2025.12.13  임도헌   Modified   email은 최초 세팅(needsEmailSetup) 때만, phone은 인증 API에서만 변경
 * 2025.12.22  임도헌   Modified   Prisma 에러 가드 유틸로 변경
 * 2025.12.23  임도헌   Modified   P2002 meta.target(배열/문자열) 기반 필드 판별 안정화
 */

"use server";

import db from "@/lib/db";
import bcrypt from "bcrypt";
import * as T from "@/lib/cache/tags";
import { revalidatePath, revalidateTag } from "next/cache";
import { profileEditFormSchema } from "@/lib/profile/form/profileEditFormSchema";
import { getCurrentUserForProfileEdit } from "@/lib/user/getCurrentUserForProfileEdit";
import { Prisma } from "@/generated/prisma/client";
import { normalizeUsername } from "@/lib/user/normalizeUsername";
import { isUniqueConstraintError } from "@/lib/errors";

export type EditProfileActionResult =
  | { success: true }
  | {
      success: false;
      errors?: {
        fieldErrors?: Record<string, string[]>;
        formErrors?: string[];
      };
    };

export type EditProfileAction = (
  formData: FormData
) => Promise<EditProfileActionResult>;

function normalizeFieldErrors(fieldErrors: unknown): Record<string, string[]> {
  if (!fieldErrors || typeof fieldErrors !== "object") return {};
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(fieldErrors as Record<string, unknown>)) {
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      v.every((x) => typeof x === "string")
    ) {
      out[k] = v as string[];
    }
  }
  return out;
}

/**
 * P2002 meta.target에서 충돌 필드를 안정적으로 추출
 * - target은 보통 string[]이나, 드물게 string/인덱스명 문자열 형태로도 올 수 있음
 */
function extractUniqueFieldFromP2002(
  e: unknown
): "username" | "email" | "phone" | null {
  const targetRaw = (e as any)?.meta?.target;

  const targets: string[] = Array.isArray(targetRaw)
    ? targetRaw.map((x) => String(x))
    : typeof targetRaw === "string"
      ? [targetRaw]
      : [];

  const lowered = targets.map((t) => t.toLowerCase());

  const has = (key: string) => lowered.some((t) => t.includes(key));

  if (has("username")) return "username";
  if (has("email")) return "email";
  if (has("phone")) return "phone";
  return null;
}

export async function editProfile(
  formData: FormData
): Promise<EditProfileActionResult> {
  const current = await getCurrentUserForProfileEdit();
  if (!current) {
    return { success: false, errors: { formErrors: ["로그인이 필요합니다."] } };
  }

  const data = {
    username: formData.get("username"),
    email: current.needsEmailSetup ? formData.get("email") : current.email,
    avatar: formData.get("avatar"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),

    // 서버는 phone 업데이트를 안 하지만, schema 통과를 위해 "현재 phone"을 넣는다.
    phone: current.phone ?? null,
  };

  const schema = profileEditFormSchema({
    needsEmailSetup: current.needsEmailSetup,
    needsPasswordSetup: current.needsPasswordSetup,
    hasVerifiedPhone: !!current.phone, // DB에 phone 있으면 삭제 금지 상태
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      success: false,
      errors: {
        formErrors: flat.formErrors,
        fieldErrors: normalizeFieldErrors(flat.fieldErrors),
      },
    };
  }

  // username 태그 무효화를 위해 update 전/후 값을 확보 (normalizeUsername 사용)
  const oldUsernameKey = normalizeUsername(current.username);
  const newUsernameKey = normalizeUsername(parsed.data.username);

  // DB 저장용: decode 없이 canonicalize
  const usernameForDb = parsed.data.username
    .trim()
    .toLowerCase()
    .normalize("NFC");

  const updateData: Prisma.UserUpdateInput = {
    username: usernameForDb,
    avatar: parsed.data.avatar,
  };

  // 이메일은 "없을 때만(needsEmailSetup)" 최초 1회 설정
  if (current.needsEmailSetup && parsed.data.email) {
    updateData.email = parsed.data.email;
    updateData.emailVerified = false; // 최초 세팅은 미인증으로 고정
  }

  // 비밀번호는 "없을 때만(needsPasswordSetup)" 최초 1회 설정
  if (current.needsPasswordSetup && parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  try {
    await db.user.update({
      where: { id: current.id },
      data: updateData,
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      let field = extractUniqueFieldFromP2002(e);

      if (!field) {
        const checks: Array<
          Promise<["username" | "email" | "phone", boolean]>
        > = [];

        // username은 항상 업데이트 대상
        checks.push(
          db.user
            .findFirst({
              where: { username: usernameForDb, NOT: { id: current.id } },
              select: { id: true },
            })
            .then((u) => ["username", !!u])
        );

        // email은 needsEmailSetup일 때만 업데이트 대상
        if (current.needsEmailSetup && parsed.data.email) {
          checks.push(
            db.user
              .findFirst({
                where: { email: parsed.data.email, NOT: { id: current.id } },
                select: { id: true },
              })
              .then((u) => ["email", !!u])
          );
        }

        const results = await Promise.all(checks);
        const hit = results.find(([, ok]) => ok);
        if (hit) field = hit[0];
      }

      if (field) {
        return {
          success: false,
          errors: {
            fieldErrors: { [field]: ["이미 사용 중입니다."] },
            formErrors: [],
          },
        };
      }

      return {
        success: false,
        errors: { formErrors: ["이미 사용 중인 값이 있습니다."] },
      };
    }

    console.error("[editProfile]", e);
    return {
      success: false,
      errors: { formErrors: ["알 수 없는 오류가 발생했습니다."] },
    };
  }

  revalidateTag(T.USER_CORE_ID(current.id));
  revalidateTag(T.USER_BADGES_ID(current.id));

  // username → id 얇은 캐시 무효화 (변경 전/후 둘 다)
  revalidateTag(T.USER_USERNAME_ID(oldUsernameKey));
  if (newUsernameKey !== oldUsernameKey) {
    revalidateTag(T.USER_USERNAME_ID(newUsernameKey));
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");

  return { success: true };
}
