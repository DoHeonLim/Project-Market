/**
 File Name : app/streams/add/page
 Description : 라이브 스트리밍 시작 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 스트리밍 시작 페이지 추가
 2025.04.18  임도헌   Modified  스트리밍 생성 기눙 추가
 2025.04.18  임도헌   Modified  스트리밍 생성 UI 개선
 2025.04.19  임도헌   Modified  OBS Studio 호환 방식으로 변경
 */
"use client";

import { startStream, getUploadUrl } from "./actions";
import { STREAM_VISIBILITY, STREAM_VISIBILITY_DISPLAY } from "@/lib/constants";
import { useState, useEffect } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import ImageUploader from "@/components/image/image-uploader";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Select from "@/components/select";
import { StreamCategory } from "@prisma/client";
import TagInput from "@/components/tag-input";

// 스트리밍 생성 스키마
const streamSchema = z.object({
  title: z
    .string({
      required_error: "제목을 입력해주세요.",
    })
    .min(5, "5자 이상 적어주세요."),
  description: z.string({
    required_error: "설명을 입력해주세요.",
  }),
  thumbnail: z.string().optional(),
  visibility: z
    .enum([
      STREAM_VISIBILITY.PUBLIC,
      STREAM_VISIBILITY.PRIVATE,
      STREAM_VISIBILITY.FOLLOWERS,
    ])
    .default(STREAM_VISIBILITY.PUBLIC),
  password: z.string().optional(),
  streamCategoryId: z.coerce.number({
    required_error: "카테고리를 선택해주세요.",
  }),
  tags: z.array(z.string()).optional(),
});

type StreamType = z.infer<typeof streamSchema>;

