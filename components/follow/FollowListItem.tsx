/**
File Name : components\follow\FollowButton.tsx
Description : 유저 팔로우 리스트트
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  유저 팔로우 리스트 기능 추가
*/

import Link from "next/link";
import UserAvatar from "../user-avatar";
import FollowButton from "./FollowButton";

interface User {
  id: number;
  username: string;
  avatar: string | null;
}

interface FollowListItemProps {
  user: User;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  showButton?: boolean;
  buttonVariant?: "primary" | "outline";
  buttonSize?: "sm" | "md" | "lg";
}

export default function FollowListItem({
  user,
  isFollowing,
  onFollowChange,
  showButton = true,
  buttonVariant = "primary",
  buttonSize = "sm",
}: FollowListItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <UserAvatar
          avatar={user.avatar}
          username={user.username}
          size="md"
          disabled={true}
        />
      </Link>
      {showButton && (
        <FollowButton
          targetUserId={user.id}
          isFollowing={isFollowing}
          onFollowChange={onFollowChange}
          size={buttonSize}
          variant={buttonVariant}
        />
      )}
    </div>
  );
}
