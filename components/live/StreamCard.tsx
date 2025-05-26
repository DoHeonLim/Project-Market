/**
 File Name : components/live/StreamCard
 Description : 스트리밍 카드 섹션
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.16  임도헌   Created
 2025.05.16  임도헌   Modified  스트리밍 카드 섹션 추가
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UserAvatar from "../common/UserAvatar";
import { formatToTimeAgo } from "@/lib/utils";
import { STREAM_VISIBILITY } from "@/lib/constants";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon, UsersIcon } from "@heroicons/react/24/solid";

interface StreamCardProps {
  id: number;
  title: string;
  thumbnail?: string | null;
  isLive: boolean;
  streamer: { username: string; avatar?: string | null };
  startedAt?: string | null;
  category?: { kor_name: string; icon?: string };
  tags?: { name: string }[];
  shortDescription?: boolean;
  href?: string;
  visibility?: string;
  password?: string | null;
  isFollowersOnly?: boolean;
}

export default function StreamCard({
  id,
  title,
  thumbnail,
  isLive,
  streamer,
  startedAt,
  category,
  tags,
  shortDescription = false,
  href = `/streams/${id}`,
  visibility = STREAM_VISIBILITY.PUBLIC,
  password,
  isFollowersOnly,
}: StreamCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");

  const handleStreamClick = (e: React.MouseEvent) => {
    if (visibility === STREAM_VISIBILITY.PRIVATE) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === password) {
      window.location.href = href;
    } else {
      setError("비밀번호가 일치하지 않습니다.");
    }
  };

  // Cloudflare 썸네일 기본값
  const thumbUrl = thumbnail
    ? thumbnail.startsWith(
        `${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN}/`
      )
      ? thumbnail
      : `${thumbnail}/public`
    : null;

  return (
    <div className="relative bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
      <Link href={href} className="block" onClick={handleStreamClick}>
        <div className="relative w-full flex-1 aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={title}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 group-hover:brightness-75"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
            />
          ) : (
            <PhotoIcon className="w-full h-full" />
          )}
          {isLive && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              LIVE
            </span>
          )}
          {visibility === STREAM_VISIBILITY.PRIVATE && (
            <div className="absolute top-2 right-2 bg-transparent text-neutral-800 dark:text-white p-1 rounded">
              <LockClosedIcon className="size-8" />
            </div>
          )}
        </div>
        {/* 팔로워 전용 뱃지 */}
        {isFollowersOnly && (
          <span className="absolute top-2 right-2 bg-transparent text-neutral-800 dark:text-white p-1 rounded">
            <UsersIcon className="size-8" />
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2 mt-2">
        <div className="flex-shrink-0">
          <UserAvatar
            avatar={streamer.avatar ?? null}
            username={streamer.username}
            size="sm"
          />
        </div>
        <span className="font-semibold text-base dark:text-white truncate flex-1">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
        {!shortDescription && category && (
          <span className="flex items-center gap-1">
            {category.icon && <span>{category.icon}</span>}
            {category.kor_name}
          </span>
        )}
        {!shortDescription && tags && tags.length > 0 && (
          <span className="flex gap-1">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className="bg-gray-200 dark:bg-gray-700 px-1 rounded"
              >
                #{tag.name}
              </span>
            ))}
          </span>
        )}
        {!shortDescription && startedAt && (
          <span className="ml-auto">{formatToTimeAgo(startedAt)}</span>
        )}
      </div>

      {/* 비밀번호 입력 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              비공개 스트리밍
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="비밀번호를 입력하세요"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  입장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
