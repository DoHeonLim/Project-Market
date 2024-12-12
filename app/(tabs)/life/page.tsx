/**
File Name : app/(tabs)/life/page
Description : 동네생활 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  동네생활 페이지 추가
2024.11.23  임도헌   Modified  게시글을 최신 게시글순으로 출력되게 수정
2024.11.23  임도헌   Modified  게시글 생성 링크 추가
2024.12.12  임도헌   Modified  게시글 좋아요 명 변경
2024.12.12  임도헌   Modified  게시글 생성 시간 표시 변경
*/

import TimeAgo from "@/components/time-ago";
import db from "@/lib/db";
import {
  ChatBubbleBottomCenterIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const getPosts = async () => {
  const posts = await db.post.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      views: true,
      created_at: true,
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

export const metadata = {
  title: "동네생활",
};

export default async function Life() {
  const posts = await getPosts();
  return (
    <div className="flex flex-col p-5">
      {posts.map((post, idx) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className={`flex flex-col gap-2 p-2 mb-5 hover:bg-neutral-800 hover:rounded-md hover:scale-105 transition-all text-neutral-400 ${
            idx === posts.length - 1
              ? "border-0"
              : "border-b border-neutral-500"
          }`}
        >
          <h2 className="text-lg font-semibold text-white">{post.title}</h2>
          <p>{post.description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <TimeAgo date={post.created_at?.toString()} />
              <span>.</span>
              <span>조회 {post.views}</span>
            </div>
            <div className="flex items-center gap-4 *:flex *:gap-1 *:items-center">
              <span>
                <HandThumbUpIcon aria-label="thumb_up" className="size-4" />
                {post._count.post_likes}
              </span>
              <span>
                <ChatBubbleBottomCenterIcon
                  aria-label="comment_count"
                  className="size-4"
                />
                {post._count.comments}
              </span>
            </div>
          </div>
        </Link>
      ))}
      <Link
        href="posts/add"
        className="fixed flex items-center justify-center text-white transition-colors bg-indigo-400 rounded-full size-16 bottom-24 right-8 hover:bg-indigo-500"
      >
        <PlusIcon aria-label="add_post" className="size-10" />
      </Link>
    </div>
  );
}
