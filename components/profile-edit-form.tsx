/**
File Name : components/profile-edit-form
Description : 프로필 편집 폼 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 편집 폼 컴포넌트추가
2024.11.27  임도헌   Modified  GitHub 연동한 유저의 케이스 추가
2024.11.27  임도헌   Modified  checkDuplicates 유저 이름, 이메일 검증 코드 추가
2024.11.28  임도헌   Modified  스키마 위치 변경
2024.12.12  임도헌   Modified  스타일 수정
2025.04.10  임도헌   Modified  전화번호 인증 기능 추가
*/

"use client";

import { EyeIcon, EyeSlashIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { MAX_PHOTO_SIZE } from "@/lib/constants";
import Input from "@/components/input";
import Button from "@/components/button";
import Link from "next/link";
import {
  profileEditSchema,
  ProfileEditType,
} from "@/app/(tabs)/profile/schema";
import {
  EditProfile,
  getExistingUserEmail,
  getExistingUsername,
  getUploadUrl,
  sendPhoneVerification,
  verifyPhoneToken,
} from "@/app/(tabs)/profile/edit/actions";

interface IuserProps {
  user: {
    username: string;
    email: string | null;
    password: string | null;
    avatar: string | null;
    phone: string | null;
    id: number;
    github_id: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

export default function ProfileEditForm({ user }: IuserProps) {
  // 소셜 로그인 여부
  const isSocialLogin = (!!user.github_id && !!!user.email) || (!!user.phone && !!!user.email);

  // 패스워드 입력 시 보이게 하는 토글 버튼
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 미리보기 이미지
  const [preview, setPreview] = useState("");
  // 클라우드 플레어 이미지 업로드 URL
  const [uploadUrl, setUploadUrl] = useState("");
  // 이미지 파일
  const [file, setFile] = useState<File | null>(null);
  // 기존 이미지 경로 관리
  const [currentPhoto, setCurrentPhoto] = useState(user.avatar);

  // 전화번호 인증 관련 상태
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneToken, setPhoneToken] = useState("");
  const [phoneVerificationError, setPhoneVerificationError] = useState("");
  const [originalPhone] = useState(user.phone || "");

  //react hook form 사용
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<ProfileEditType>({
    resolver: zodResolver(profileEditSchema(isSocialLogin)),
    // 초깃값 세팅
    defaultValues: {
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    },
  });

  // 전화번호 입력값 감시
  const phoneValue = watch("phone");

  // 전화번호가 변경되었는지 확인
  useEffect(() => {
    if (phoneValue !== originalPhone) {
      setPhoneVerified(false);
      setPhoneVerificationSent(false);
    } else {
      setPhoneVerified(true);
      setPhoneVerificationSent(false);
    }
  }, [phoneValue, originalPhone]);

  // 유저의 프로필 사진이 존재할 경우 프로필 사진 url 세팅
  useEffect(() => {
    if (user.avatar) {
      setPreview(user.avatar + "/public");
      setCurrentPhoto(user.avatar);
      setValue("avatar", user.avatar);
    }
  }, [user.avatar, setValue]);

  // 패스워드 보이게 하는 함수
  const handlePasswordToggle = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setShowPassword((prev) => !prev);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  // 이미지 세팅 함수
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    const file = files[0];

    // 이미지 크기 제한 검사
    if (file.size > MAX_PHOTO_SIZE) {
      alert("이미지는 3MB 이하로 올려주세요.");
      event.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    // 미리보기 세팅
    setPreview(url);
    // 이미지 파일 세팅
    setFile(file);
    // 클라우드 플레어 업로드 이미지 링크 가져오기
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setValue(
        "avatar",
        `https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/${id}`
      );
    }
  };
  // 폼 리셋
  const reset = () => {
    setPreview("");
    setFile(null);
    setValue("avatar", "");
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // 전화번호 인증 코드 전송
  const handleSendVerification = async () => {
    if (!phoneValue) {
      setPhoneVerificationError("전화번호를 입력해주세요.");
      return;
    }

    try {
      const result = await sendPhoneVerification(phoneValue);
      if (result.success) {
        setPhoneVerificationSent(true);
        setPhoneVerificationError("");
      } else {
        setPhoneVerificationError(
          result.error || "인증 코드 전송에 실패했습니다."
        );
      }
    } catch {
      setPhoneVerificationError("인증 코드 전송 중 오류가 발생했습니다.");
    }
  };

  // 전화번호 인증 코드 확인
  const handleVerifyToken = async () => {
    if (!phoneToken) {
      setPhoneVerificationError("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const result = await verifyPhoneToken(phoneValue || "", phoneToken);
      if (result.success) {
        setPhoneVerified(true);
        setPhoneVerificationError("");
      } else {
        setPhoneVerificationError(result.error || "인증에 실패했습니다.");
      }
    } catch {
      setPhoneVerificationError("인증 중 오류가 발생했습니다.");
    }
  };

  // username과 email 중복 체크 함수
  const checkDuplicates = async (
    data: ProfileEditType,
    currentUserId: number
  ) => {
    const errors: FieldErrors<ProfileEditType> = {}; // 초기화

    // username 중복 체크
    const existingUsername = await getExistingUsername(data.username);

    // 현재 유저의 이름을 제외한 다른 유저의 이름과 같을 경우
    if (existingUsername && existingUsername.id !== currentUserId) {
      errors.username = {
        message: "이미 존재하는 유저명입니다.",
        type: "manual", // 오류 타입 추가
      };
    }
    // email 중복 체크
    if (data.email) {
      const existingEmail = await getExistingUserEmail(data.email);
      // 현재 유저의 이메일을 제외한 다른 유저의 이메일과 같을 경우
      if (existingEmail && existingEmail.id !== currentUserId) {
        errors.email = {
          message: "이미 존재하는 이메일입니다.",
          type: "manual", // 오류 타입 추가
        };
      }
    }
    return errors; // 오류 객체 반환
  };

  const onSubmit = handleSubmit(async (data: ProfileEditType) => {
    // 전화번호가 변경되었는데 인증이 되지 않은 경우
    if (data.phone && data.phone !== originalPhone && !phoneVerified) {
      setError("phone", {
        type: "manual",
        message: "전화번호 인증이 필요합니다.",
      });
      return;
    }

    const duplicateErrors = await checkDuplicates(data, user.id);

    if (duplicateErrors && Object.keys(duplicateErrors).length > 0) {
      // 중복 오류가 있을 경우, 각 필드에 대해 setError를 사용하여 오류 설정
      Object.keys(duplicateErrors).forEach((field) => {
        const error = duplicateErrors[field as keyof ProfileEditType];
        if (error) {
          setError(field as keyof ProfileEditType, {
            type: "manual",
            message: error.message,
          });
        }
      });
      return; // 오류가 있으면 폼 제출을 중단
    }
    // 새 이미지가 있는 경우에만 업로드
    if (file) {
      //클라우드 플레어에 이미지 업로드
      const cloudflareForm = new FormData();
      cloudflareForm.append("file", file);
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: cloudflareForm,
      });
      if (response.status !== 200) {
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    } else {
      // 이미지가 변경되지 않았다면 기존 이미지 경로 사용
      data.avatar = currentPhoto;
    }
    // 이미지가 업로드 되면 formData의 photo를 교체
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email ?? "");
    formData.append("phone", data.phone ?? "");
    formData.append("avatar", data.avatar ?? "");
    if (isSocialLogin && !(user.email && user.password)) {
      formData.append("password", data.password ?? "");
      formData.append("confirmPassword", data.confirmPassword ?? "");
    }

    // editProduct를 리턴한다.
    return EditProfile(formData);
  });

  const onValid = async () => {
    await onSubmit();
  };
  return (
    <div>
      <span className="flex justify-center mt-4 text-2xl font-semibold">
        프로필 수정
      </span>
      <form action={onValid} className="flex flex-col p-5">
        <label htmlFor="username" className="my-2">
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        {isSocialLogin && (
          <span className="text-lg text-rose-500 my-2">
            소셜 또는 SMS 연동 유저는 초기에 이메일과 패스워드 설정을 완료해야
            됩니다.
          </span>
        )}

        <label htmlFor="email" className="my-2">
          선원 이메일
        </label>
        <Input
          id="email"
          type="email"
          placeholder={"선원 이메일"}
          {...register("email")}
          errors={[errors.email?.message ?? ""]}
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
        {isSocialLogin && (
          <>
            <label htmlFor="password" className="my-2">
              비밀 항해 코드
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="소문자, 대문자, 숫자, 특수문자를 포함해야 합니다."
                {...register("password")}
                errors={[errors.password?.message ?? ""]}
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
              <button
                type="button"
                onClick={() => handlePasswordToggle("password")}
                className="absolute right-3 top-5 transform -translate-y-1/2 text-neutral-200"
              >
                {showPassword ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeSlashIcon className="size-4" />
                )}
              </button>
            </div>

            <label htmlFor="confirmPassword" className="my-2">
              비밀 항해 코드 확인
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀 항해 코드 확인"
                {...register("confirmPassword")}
                errors={[errors.confirmPassword?.message ?? ""]}
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
              <button
                type="button"
                onClick={() => handlePasswordToggle("confirmPassword")}
                className="absolute right-3 top-5 transform -translate-y-1/2 text-neutral-200"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeSlashIcon className="size-4" />
                )}
              </button>
            </div>
          </>
        )}

        <span className="flex justify-center font-semibold text-md mt-4">
          선택사항
        </span>
        <label htmlFor="phone" className="my-2">
          전화번호 (선택사항)
        </label>
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">
            <Input
              id="phone"
              type="text"
              className="gap-0"
              placeholder="선원 연락처(phone) 01012345678"
              {...register("phone")}
              errors={[errors.phone?.message ?? ""]}
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
            />
            {phoneValue && phoneValue !== originalPhone && !phoneVerified && (
              <button
                type="button"
                onClick={handleSendVerification}
                className="w-1/3 px-4 py-2 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
              />
              <button
                type="button"
                onClick={handleVerifyToken}
                className="w-1/3 px-4 py-2 text-white text-xs bg-green-500 rounded-md hover:bg-green-600"
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

        <div className="flex justify-center">
          <label
            htmlFor="photo"
            className="flex flex-col items-center justify-center w-1/2 m-3 bg-center bg-cover border-2 border-dashed rounded-full cursor-pointer aspect-square text-neutral-300 border-neutral-300"
            style={{ backgroundImage: `url(${preview})` }}
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
          <input
            onChange={handleImageChange}
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            className="hidden"
          />
        </div>

        <Button text="수정 완료" />
        <div className="flex gap-2 mt-2">
          <button
            type="reset"
            onClick={reset}
            className="flex items-center justify-center flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md px-auto hover:bg-indigo-400"
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
