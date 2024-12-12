/**
File Name : hooks/useImageUpload.tsx
Description : 이미지 업로드 커스텀 훅
Author : 임도헌

History
Date        Author   Status    Description
2024.12.10  임도헌   Created
2024.12.10  임도헌   Modified  이미지 업로드 커스텀 훅 추가
*/
import { useState } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { MAX_PHOTO_SIZE } from "@/lib/constants";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";

interface UseImageUploadProps {
  maxImages?: number;
  maxSize?: number;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

export function useImageUpload({
  maxImages = 5,
  maxSize = MAX_PHOTO_SIZE,
  setValue,
  getValues,
}: UseImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files: newFiles } = event.target;
    if (!newFiles) return;

    if (previews.length + newFiles.length > maxImages) {
      alert(`이미지는 최대 ${maxImages}개까지만 업로드할 수 있습니다.`);
      event.target.value = "";
      return;
    }

    for (const file of Array.from(newFiles)) {
      if (file.size > maxSize) {
        alert("이미지는 3MB 이하로 올려주세요.");
        event.target.value = "";
        return;
      }
    }
    // 미리보기 URL 생성
    const newPreviews = Array.from(newFiles).map((file) =>
      URL.createObjectURL(file)
    );
    // 미리보기 세팅
    setPreviews((prev) => [...prev, ...newPreviews]);
    // 이미지 파일 세팅
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    setValue("photos", [...(getValues("photos") || []), ...newPreviews]);
  };

  const handleDeleteImage = (index: number) => {
    // 현재 photos 값을 가져옴
    const currentPhotos: string[] = getValues("photos");

    // previews와 photos 배열에서 해당 인덱스 항목 제거
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));

    // photos 값 업데이트
    setValue(
      "photos",
      currentPhotos.filter((photo: string, i: number) => i !== index)
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(previews);
    const fileItems = Array.from(files);

    // 이미지 순서 변경
    const [reorderedPreview] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedPreview);

    // 파일 순서도 같이 변경
    const [reorderedFile] = fileItems.splice(result.source.index, 1);
    fileItems.splice(result.destination.index, 0, reorderedFile);

    setPreviews(items);
    setFiles(fileItems);
    setValue("photos", items);
  };

  const reset = () => {
    setPreviews([]);
    setFiles([]);
    setValue("photos", []);
  };

  return {
    previews,
    files,
    isImageFormOpen,
    setIsImageFormOpen,
    handleImageChange,
    handleDeleteImage,
    handleDragEnd,
    setPreviews,
    reset,
  };
}
