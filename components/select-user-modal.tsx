import {
  getProductChatUsers,
  updateProductStatus,
} from "@/app/(tabs)/profile/(product)/my-sales/actions";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useState, useEffect } from "react";

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
    await updateProductStatus(productId, "reserved", selectUserId);
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-600 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">예약자 선택</h2>
          <p className="text-sm text-neutral-300">
            이 제품에 대해 채팅한 유저 중 예약자를 선택해주세요.
          </p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center text-gray-500">로딩 중...</div>
          ) : chatUsers!.length === 0 ? (
            <div className="text-center text-gray-500">
              아직 채팅한 유저가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {chatUsers!.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-md"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <div className="overflow-hidden rounded-full size-10">
                        {user.avatar !== null ? (
                          <Image
                            width={40}
                            height={40}
                            src={`${user.avatar!}/avatar`}
                            alt={user.username}
                          />
                        ) : (
                          <UserIcon aria-label="user_icon" />
                        )}
                        <div>
                          <h3>{user.username}</h3>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm">{user.username}</span>
                  </div>
                  <button
                    className="px-3 py-1 text-xs border rounded hover:bg-indigo-400"
                    onClick={() => {
                      handleUserSelect(user.id);
                      alert("예약중으로 변경되었습니다.");
                    }}
                  >
                    선택
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-600 text-sm hover:bg-indigo-400 rounded"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
