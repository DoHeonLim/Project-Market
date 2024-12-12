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
*/

import Comment from "@/components/comment";
import PostLikeButton from "@/components/post-like-button";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { EyeIcon } from "@heroicons/react/24/solid";
import { unstable_cache as nextCache } from "next/cache";
import { notFound } from "next/navigation";
import UserAvatar from "@/components/user-avatar";
import Carousel from "@/components/carousel";
import BackButton from "@/components/back-button";
import TimeAgo from "@/components/time-ago";

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
    <div className="p-5 mt-14 text-white">
      <BackButton className="bg-neutral-900 border-b border-neutral-800" />
      <div className="flex items-center gap-6 mb-2">
        <UserAvatar avatar={post.user.avatar} username={post.user.username} />
      </div>
      <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
      <p className="mb-5">{post.description}</p>

      {/* 이미지 갤러리를 Carousel로 교체 */}
      <div className="w-full">
        <div className="w-2/3 mx-auto mb-5 flex justify-center">
          {post.images && post.images.length > 0 && (
            <Carousel images={post.images} />
          )}
        </div>
      </div>

      <div className="flex flex-col items-start mt-3 gap-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <EyeIcon aria-label="views" className="size-5" />
            <span>조회 {post.views}</span>
          </div>
          <TimeAgo date={post.created_at?.toString() ?? null} />
        </div>
        <PostLikeButton isLiked={isLiked} likeCount={likeCount} postId={id} />
      </div>
      <Comment postId={id} comments={comments} user={user} />
    </div>
  );
}
