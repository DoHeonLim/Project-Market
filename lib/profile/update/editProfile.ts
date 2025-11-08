/**
 * File Name : lib/profile/update/editProfile
 * Description : 프로필 수정 서버 액션(폼 제출 처리)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status     Description
 * 2024.11.25  임도헌   Created    app/(tabs)/profile/edit/actions 안 EditProfile 최초 구현
 * 2025.10.08  임도헌   Moved      actions → lib/profile/edit 로 분리(editProfile)
 * 2025.10.08  임도헌   Modified   schema 경로 변경, 소셜 로그인 분기/비밀번호 처리 유지
 * 2025.10.31  임도헌   Modified   P2002(Unique) 처리 + 필드 에러 반환 + 태그/경로 재검증
 */

"use server";

import db from "@/lib/db";
import bcrypt from "bcrypt";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  profileEditFormSchema,
  type ProfileEditType,
} from "@/lib/profile/form/profileEditFormSchema";
import { getCurrentUserForProfileEdit } from "@/lib/user/getCurrentUserForProfileEdit";
import { Prisma } from "@prisma/client";

export type EditProfileActionResult =
  | { success: true }
  | {
      success: false;
      errors: {
        fieldErrors?: Record<string, string[]>;
        formErrors?: string[];
      };
    }
  | void; // redirect("/profile") 는 throw되어 보통 void로 취급

export type EditProfileAction = (
  formData: FormData
) => Promise<EditProfileActionResult>;

export async function editProfile(formData: FormData) {
  const current = await getCurrentUserForProfileEdit();
  if (!current) {
    // 페이지에서 세션 가드가 있지만 방어적으로 한 번 더
    return { success: false, errors: { formErrors: ["로그인이 필요합니다."] } };
  }

  // FormData 수집
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    avatar: formData.get("avatar"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // 스키마 검증
  const schema = profileEditFormSchema(current.isSocialLogin);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  const updateData: ProfileEditType = {
    username: parsed.data.username,
    email: parsed.data.email,
    phone: parsed.data.phone,
    avatar: parsed.data.avatar,
  };

  if (current.needsPasswordSetup && parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  try {
    await db.user.update({
      where: { id: current.id },
      data: updateData,
    });
  } catch (e) {
    // Unique 제약 위반 등 처리
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      // meta.target 예: ['User_username_key'] 또는 ['User_email_key'] …
      const target = (e.meta?.target as string[] | undefined)?.[0] ?? "";
      const field = target.includes("username")
        ? "username"
        : target.includes("email")
          ? "email"
          : target.includes("phone")
            ? "phone"
            : null;

      if (field) {
        return {
          success: false,
          errors: {
            fieldErrors: {
              [field]: ["이미 사용 중입니다."],
            },
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

  // 캐시 재검증: 태그 + 경로
  revalidateTag(`user-profile-id-${current.id}`);
  revalidatePath("/profile");

  // 성공 시 이동
  redirect("/profile");
}
