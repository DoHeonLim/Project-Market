/**
File Name : app/post/[id]/edit
Description : 게시글 편집 페이지
Author : 임도헌

History
Date        Author   Status    Description
2025.04.21  임도헌   Created
2025.04.21  임도헌   Modified  게시글 편집 페이지 추가
*/

import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { getPost } from "./actions";
import { getIsOwner } from "@/app/products/[id]/actions";
import PostEditForm from "@/components/post-edit-form";
import BackButton from "@/components/back-button";

export default async function PostEditPage({
  params,
}: {
  params: { id: string };
}) {
  // 게시글 아이디
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  // 게시글 정보
  const post = await getPost(id);
  if (!post) {
    return notFound();
  }

  // 작성자가 아니라면 홈으로
  const isOwner = await getIsOwner(post.userId);
  if (!isOwner) {
    redirect("/home");
  }

  const handleDeletePost = async () => {
    "use server";
    await db.post.delete({
      where: {
        id,
      },
    });
    redirect("/posts");
  };

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white p-4">
      <BackButton href="/posts" />
      <h1 className="text-2xl font-bold mb-6 dark:text-white">게시글 수정</h1>
      <PostEditForm post={post} />
      <form
        action={handleDeletePost}
        className="flex items-center justify-center"
      >
        <button className="bg-rose-700 hover:bg-rose-500 text-[10px] w-full mx-5 py-3 rounded-md text-white font-semibold sm:text-sm md:text-md">
          삭제하기
        </button>
      </form>
    </div>
  );
}