export default function AddStream() {
  const router = useRouter();
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    number | null
  >(null);
  const [categories, setCategories] = useState<StreamCategory[]>([]);
  const [showStreamInfo, setShowStreamInfo] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    streamId: number;
    streamKey: string;
    rtmpUrl: string;
  } | null>(null);

  useEffect(() => {
    // 카테고리 목록 가져오기
    const fetchCategories = async () => {
      const response = await fetch("/streams/get-categories");
      if (!response.ok) {
        console.error("카테고리 로딩 실패");
        return;
      }
      const data = await response.json();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  // react hook form 설정
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    getValues,
    watch,
  } = useForm<StreamType>({
    resolver: zodResolver(streamSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      visibility: STREAM_VISIBILITY.PUBLIC,
      password: "",
      streamCategoryId: 0,
      tags: [],
    },
  });

  const watchVisibility = watch("visibility");

  // 이미지 업로드 커스텀 훅
  const {
    previews,
    files,
    isImageFormOpen,
    setIsImageFormOpen,
    handleImageChange,
    handleDeleteImage,
    handleDragEnd,
  } = useImageUpload({ maxImages: 1, setValue, getValues });

  const onSubmit = handleSubmit(async (data: StreamType) => {
    try {
      let thumbnail = data.thumbnail;

      // 이미지가 있는 경우 업로드
      if (files.length > 0) {
        const { success, result } = await getUploadUrl();
        if (!success) throw new Error("Failed to get upload URL");

        const { uploadURL, id } = result;
        const cloudflareForm = new FormData();
        cloudflareForm.append("file", files[0]);

        const response = await fetch(uploadURL, {
          method: "POST",
          body: cloudflareForm,
        });

        if (!response.ok) throw new Error("Failed to upload image");

        thumbnail = `https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/${id}`;
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else if (key === "thumbnail") {
          formData.append(key, thumbnail || "");
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const result = await startStream(null, formData);
      if (result?.success) {
        setStreamInfo({
          streamId: result.streamId!,
          streamKey: result.streamKey!,
          rtmpUrl: result.rtmpUrl!,
        });
        setShowStreamInfo(true);
      } else if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">새로운 스트리밍 시작하기</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          required
          placeholder="스트리밍 제목을 입력하세요 (5자 이상)"
          errors={[errors.title?.message ?? ""]}
          {...register("title")}
        />

        <Input
          type="textarea"
          placeholder="스트리밍에 대한 설명을 입력하세요"
          errors={[errors.description?.message ?? ""]}
          {...register("description")}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">썸네일</label>
          <ImageUploader
            previews={previews}
            onImageChange={handleImageChange}
            onDeleteImage={handleDeleteImage}
            onDragEnd={handleDragEnd}
            isOpen={isImageFormOpen}
            onToggle={() => setIsImageFormOpen(!isImageFormOpen)}
            maxImages={1}
            optional={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="대분류"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = e.target.value;
              setSelectedMainCategory(value === "" ? null : Number(value));
              setValue("streamCategoryId", 0);
            }}
            value={selectedMainCategory?.toString() || ""}
          >
            <option value="">대분류 선택</option>
            {categories
              .filter((category) => !category.parentId)
              .map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.kor_name}
                </option>
              ))}
          </Select>

          <Select
            label="소분류"
            {...register("streamCategoryId")}
            errors={[errors.streamCategoryId?.message ?? ""]}
            disabled={!selectedMainCategory}
          >
            <option value="">소분류 선택</option>
            {categories
              .filter((category) => category.parentId === selectedMainCategory)
              .map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.icon} {category.kor_name}
                </option>
              ))}
          </Select>
        </div>

        <TagInput name="tags" control={control} maxTags={5} />

        <div className="space-y-2">
          <label className="block text-sm font-medium">공개 설정</label>
          <div className="grid grid-cols-2 gap-4">
            <Select
              {...register("visibility")}
              onChange={(e) => {
                setValue(
                  "visibility",
                  e.target.value as keyof typeof STREAM_VISIBILITY
                );
              }}
            >
              <option value={STREAM_VISIBILITY.PUBLIC}>
                {STREAM_VISIBILITY_DISPLAY.PUBLIC}
              </option>
              <option value={STREAM_VISIBILITY.PRIVATE}>
                {STREAM_VISIBILITY_DISPLAY.PRIVATE}
              </option>
              <option value={STREAM_VISIBILITY.FOLLOWERS}>
                {STREAM_VISIBILITY_DISPLAY.FOLLOWERS}
              </option>
            </Select>

            {watchVisibility === STREAM_VISIBILITY.PRIVATE && (
              <Input
                type="password"
                placeholder="비밀번호를 입력하세요"
                {...register("password")}
                errors={[errors.password?.message ?? ""]}
              />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {watchVisibility === STREAM_VISIBILITY.PUBLIC &&
              "모든 사용자가 시청할 수 있습니다."}
            {watchVisibility === STREAM_VISIBILITY.PRIVATE &&
              "비밀번호를 아는 사용자만 시청할 수 있습니다."}
            {watchVisibility === STREAM_VISIBILITY.FOLLOWERS &&
              "팔로워만 시청할 수 있습니다."}
          </p>
        </div>

        <Button text="스트리밍 생성하기" />
      </form>

      {showStreamInfo && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                스트리밍 설정 정보
              </h2>
              <button
                onClick={() => setShowStreamInfo(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  RTMP URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={streamInfo?.rtmpUrl}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(streamInfo?.rtmpUrl || "")
                    }
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    복사
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  스트림 키
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={streamInfo?.streamKey}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(streamInfo?.streamKey || "")
                    }
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    복사
                  </button>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  OBS Studio 설정 방법
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>OBS Studio를 실행합니다.</li>
                    <li>설정 &gt; 방송으로 이동합니다.</li>
                    <li>서비스에서 Custom을 선택합니다.</li>
                    <li>위의 RTMP URL과 스트림 키를 각각 입력합니다.</li>
                    <li>확인을 클릭하고 방송 시작을 누릅니다.</li>
                  </ol>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowStreamInfo(false);
                    router.push(`/streams/${streamInfo?.streamId}`);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  스트리밍 페이지로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
