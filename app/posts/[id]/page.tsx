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
*/

import Comment from "@/components/comment";
import LikeButton from "@/components/like-button";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import { EyeIcon, UserIcon } from "@heroicons/react/24/solid";
import { unstable_cache as nextCache } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

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
  const isLiked = await db.like.findUnique({
    where: {
      id: {
        postId,
        userId: userId,
      },
    },
  });
  const likeCount = await db.like.count({
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
    <div className="p-5 text-white">
      <div className="flex items-center gap-2 mb-2">
        {post.user.avatar !== null ? (
          <Image
            width={28}
            height={28}
            className="rounded-md size-7"
            src={`${post.user.avatar!}/avatar`}
            alt={post.user.username}
          />
        ) : (
          <UserIcon aria-label="user_icon" className="size-7 rounded-md" />
        )}
        <div>
          <span className="text-sm font-semibold">{post.user.username}</span>
          <div className="text-xs">
            <span>{formatToTimeAgo(post.created_at.toString())}</span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="mb-5">{post.description}</p>
      <div className="flex flex-col items-start gap-5">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <EyeIcon aria-label="views" className="size-5" />
          <span>조회 {post.views}</span>
        </div>
        <LikeButton isLiked={isLiked} likeCount={likeCount} postId={id} />
      </div>
      <Comment postId={id} comments={comments} user={user} />
    </div>
  );
}
