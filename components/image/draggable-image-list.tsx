/**
File Name : components/image/draggable-image-list.tsx
Description : 이미지 드래그 앤 드롭 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.10  임도헌   Created
2024.12.10  임도헌   Modified  이미지 드래그 앤 드롭 컴포넌트 추가
*/
import dynamic from "next/dynamic";
import type { DropResult } from "@hello-pangea/dnd";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { BLUR_DATA_URL } from "@/lib/constants";

// hello-pangea-dnd dynamic import
const DragDropContext = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.DragDropContext),
  { ssr: false }
);

const Droppable = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.Droppable),
  { ssr: false }
);

const Draggable = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

interface DraggableImageListProps {
  previews: string[];
  onDeleteImage: (index: number) => void;
  onDragEnd: (result: DropResult) => void;
}

export default function DraggableImageList({
  previews,
  onDeleteImage,
  onDragEnd,
}: DraggableImageListProps) {
  return (
    <div className="mt-2">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided) => (
            <div
              className="grid grid-cols-3 gap-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {previews.map((preview, index) => (
                <Draggable
                  key={`draggable-${index}`}
                  draggableId={`draggable-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative aspect-square ${
                        snapshot.isDragging ? "opacity-50" : ""
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                          loading={index === 0 ? undefined : "lazy"}
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                        />
                      </div>
                      <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white text-sm z-10">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onDeleteImage(index);
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors z-10"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
