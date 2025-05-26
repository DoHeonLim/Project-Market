/**
 File Name : app\(tabs)\live\LivePageClient.tsx
 Description : 라이브 서버 코드
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.23  임도헌   Created
 2025.05.23  임도헌   Modified  page에서 클라이언트 코드 분리
 */
"use client";
import { useState } from "react";
import StreamCard from "@/components/live/StreamCard";
import Link from "next/link";
import StreamCategoryTabs from "@/components/search/StreamCategoryTabs";
import SearchBar from "@/components/search/SearchBar";
import { FollowingStream, LiveStream } from "./page";

export default function LivePageClient({
  allStreams,
  followingStreams,
  searchParams,
}: {
  allStreams: LiveStream;
  followingStreams: FollowingStream;
  searchParams: { category?: string; keyword?: string };
}) {
  const [tab, setTab] = useState<"all" | "following">("all");
  const [streams, setStreams] = useState(allStreams);

  // 팔로우/언팔로우 처리
  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to follow/unfollow");
      }

      // 스트림 목록 업데이트
      setStreams((prev) =>
        prev.map((stream) =>
          stream.user.id === userId
            ? { ...stream, isFollowing: !isFollowing }
            : stream
        )
      );
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

  // 검색 필터는 all 탭에서만 적용
  const filteredStreams =
    tab === "all" && searchParams.keyword
      ? streams.filter(
          (stream) =>
            stream.title
              .toLowerCase()
              .includes((searchParams.keyword ?? "").toLowerCase()) ||
            (stream.description &&
              stream.description
                .toLowerCase()
                .includes((searchParams.keyword ?? "").toLowerCase()))
        )
      : tab === "all"
        ? streams
        : followingStreams;

  return (
    <div className="relative min-h-screen bg-background dark:bg-background-dark p-4 pb-24">
      {/* 탭 UI */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            tab === "all"
              ? "bg-primary text-white"
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
          }`}
          onClick={() => setTab("all")}
        >
          실시간 방송
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            tab === "following"
              ? "bg-primary text-white"
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
          }`}
          onClick={() => setTab("following")}
        >
          팔로잉
        </button>
      </div>

      {/* 카테고리/검색 (all 탭에서만) */}
      {tab === "all" && (
        <div className="sticky top-0 z-10 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="relative">
            <StreamCategoryTabs currentCategory={searchParams.category} />
          </div>
          <div className="mt-4">
            <SearchBar
              basePath="/live"
              placeholder="🔍 라이브 스트리밍 검색"
              additionalParams={{
                category: searchParams.category ?? "",
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {tab === "all" ? "실시간 방송" : "팔로잉 방송"}
        </h1>

        {filteredStreams.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            {tab === "all"
              ? "현재 진행 중인 방송이 없습니다."
              : "팔로잉한 유저의 실시간 방송이 없습니다."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredStreams.map((stream) => (
              <div key={stream.id} className="relative">
                <StreamCard
                  id={stream.id}
                  title={stream.title}
                  thumbnail={stream.thumbnail}
                  isLive={stream.status === "CONNECTED"}
                  streamer={{
                    username: stream.user.username,
                    avatar: stream.user.avatar,
                  }}
                  startedAt={
                    stream.started_at ? stream.started_at.toString() : undefined
                  }
                  category={
                    stream.category
                      ? {
                          kor_name: stream.category.kor_name,
                          icon: stream.category.icon ?? undefined,
                        }
                      : undefined
                  }
                  tags={stream.tags}
                  visibility={stream.visibility}
                  password={stream.password}
                  isFollowersOnly={stream.visibility === "FOLLOWERS"}
                />
                {stream.visibility === "FOLLOWERS" &&
                  !stream.isFollowing &&
                  !stream.isMine && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-white mb-4">
                          이 방송은 팔로워만 시청할 수 있습니다.
                        </p>
                        <button
                          onClick={() => handleFollow(stream.user.id, false)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                        >
                          팔로우하기
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 방송 추가 플로팅 버튼 */}
      <Link
        href="/streams/add"
        className="fixed bottom-24 right-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-4xl shadow-lg z-10"
      >
        +
      </Link>
    </div>
  );
}
