/**
File Name : components/follow/FollowButton
Description : 유저 팔로우 버튼
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  유저 팔로우 버튼 추가
2025.09.05  임도헌   Modified  sonner toast 기반 성공/에러 알림 적용
*/
"use client";
import { useState } from "react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: number;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline";
}

export default function FollowButton({
  targetUserId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  size = "md",
  variant = "primary",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${targetUserId}/follow`, { method });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "요청을 처리하지 못했습니다.");
      }

      const next = !isFollowing;
      setIsFollowing(next);
      onFollowChange?.(next);

      toast.success(next ? "팔로우했습니다." : "팔로우를 취소했습니다.");
    } catch (error: any) {
      console.error("[FollowButton]", error);
      toast.error(
        error?.message ||
          "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  let sizeClass = "px-4 py-2 text-base";
  if (size === "sm") sizeClass = "px-3 py-1 text-sm";
  if (size === "lg") sizeClass = "px-6 py-3 text-lg";

  const variantClass =
    variant === "outline"
      ? "border border-primary text-primary bg-white hover:bg-primary/10"
      : "bg-primary text-white hover:bg-primary/90";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg font-semibold transition-colors ${sizeClass} ${variantClass} disabled:opacity-60`}
    >
      {loading ? "처리 중..." : isFollowing ? "팔로우 취소" : "팔로우"}
    </button>
  );
}
