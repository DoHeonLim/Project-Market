/**
File Name : app/(tabs)/life/page
Description : 동네생활 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  동네생활 페이지 추가
*/

import db from "@/lib/db";
import { formatToTimeAgo } from "@/lib/utils";
import {
  ChatBubbleBottomCenterIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
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
          likes: true,
        },
      },
    },
  });
  return posts;
};

export const metadata = {
  title: "동네생활",
};

export default async function Life() {
  const posts = await getPosts();
  console.log(posts);
  return (
    <div className="flex flex-col p-5">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="flex flex-col gap-2 pb-5 mb-5 border-b border-neutral-500 text-neutral-400 last:pb-0 last:border-b-0"
        >
          <h2 className="text-lg font-semibold text-white">{post.title}</h2>
          <p>{post.description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>{formatToTimeAgo(post.created_at.toString())}</span>
              <span>.</span>
              <span>조회 {post.views}</span>
            </div>
            <div className="flex items-center gap-4 *:flex *:gap-1 *:items-center">
              <span>
                <HandThumbUpIcon className="size-4" />
                {post._count.likes}
              </span>
              <span>
                <ChatBubbleBottomCenterIcon className="size-4" />
                {post._count.comments}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
