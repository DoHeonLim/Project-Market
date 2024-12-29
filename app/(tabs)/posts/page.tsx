/**
File Name : app/(tabs)/posts/page
Description : 항해일지 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  동네생활 페이지 추가
2024.11.23  임도헌   Modified  게시글을 최신 게시글순으로 출력되게 수정
2024.11.23  임도헌   Modified  게시글 생성 링크 추가
2024.12.12  임도헌   Modified  게시글 좋아요 명 변경
2024.12.12  임도헌   Modified  게시글 생성 시간 표시 변경
2024.12.18  임도헌   Modified  항해일지 페이지로 변경(동네생활 -> 항해일지)
2024.12.23  임도헌   Modified  게시글 페이지 다크모드 추가
*/

import TimeAgo from "@/components/time-ago";
import db from "@/lib/db";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { EyeIcon, HeartIcon, PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { POST_CATEGORY } from "@/lib/constants";
import Image from "next/image";
import PostCategoryTabs from "../../../components/search/post-category-tabs";
import SearchBar from "@/components/search/search-bar";
import UserAvatar from "@/components/user-avatar";

// searchParams로 카테고리 필터링
interface PostsPageProps {
  searchParams: {
    category?: string;
    keyword?: string;
  };
}

const getPosts = async (category?: string, keyword?: string) => {
  const posts = await db.post.findMany({
    where: {
      // 카테고리가 있으면 필터링, 없으면 전체
      ...(category && { category }),
      // 검색어가 있는 경우 제목 또는 내용에서 검색
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      views: true,
      created_at: true,
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      images: {
        select: {
          url: true,
        },
        take: 1,
      },
      _count: {
        select: {
          comments: true,
          post_likes: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return posts;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const posts = await getPosts(searchParams.category, searchParams.keyword);

  return (
    <div className="flex flex-col px-5 pt-5">
      {/* 카테고리 탭 컨테이너 */}
      <div className="sticky -top-1 bg-white dark:bg-neutral-900 z-10 pb-4 border-b-2 border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <PostCategoryTabs currentCategory={searchParams.category} />
        </div>
        <div className="mt-4">
          <SearchBar
            basePath="/posts"
            placeholder="⚓ 항해 일지 검색"
            additionalParams={{
              category: searchParams.category ?? "",
            }}
          />
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="grid gap-4 mt-4 z-0">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex gap-4 p-4 transition-all bg-white dark:bg-neutral-800/30 hover:bg-opacity-40 border border-neutral-200 dark:border-neutral-700 hover:border-primary dark:hover:border-primary-light hover:scale-[1.02] rounded-lg"
            >
              {/* 게시글 썸네일 */}
              <div className="flex flex-col justify-center items-center">
                <div className="relative w-24 h-24 overflow-hidden rounded-md shrink-0">
                  {post.images[0] ? (
                    <Image
                      src={`${post.images[0].url}/public`}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100px, (max-width: 1200px) 96px, 96px"
                      className="object-cover size-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-700">
                      <PhotoIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <UserAvatar
                    avatar={post.user.avatar}
                    username={post.user.username}
                    disabled={true}
                  />
                </div>
              </div>

              {/* 게시글 내용 */}
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs text-white rounded-full bg-primary/80 dark:bg-primary-light/80">
                    {POST_CATEGORY[post.category as keyof typeof POST_CATEGORY]}
                  </span>
                  <TimeAgo date={post.created_at?.toString()} />
                </div>

                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white line-clamp-1">
                  {post.title}
                </h2>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center gap-4 mt-auto text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="size-5" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartIcon className="size-4 text-rose-600" />
                    {post._count.post_likes}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {post._count.comments}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex items-center justify-center w-full bg-transparent">
            <span className="text-sm font-semibold">게시글이 없습니다.</span>
          </div>
        )}
      </div>

      {/* 글쓰기 버튼 */}
      <Link
        href="posts/add"
        className="fixed flex items-center justify-center text-white transition-all bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary-light/90 hover:scale-105 rounded-full size-16 bottom-24 right-8 shadow-lg shadow-primary/30 dark:shadow-primary-light/30"
      >
        <PlusIcon aria-label="add_post" className="size-10" />
      </Link>
    </div>
  );
}
