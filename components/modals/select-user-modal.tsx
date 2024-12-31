/**
 File Name : components/select-user-modal
 Description : 예약자 선택 모달 컴포넌트
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.12.02  임도헌   Created
 2024.12.02  임도헌   Modified  예약자 선택 모달 컴포넌트 추가
 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 2024.12.22  임도헌   Modified  이벤트 버블링을 방지하기 위해 e.stopPropagation() 추가
 2024.12.29  임도헌   Modified  예약자 선택 모달 스타일 수정
 */

import {
  getProductChatUsers,
  updateProductStatus,
} from "@/app/(tabs)/profile/(product)/my-sales/actions";
import React, { useState, useEffect } from "react";
import UserAvatar from "../user-avatar";

interface ISelectUserModalProps {
  productId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
type ChatUser = {
  id: number;
  username: string;
  avatar: string | null;
};

export function SelectUserModal({
  productId,
  isOpen,
  onOpenChange,
}: ISelectUserModalProps) {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]); // ChatUser 타입 사용
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchChatUsers = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const users = await getProductChatUsers(productId);
          setChatUsers(users);
        } catch (error) {
          console.error("Failed to fetch chat users:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchChatUsers();
  }, [productId, isOpen]);

  const handleUserSelect = async (selectUserId: number) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await updateProductStatus(productId, "reserved", selectUserId);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl animate-fade-in mx-4">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
            예약자 선택
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            이 제품에 대해 채팅한 유저 중 예약자를 선택해주세요.
          </p>
        </div>

        {/* 본문 */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400">
              로딩 중...
            </div>
          ) : chatUsers.length === 0 ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400">
              아직 채팅한 유저가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {chatUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      avatar={user.avatar}
                      username={user.username}
                      size="md"
                      disabled={true}
                    />
                  </div>
                  <button
                    className="px-4 py-2 bg-primary hover:bg-primary-dark 
                      dark:bg-primary-light dark:hover:bg-primary
                      text-white text-sm font-medium rounded-lg transition-colors
                      disabled:bg-neutral-300 dark:disabled:bg-neutral-600 
                      disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserSelect(user.id);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "처리중..." : "선택"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t dark:border-neutral-700 flex justify-end">
          <button
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 
              dark:bg-neutral-700 dark:hover:bg-neutral-600 
              text-neutral-700 dark:text-neutral-200 
              rounded-lg transition-colors"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
