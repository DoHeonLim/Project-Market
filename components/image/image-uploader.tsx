/**
File Name : components/image/image-uploader.tsx
Description : 이미지 업로드 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.10  임도헌   Created
2024.12.10  임도헌   Modified  이미지 업로드 컴포넌트 추가
*/
import {
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import type { DropResult } from "@hello-pangea/dnd";
import DraggableImageList from "./draggable-image-list";
interface ImageUploaderProps {
  previews: string[];
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (index: number) => void;
  onDragEnd: (result: DropResult) => void;
  isOpen: boolean;
  onToggle: () => void;
  maxImages?: number;
  optional?: boolean;
}

export default function ImageUploader({
  previews,
  onImageChange,
  onDeleteImage,
  onDragEnd,
  isOpen,
  onToggle,
  maxImages = 5,
  optional = true,
}: ImageUploaderProps) {
  const handleImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (previews.length >= maxImages) {
      e.preventDefault();
      alert(`이미지는 최대 ${maxImages}개까지만 업로드할 수 있습니다.`);
    }
  };

  return (
    <div className="flex flex-col gap-2 border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between p-4 w-full hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <PhotoIcon className="w-6 h-6 text-gray-500" />
          <span className="text-gray-500">
            이미지 추가{optional ?? "(선택사항)"}
            {previews.length > 0 && ` (${previews.length}개)`}
          </span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 border-t">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={previews.length >= maxImages ? undefined : "photo"}
              onClick={handleImageClick}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md ${
                previews.length >= maxImages
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              } h-24 text-neutral-300 border-neutral-300 hover:border-neutral-400 hover:text-neutral-400 transition-colors`}
            >
              <PhotoIcon aria-label="photo_input" className="w-8 h-8" />
              <div className="text-sm text-neutral-400">
                {previews.length >= maxImages
                  ? `이미지는 최대 ${maxImages}개까지 업로드할 수 있습니다`
                  : "클릭하여 사진 추가"}
              </div>
            </label>

            <input
              id="photo"
              type="file"
              accept="image/*"
              multiple
              onChange={onImageChange}
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <DraggableImageList
              previews={previews}
              onDeleteImage={onDeleteImage}
              onDragEnd={onDragEnd}
            />
          )}
        </div>
      )}
    </div>
  );
}
