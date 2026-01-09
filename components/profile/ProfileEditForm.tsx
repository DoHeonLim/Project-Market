/**
 * File Name : components/profile/ProfileEditForm
 * Description : 프로필 편집 폼 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.25  임도헌   Created
 * 2024.11.25  임도헌   Modified  프로필 편집 폼 컴포넌트추가
 * 2024.11.27  임도헌   Modified  GitHub 연동한 유저의 케이스 추가
 * 2024.11.28  임도헌   Modified  스키마 위치 변경
 * 2024.12.12  임도헌   Modified  스타일 수정
 * 2025.04.10  임도헌   Modified  전화번호 인증 기능 추가
 * 2025.10.08  임도헌   Modified  휴대폰 인증 로직 lib로 분리(sendProfilePhoneToken/verifyProfilePhoneToken)
 * 2025.12.12  임도헌   Modified  passwordToggle(Input) 도입 + submitting 가드 강화 + 전화번호 상태 원복 로직 보강
 * 2025.12.13  임도헌   Modified  phone은 인증 API에서만 변경, 인증 성공 시 router.refresh 제거(작성 중 내용 보호) + 안내 문구 추가
 * 2025.12.14  임도헌   Modified  phone 삭제 방지 UX 개선: onChange 즉시 차단 → onBlur에서만 원복 처리
 * 2025.12.14  임도헌   Modified  phone 정규화(trim) 및 resetForm이 originalPhone 기준으로 동작하도록 수정
 * 2025.12.23  임도헌   Modified  아바타 삭제 기능 및 UI 추가
 * 2025.12.23  임도헌   Modified  아바타 영역 레이아웃(w-1/2 기준 붕괴) 수정 + preview 없을 때 backgroundImage 제거
 * 2025.12.23  임도헌   Modified  window.confirm 제거 → ConfirmDialog 공용 모달로 변경
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MAX_PHOTO_SIZE } from "@/lib/constants";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Link from "next/link";

import {
  profileEditFormSchema,
  type ProfileEditType,
} from "@/lib/profile/form/profileEditFormSchema";
import { getUploadUrl } from "@/lib/cloudflare/getUploadUrl";
import { sendProfilePhoneToken } from "@/lib/user/phone/sendProfilePhoneToken";
import { verifyProfilePhoneToken } from "@/lib/user/phone/verifyProfilePhoneToken";
import type {
  EditProfileAction,
  EditProfileActionResult,
} from "@/lib/profile/update/editProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface ProfileEditFormProps {
  user: {
    id: number;
    username: string;
    email: string | null;
    avatar: string | null;
    phone: string | null;
    github_id: string | null;
    created_at: Date;
    updated_at: Date;
    emailVerified: boolean;

    needsEmailSetup: boolean;
    needsPasswordSetup: boolean;
  };
  action: EditProfileAction;
}

export default function ProfileEditForm({
  user,
  action,
}: ProfileEditFormProps) {
  const router = useRouter();

  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(user.avatar);

  // phone 인증 UI 상태(※ DB phone 변경은 verifyProfilePhoneToken이 담당)
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(!!user.phone);
  const [phoneToken, setPhoneToken] = useState("");
  const [phoneVerificationError, setPhoneVerificationError] = useState("");

  // "현재 기준(원본)" phone: 인증 성공 시 즉시 갱신해서 가드 안정화
  const [originalPhone, setOriginalPhone] = useState((user.phone || "").trim());

  const [submitting, setSubmitting] = useState(false);

  // confirm dialog state (avatar remove)
  const [avatarConfirmOpen, setAvatarConfirmOpen] = useState(false);
  const closeAvatarConfirm = () => setAvatarConfirmOpen(false);

  // schema/resolver는 옵션 변화(특히 originalPhone 변화)에 반응하도록 memo
  const schema = useMemo(
    () =>
      profileEditFormSchema({
        needsEmailSetup: user.needsEmailSetup,
        needsPasswordSetup: user.needsPasswordSetup,
        hasVerifiedPhone: !!originalPhone, // DB에 phone이 있으면 "삭제 금지" 상태
      }),
    [user.needsEmailSetup, user.needsPasswordSetup, originalPhone]
  );

  const resolver = useMemo(() => zodResolver(schema), [schema]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset: rhfReset,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileEditType>({
    resolver,
    defaultValues: {
      username: user.username,
      email: user.email ?? "",
      phone: (user.phone ?? "").trim(),
      avatar: user.avatar,
      password: null,
      confirmPassword: null,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const phoneValue = watch("phone");
  const normalizedPhone = (phoneValue || "").trim();
  const avatarValue = watch("avatar");

  // 아바타 존재 여부(삭제 버튼 노출 판단)
  const hasAnyAvatar = !!currentPhoto || preview !== "" || !!avatarValue;

  // 전화번호 변경/원복 감지
  useEffect(() => {
    if (normalizedPhone === originalPhone) {
      setPhoneVerified(!!originalPhone);
      setPhoneVerificationSent(false);
      setPhoneToken("");
      setPhoneVerificationError("");
      return;
    }

    // 바뀐 순간에는 다시 인증 필요
    setPhoneVerified(false);
    setPhoneVerificationSent(false);
  }, [normalizedPhone, originalPhone]);

  // preview가 blob url일 때 revoke
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 기존 아바타 세팅
  useEffect(() => {
    if (user.avatar) {
      setPreview(user.avatar + "/public");
      setCurrentPhoto(user.avatar);
      setValue("avatar", user.avatar);
    } else {
      setPreview("");
      setCurrentPhoto(null);
      setValue("avatar", null);
    }
  }, [user.avatar, setValue]);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/")) {
      setError("avatar", {
        type: "manual",
        message: "이미지 파일만 업로드할 수 있습니다.",
      });
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_PHOTO_SIZE) {
      setError("avatar", {
        type: "manual",
        message: "이미지는 3MB 이하로 올려주세요.",
      });
      event.target.value = "";
      return;
    }

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    const url = URL.createObjectURL(nextFile);
    setPreview(url);
    setFile(nextFile);

    const res = await getUploadUrl();
    if (!res.success) {
      URL.revokeObjectURL(url);
      setPreview(user.avatar ? user.avatar + "/public" : "");
      setFile(null);
      setUploadUrl("");
      setValue("avatar", user.avatar ?? null);

      setError("avatar", {
        type: "manual",
        message: res.error ?? "업로드 URL을 가져오지 못했습니다.",
      });

      event.target.value = "";
      return;
    }

    const { id, uploadURL } = res.result;
    setUploadUrl(uploadURL);
    setValue(
      "avatar",
      `https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/${id}`
    );
  };

  // ConfirmDialog 열기만 담당 (실제 삭제는 onConfirm에서)
  const requestClearAvatar = () => {
    if (submitting) return;
    if (!hasAnyAvatar) return;
    setAvatarConfirmOpen(true);
  };

  // 실제 아바타 제거 동작
  const confirmClearAvatar = () => {
    if (submitting) return;

    // blob preview라면 해제
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    setPreview("");
    setFile(null);
    setUploadUrl("");
    setCurrentPhoto(null);

    // RHF 값도 명시적으로 null로
    setValue("avatar", null, { shouldValidate: true, shouldDirty: true });
    clearErrors("avatar");

    // 파일 인풋도 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";

    closeAvatarConfirm();
    toast.success("🧹 아바타를 제거했습니다. 수정 완료를 눌러 저장하세요.");
  };

  const resetForm = () => {
    // 인증 성공 후 router.refresh()를 안 하므로, reset 기준은 user.phone이 아니라 originalPhone
    const basePhone = originalPhone;

    rhfReset({
      username: user.username,
      email: user.email ?? "",
      phone: basePhone,
      avatar: user.avatar,
      password: null,
      confirmPassword: null,
    });

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(user.avatar ? user.avatar + "/public" : "");
    setFile(null);
    setUploadUrl("");
    setCurrentPhoto(user.avatar);

    if (fileInputRef.current) fileInputRef.current.value = "";

    setPhoneVerificationSent(false);
    setPhoneToken("");
    setPhoneVerificationError("");
    setPhoneVerified(!!basePhone);
    setAvatarConfirmOpen(false);
  };

  const handleSendVerification = async () => {
    const normalized = (phoneValue || "").trim();
    if (!normalized) {
      setPhoneVerificationError("전화번호를 입력해주세요.");
      return;
    }

    try {
      const form = new FormData();
      form.append("phone", normalized);

      const res = await sendProfilePhoneToken(form);
      if (res.success) {
        setPhoneVerificationSent(true);
        setPhoneVerificationError("");
      } else {
        setPhoneVerificationError(
          res.error || "인증 코드 전송에 실패했습니다."
        );
      }
    } catch {
      setPhoneVerificationError("인증 코드 전송 중 오류가 발생했습니다.");
    }
  };

  const handleVerifyToken = async () => {
    if (!phoneToken) {
      setPhoneVerificationError("인증 코드를 입력해주세요.");
      return;
    }

    const normalized = (phoneValue || "").trim();
    if (!normalized) {
      setPhoneVerificationError("전화번호를 입력해주세요.");
      return;
    }

    try {
      const form = new FormData();
      form.append("phone", normalized);
      form.append("token", phoneToken);

      const res = await verifyProfilePhoneToken(form);
      if (res.success) {
        setPhoneVerified(true);
        setPhoneVerificationSent(false);
        setPhoneToken("");
        setPhoneVerificationError("");

        // 인증 성공 즉시 "원본" 갱신 + 폼 값도 정규화해서 흔들림 방지
        setOriginalPhone(normalized);
        setValue("phone", normalized, {
          shouldValidate: true,
          shouldDirty: false,
        });

        // 여기서 router.refresh()는 하지 않는다 (작성 중 폼 보호)
        toast.success("📱 전화번호 인증 완료! (인증 즉시 저장됨)");
      } else {
        setPhoneVerificationError(res.error || "인증에 실패했습니다.");
      }
    } catch {
      setPhoneVerificationError("인증 중 오류가 발생했습니다.");
    }
  };

  const onValid = async (data: ProfileEditType) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const normalized = (data.phone || "").trim();

      // 사용자가 phone을 변경해둔 상태면, 인증 없이는 저장(프로필 수정) 불가
      // (어차피 editProfile이 phone을 안 바꾸지만, UX 혼란 방지용 가드)
      if (normalized && normalized !== originalPhone && !phoneVerified) {
        setError("phone", {
          type: "manual",
          message: "전화번호 인증이 필요합니다.",
        });
        return;
      }

      if (file && !uploadUrl) {
        setError("avatar", {
          type: "manual",
          message: "이미지 업로드 준비 중입니다. 잠시 후 다시 시도해주세요.",
        });
        return;
      }

      if (file) {
        const cloudflareForm = new FormData();
        cloudflareForm.append("file", file);
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: cloudflareForm,
        });
        if (!response.ok) {
          setError("avatar", {
            type: "manual",
            message: "이미지 업로드에 실패했습니다.",
          });
          return;
        }
      } else {
        data.avatar = currentPhoto;
      }

      const fd = new FormData();
      fd.append("username", data.username);

      // email/password는 "최초 세팅 필요"일 때만 전송
      if (user.needsEmailSetup) fd.append("email", data.email ?? "");
      if (user.needsPasswordSetup) {
        if (data.password) fd.append("password", data.password);
        if (data.confirmPassword)
          fd.append("confirmPassword", data.confirmPassword);
      }

      // phone은 editProfile에서 다루지 않으므로 전송하지 않는다.
      fd.append("avatar", data.avatar ?? "");

      const result = (await action(fd)) as EditProfileActionResult;

      if (result?.success === false && result.errors) {
        const formMsg = result.errors.formErrors?.[0];
        if (formMsg) toast.error(formMsg);

        Object.entries(result.errors.fieldErrors ?? {}).forEach(([k, arr]) => {
          const msg = Array.isArray(arr) ? arr[0] : undefined;
          if (msg) {
            setError(k as keyof ProfileEditType, {
              type: "server",
              message: msg,
            });
          }
        });
        return;
      }

      toast.success("✒️프로필 수정 완료!");
      router.replace("/profile");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = handleSubmit(onValid);
  const showSetupNotice = user.needsEmailSetup || user.needsPasswordSetup;

  // RHF register 핸들러와 합치기 위한 레지스터 핸들러 분리
  const phoneReg = register("phone");

  return (
    <div>
      {/* ConfirmDialog */}
      {avatarConfirmOpen && (
        <ConfirmDialog
          open
          title="아바타를 제거할까요?"
          description={
            <span>
              아바타를 제거하면 기본 이미지로 변경됩니다.
              <br />
              계속 진행할까요?
            </span>
          }
          confirmLabel="제거"
          cancelLabel="취소"
          onConfirm={confirmClearAvatar}
          onCancel={closeAvatarConfirm}
          loading={submitting}
        />
      )}

      <span className="flex justify-center mt-4 text-2xl font-semibold">
        프로필 수정
      </span>

      <form onSubmit={onSubmit} className="flex flex-col p-5" noValidate>
        <label htmlFor="username" className="my-2 dark:text-white">
          선원 닉네임
        </label>
        <Input
          id="username"
          type="text"
          required
          placeholder="선원 닉네임"
          {...register("username")}
          errors={[errors.username?.message ?? ""]}
          minLength={3}
          maxLength={10}
          aria-invalid={!!errors.username}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {showSetupNotice && (
          <span className="text-lg text-rose-500 my-2">
            소셜 또는 SMS 연동 유저는 초기에 이메일과 비밀 항해 코드를 설정해야
            됩니다.
          </span>
        )}

        {/* 이메일은 "없을 때만" 최초 1회 입력 가능 */}
        {user.needsEmailSetup ? (
          <>
            <label htmlFor="email" className="my-2 dark:text-white">
              선원 이메일(최초 설정)
            </label>
            <Input
              id="email"
              type="email"
              placeholder="선원 이메일"
              {...register("email")}
              errors={[errors.email?.message ?? ""]}
              aria-invalid={!!errors.email}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </>
        ) : (
          <>
            <label className="my-2 dark:text-white">선원 이메일</label>
            <div className="px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
              {user.email ?? "미설정"}
              <span className="ml-2 text-xs text-neutral-500">
                (이메일은 변경할 수 없습니다)
              </span>
            </div>
          </>
        )}

        {/* 비밀번호는 "없을 때만" 최초 1회 입력 가능 */}
        {user.needsPasswordSetup && (
          <>
            <label htmlFor="password" className="my-2 dark:text-white">
              비밀 항해 코드
            </label>
            <Input
              id="password"
              type="password"
              passwordToggle
              placeholder="소문자, 대문자, 숫자, 특수문자를 포함해야 합니다."
              {...register("password")}
              errors={[errors.password?.message ?? ""]}
              aria-invalid={!!errors.password}
              passwordToggleLabels={{
                show: "비밀번호 표시",
                hide: "비밀번호 숨기기",
              }}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              }
            />

            <label htmlFor="confirmPassword" className="my-2 dark:text-white">
              비밀 항해 코드 확인
            </label>
            <Input
              id="confirmPassword"
              type="password"
              passwordToggle
              placeholder="비밀 항해 코드 확인"
              {...register("confirmPassword")}
              errors={[errors.confirmPassword?.message ?? ""]}
              aria-invalid={!!errors.confirmPassword}
              passwordToggleLabels={{
                show: "비밀번호 확인 표시",
                hide: "비밀번호 확인 숨기기",
              }}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />
          </>
        )}

        <span className="flex justify-center font-semibold text-md dark:text-white mt-4">
          선택사항
        </span>

        <label htmlFor="phone" className="my-2 dark:text-white">
          전화번호 (선택사항)
        </label>

        {/* 안내 문구 */}
        <div className="mb-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <div>
            • 전화번호 변경은 <b>인증 완료 시점에 즉시 저장</b>됩니다.
          </div>
          <div>
            • <b>SMS 인증으로 등록된 전화번호는 삭제할 수 없습니다.</b>
          </div>
          <div>
            • 번호를 변경하려면 새 번호 입력 후 &quot;등대 신호 보내기 → 신호
            확인&quot;을 진행하세요.
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                id="phone"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                className="gap-0"
                placeholder="선원 연락처(phone) 01012345678"
                {...phoneReg}
                errors={[errors.phone?.message ?? ""]}
                aria-invalid={!!errors.phone}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
                onChange={(e) => {
                  phoneReg.onChange(e); // RHF 유지
                }}
                onBlur={(e) => {
                  phoneReg.onBlur(e); // RHF 유지

                  const v = e.target.value.trim();
                  if (!!originalPhone && v === "") {
                    setValue("phone", originalPhone, {
                      shouldValidate: true,
                      shouldDirty: false,
                    });
                    toast.error("SMS 인증된 전화번호는 삭제할 수 없습니다.");
                  } else if (v !== e.target.value) {
                    setValue("phone", v, {
                      shouldValidate: true,
                      shouldDirty: false,
                    });
                  }
                }}
              />
            </div>

            {normalizedPhone &&
              normalizedPhone !== originalPhone &&
              !phoneVerified && (
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={submitting}
                  className="w-1/3 px-4 py-2 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-60"
                >
                  💫 등대 신호 보내기
                </button>
              )}
          </div>

          {phoneVerificationSent && !phoneVerified && (
            <div className="flex items-center gap-2 mt-4">
              <Input
                type="text"
                placeholder="인증번호 6자리 입력"
                value={phoneToken}
                onChange={(e) => setPhoneToken(e.target.value)}
                errors={[phoneVerificationError]}
                aria-invalid={!!phoneVerificationError}
                inputMode="numeric"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleVerifyToken}
                disabled={submitting}
                className="w-1/3 px-4 py-2 text-white text-xs bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-60"
              >
                🔍 신호 확인
              </button>
            </div>
          )}

          {phoneVerified && (
            <div className="text-green-500 text-sm">
              ✓ 전화번호가 인증되었습니다.
            </div>
          )}
        </div>

        {/* 아바타 영역(UI 크기/정렬 안정화) */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center w-full">
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center
                         w-1/2 max-w-[220px] m-3
                         bg-center bg-cover border-2 border-dashed rounded-full
                         cursor-pointer aspect-square text-neutral-300 border-neutral-300"
              style={
                preview ? { backgroundImage: `url(${preview})` } : undefined
              }
            >
              {preview === "" ? (
                <>
                  <PhotoIcon aria-label="photo_input" className="w-20" />
                  <div className="text-sm text-neutral-400">
                    프로필 사진(선택사항)
                  </div>
                  <div className="text-sm text-rose-700">
                    {errors.avatar?.message}
                  </div>
                </>
              ) : null}
            </label>

            {/* 아바타 제거 버튼: 아바타가 있을 때만 노출 */}
            {hasAnyAvatar && (
              <button
                type="button"
                onClick={requestClearAvatar}
                disabled={submitting}
                className="mb-3 px-3 py-1 text-xs rounded-md
                           bg-neutral-200 hover:bg-neutral-300 text-neutral-800
                           dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-100
                           disabled:opacity-60"
                aria-label="아바타 제거"
              >
                아바타 제거
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            onChange={handleImageChange}
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            className="hidden"
          />
        </div>

        <Button
          text={submitting ? "수정 중..." : "수정 완료"}
          disabled={submitting}
        />

        <div className="flex gap-2 mt-2">
          <button
            type="reset"
            onClick={resetForm}
            disabled={submitting}
            className="flex items-center justify-center flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md px-auto hover:bg-indigo-400 disabled:opacity-60"
          >
            초기화
          </button>
          <Link
            className="flex items-center justify-center flex-1 h-10 font-semibold text-white transition-colors bg-rose-500 hover:bg-rose-600 dark:bg-rose-700 dark:hover:bg-rose-600 rounded-md px-auto"
            href="/profile"
          >
            뒤로가기
          </Link>
        </div>
      </form>
    </div>
  );
}
