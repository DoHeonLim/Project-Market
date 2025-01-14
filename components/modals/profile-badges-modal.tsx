/**
File Name : components/modals/profile-badges-modal.tsx
Description : 뱃지 모달
Author : 임도헌

History
Date        Author   Status    Description
2024.12.31  임도헌   Created
2024.12.31  임도헌   Modified  유저뱃지 모달 추가
2025.01.12  임도헌   Modified  툴팁 위치 변경, 주석 추가
2025.01.14  임도헌   Modified  useRole 접근성 기능 개선(tooltip 명시, 뱃지 아이템에 aria-describedby 추가, 툴팁에 role="tooltip" 및 aria-hidden 추가, 툴팁에 고유 id 추가)
2025.01.14  임도헌   Modified  useHover로 부드러운 애니메이션 적용
2025.01.14  임도헌   Modified  useDismiss로 툴팁의 닫힘 동작 케이스별로 제어
*/
"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  useFloating,
  offset,
  shift,
  flip,
  arrow,
  useHover,
  useDismiss,
  useRole,
  useInteractions,
  FloatingArrow,
  type Placement,
} from "@floating-ui/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getBadgeKoreanName } from "@/lib/utils";

type Badge = {
  id: number;
  name: string;
  icon: string;
  description: string;
};

interface ProfileBadgesModalProps {
  isOpen: boolean;
  closeModal: () => void;
  badges: Badge[];
  userBadges: Badge[];
}

function BadgeItem({ badge, isEarned }: { badge: Badge; isEarned: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [arrowRef, setArrowRef] = useState<SVGSVGElement | null>(null);

  // Floating UI 설정
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen, // 툴팁 열림/닫힘 상태
    onOpenChange: setIsOpen, // 상태 변경 핸들러
    placement: "bottom" as Placement, // 툴팁 위치 (아래쪽)
    middleware: [
      offset(5), // 타겟으로부터 10px 거리 유지
      flip({ padding: 5 }), // 공간 부족시 반대로 뒤집기
      shift(), // 화면 벗어날 경우 이동
      arrow({ element: arrowRef }), // 화살표 위치 조정
    ],
  });
  // 인터랙션 설정
  const hover = useHover(context, {
    move: false, // 마우스 이동 시 반응하지 않음
    delay: { open: 100, close: 200 },
    restMs: 40,
  });
  const dismiss = useDismiss(context, {
    escapeKey: true, // ESC 키로 닫기
    outsidePress: true, // 외부 클릭으로 닫기
    referencePress: false, // 뱃지 클릭으로는 닫지 않음
    ancestorScroll: true, // 스크롤 시 닫기
  });
  const role = useRole(context, {
    role: "tooltip", // 명시적으로 tooltip 역할 지정
  });
  // 인터랙션 props 결합
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    dismiss,
    role,
  ]);

  return (
    <div className="relative">
      {/* 뱃지 아이템 */}
      <div
        ref={refs.setReference} // 툴팁의 기준점 설정
        {...getReferenceProps()} // 인터랙션 props 적용
        aria-describedby={isOpen ? "badge-tooltip" : undefined} //아래 badge-tooltip id와 연결시킨다.
        className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all
          ${
            isEarned
              ? "border-primary/30 dark:border-primary-light/30 bg-primary/5 dark:bg-primary-light/5"
              : "border-gray-200 dark:border-neutral-700"
          }`}
      >
        {/* 뱃지 이미지 */}
        <div className={`relative w-12 h-12 mb-2`}>
          <Image
            src={`${badge.icon}/public`}
            alt={getBadgeKoreanName(badge.name)}
            fill
            className={`object-contain transition-opacity ${
              isEarned ? "opacity-100" : "opacity-40 dark:opacity-30"
            }`}
            sizes="(max-width: 48px) 100vw, 48px"
          />
        </div>
        {/* 뱃지 이름 */}
        <span
          className={`text-xs text-center ${
            isEarned
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {getBadgeKoreanName(badge.name)}
        </span>
      </div>

      {/* 툴팁 (열려있을 때만 표시) */}
      {isOpen && (
        <div
          ref={refs.setFloating} // 툴팁 요소 참조
          {...getFloatingProps()} // 툴팁 인터랙션 props
          id="badge-tooltip"
          role="tooltip"
          aria-hidden={!isOpen}
          style={floatingStyles} // 위치 스타일
          className="z-50 max-w-xs bg-neutral-900 dark:bg-neutral-800 text-white p-2 rounded-lg text-sm"
        >
          {badge.description}
          {/* 툴팁 화살표 */}
          <FloatingArrow
            ref={setArrowRef}
            context={context}
            className="fill-neutral-900 dark:fill-neutral-800"
          />
        </div>
      )}
    </div>
  );
}

export default function ProfileBadgesModal({
  isOpen,
  closeModal,
  badges,
  userBadges,
}: ProfileBadgesModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeModal}
      />

      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* 모달 */}
        <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-800 rounded-2xl shadow-xl transform transition-all duration-300 opacity-100 scale-100 max-h-[90vh] flex flex-col">
          {/* 모달 헤더 - 고정 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              나의 뱃지 컬렉션
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* 모달 컨텐츠 - 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {badges.map((badge) => (
                <BadgeItem
                  key={badge.id}
                  badge={badge}
                  isEarned={userBadges.some((b) => b.id === badge.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
