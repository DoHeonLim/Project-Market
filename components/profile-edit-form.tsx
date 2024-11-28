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
  // github 아이디 및 이메일 존재 여부
  const isGithubIdAndEmail = !!user.github_id && !!!user.email;

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

  //react hook form 사용
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProfileEditType>({
    resolver: zodResolver(profileEditSchema(isGithubIdAndEmail)),
    // 초깃값 세팅
    defaultValues: {
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
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
    if (isGithubIdAndEmail && !(user.email && user.password)) {
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
          유저명
        </label>
        <Input
          id="username"
          type="text"
          required
          placeholder="유저명(3~10자 사이로 입력해주세요)"
          {...register("username")}
          errors={[errors.username?.message ?? ""]}
          minLength={3}
          maxLength={10}
        />
        {isGithubIdAndEmail && (
          <span className="text-lg text-rose-500 my-2">
            GitHub 연동 유저는 초기에 이메일과 패스워드 설정을 완료해야 됩니다.
          </span>
        )}

        <label htmlFor="email" className="my-2">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          placeholder={"이메일(example@email.com)"}
          {...register("email")}
          errors={[errors.email?.message ?? ""]}
        />
        {isGithubIdAndEmail && (
          <>
            <label htmlFor="password" className="my-2">
              비밀번호
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호는 소문자, 대문자, 숫자, 특수문자를 포함해야 합니다."
                {...register("password")}
                errors={[errors.password?.message ?? ""]}
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
              비밀번호 확인
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호는 소문자, 대문자, 숫자, 특수문자를 포함해야 합니다."
                {...register("confirmPassword")}
                errors={[errors.confirmPassword?.message ?? ""]}
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

        <span className="flex justify-center font-semibold text-md">
          선택사항
        </span>
        <label htmlFor="phone" className="my-2">
          전화번호 (선택사항)
        </label>
        <Input
          id="phone"
          type="text"
          placeholder="전화 번호(국가/지역번호 포함) 821012345678"
          {...register("phone")}
          errors={[errors.phone?.message ?? ""]}
        />
        <div className="flex justify-center">
          <label
            htmlFor="photo"
            className="flex flex-col items-center justify-center w-1/2 m-3 bg-center bg-cover border-2 border-dashed rounded-md cursor-pointer aspect-square text-neutral-300 border-neutral-300"
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
            className="flex items-center justify-center flex-1 h-10 font-semibold text-white transition-colors bg-indigo-300 rounded-md px-auto hover:bg-indigo-400"
            href="/products"
          >
            뒤로가기
          </Link>
        </div>
      </form>
    </div>
  );
}
