/**
File Name : components\follow\FollowButton.tsx
Description : 유저 팔로우 버튼
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  유저 팔로우 버튼 추가
*/
"use client";
import { useState } from "react";

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
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });
      if (response.ok) {
        setIsFollowing((prev) => !prev);
        onFollowChange?.(!isFollowing);
      }
    } catch (error) {
      // TODO: 에러 핸들링
      console.log(error);
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
