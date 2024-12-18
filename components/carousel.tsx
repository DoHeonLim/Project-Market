/**
File Name : components/carousel
Description : 게시글 이미지 캐러셀 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.10  임도헌   Created
2024.12.10  임도헌   Modified  캐러셀 컴포넌트 추가
2024.12.11  임도헌   Modified  캐러셀 드래그 기능 추가
2024.12.17  임도헌   Modified  캐러셀 클래스네임 추가
*/
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface PostImage {
  url: string;
  order: number;
}

interface CarouselProps {
  images: PostImage[];
  className?: string;
}

export default function Carousel({ images, className = "" }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  // 마우스 드래그 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const distance = dragStartX.current - e.clientX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (!images.length) return null;

  return (
    <div className={`relative w-full ${className}`}>
      {/* 이미지 컨테이너 */}
      <div className="relative w-full h-full">
        <div
          className="absolute w-full h-full flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full h-full relative">
              <div
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {/* 캐러셀의 드래그 기능과 브라우저의 기본 이미지 드래그 기능이 충돌하는 것을 막고
                사용자가 이미지를 드래그 할 때 캐러셀의 슬라이드 기능만 동작하도록 draggable={false} 추가 */}
                <Image
                  src={`${image.url}/public`}
                  alt={`제품 이미지 ${index + 1}`}
                  fill
                  className="object-contain rounded-md select-none" // object-cover를 object-contain으로 변경
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                  draggable={false}
                  quality={100}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 이미지가 2개 이상일 때만 네비게이션 버튼 표시 */}
      {images.length > 1 && (
        <>
          {/* 이전 버튼 */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="이전 이미지"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="다음 이미지"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 이미지 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-neutral-700" : "bg-neutral-500"
            }`}
            aria-label={`${index + 1}번 이미지로 이동`}
          />
        ))}
      </div>

      {/* 현재 이미지 번호 표시 */}
      <div className="absolute bottom-4 left-4 px-2 py-1 rounded-full bg-black/50 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
