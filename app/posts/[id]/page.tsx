/**
File Name : app/posts/[id]/page
Description : 동네생활 게시글 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  동네생활 게시글 페이지 추가
2024.11.05  임도헌   Modified  댓글 기능 추가
2024.11.06  임도헌   Modified  댓글 기능 수정
2024.11.12  임도헌   Modified  프로필 이미지 없을 경우의 코드 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.10  임도헌   Modified  이미지 보기 기능 추가
2024.12.12  임도헌   Modified  뒤로가기 버튼 추가
2024.12.12  임도헌   Modified  게시글 생성 시간 표시 변경
2025.04.21  임도헌   Modified  게시글 수정 버튼 추가
2025.04.28  임도헌   Modified  뒤로가기 버튼 href 추가
2025.05.10  임도헌   Modified  UI 변경
*/

import Comment from "@/components/post/comment/Comment";
import PostLikeButton from "@/components/post/PostLikeButton";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { unstable_cache as nextCache } from "next/cache";
import { notFound } from "next/navigation";
import UserAvatar from "@/components/common/UserAvatar";
import Carousel from "@/components/common/Carousel";
import BackButton from "@/components/common/BackButton";
import TimeAgo from "@/components/common/TimeAgo";
import { POST_CATEGORY } from "@/lib/constants";
import Link from "next/link";

const getUser = async () => {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
};

// 해당 게시글의 정보 및 댓글 전체 조회
const getPost = async (id: number) => {
  try {
    const post = await db.post.update({
      where: {
        id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
        images: {
          orderBy: {
            order: "asc",
          },
        },
        tags: true,
      },
    });
    return post;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getCachedPost = nextCache(getPost, ["post-detail"], {
  tags: ["post-detail"],
});

//게시글 댓글 조회
const getComments = async (postId: number) => {
  try {
    const comments = await db.comment.findMany({
      where: {
        postId,
      },
      select: {
        payload: true, // 댓글
        created_at: true,
        id: true,
        userId: true, // 댓글 쓴 유저
        user: {
          select: {
            avatar: true, //댓글 쓴 유저의 아바타
            username: true, // 댓글 쓴 유저의 이름
          },
        },
      },
      orderBy: {
        created_at: "desc", //내림차순으로 정렬
      },
    });
    return comments;
  } catch (e) {
    console.log(e);
  }
};

const getCachedComments = (postId: number) => {
  const cachedOperation = nextCache(getComments, [`post-comments-${postId}`], {
    tags: [`comments-${postId}`],
  });
  return cachedOperation(postId);
};

// 좋아요 상태 함수
const getLikeStatus = async (postId: number, userId: number) => {
  const isLiked = await db.postLike.findUnique({
    where: {
      id: {
        postId,
        userId: userId,
      },
    },
  });
  const likeCount = await db.postLike.count({
    where: {
      postId,
    },
  });
  return {
    likeCount,
    isLiked: Boolean(isLiked),
  };
};

const getCachedLikeStatus = async (postId: number) => {
  const session = await getSession();
  const userId = session.id;
  const cachedOperation = nextCache(getLikeStatus, ["post-like-status"], {
    tags: [`like-status-${postId}`],
  });
  return cachedOperation(postId, userId!);
};

export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  // id가 숫자가 아니라면
  if (isNaN(id)) {
    return notFound();
  }
  // post가 존재하지 않다면
  const post = await getCachedPost(id);
  if (!post) {
    return notFound();
  }
  // 로그인 한 유저 정보
  const user = await getUser();

  // 댓글 불러오기
  const comments = await getCachedComments(id);

  const { likeCount, isLiked } = await getCachedLikeStatus(id);
  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 헤더 영역 */}
      <BackButton href="/posts" className="pt-1" />

      {/* 메인 컨텐츠 */}
      <div className="p-5 space-y-4">
        {/* 카테고리 */}
        {post.category && (
          <div className="flex justify-end items-center gap-2">
            <Link
              href={`/posts?category=${post.category}`}
              className="px-3 py-1.5 text-sm font-medium text-white rounded-full bg-primary/80 dark:bg-primary-light/80 hover:bg-primary dark:hover:bg-primary-light transition-colors"
            >
              {POST_CATEGORY[post.category as keyof typeof POST_CATEGORY]}
            </Link>
          </div>
        )}

        {/* 작성자 정보 */}
        <div className="flex flex-col gap-2  bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="pl-4 py-2">
            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-row justify-center items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    ⚓ 항해자
                  </span>
                </div>
                <UserAvatar
                  avatar={post.user.avatar}
                  username={post.user.username}
                  size="md"
                />
              </div>
              {post.user.username === user.username && (
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="flex items-center gap-2 mr-4 px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-primary/80 dark:bg-primary-light/80 hover:bg-primary dark:hover:bg-primary-light transition-colors"
                >
                  <PencilSquareIcon className="size-4" />
                  <span>수정하기</span>
                </Link>
              )}
            </div>
            {/* 게시글 제목 & 내용 */}
            <div>
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark">
                  {post.title}
                </h1>
                <p className="text-text/80 dark:text-text-dark/80 leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            </div>
            {/* 태그 목록 */}
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    🏷️ 태그
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 py-4">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/posts?tag=${tag.name}`}
                      className="px-3 py-1 text-sm font-medium text-primary dark:text-primary-light rounded-full bg-primary/10 dark:bg-primary-light/10 hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* 이미지 갤러리 */}
            {post.images.length > 0 && (
              <div className="relative aspect-video w-full overflow-hidden">
                <Carousel
                  images={post.images}
                  className="w-full h-full rounded-xl"
                />
              </div>
            )}
            {/* 메타 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <PostLikeButton
                  isLiked={isLiked}
                  likeCount={likeCount}
                  postId={id}
                />
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <EyeIcon className="size-4" />
                  <span>{post.views}</span>
                </div>
                <TimeAgo date={post.created_at?.toString() ?? null} />
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold">💬 항해 로그</span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {post._count.comments}
            </span>
          </div>
          <Comment postId={id} user={user} comments={comments} />
        </div>
      </div>
    </div>
  );
}
