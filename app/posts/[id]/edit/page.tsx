/**
 * File Name : app/post/[id]/edit
 * Description : 게시글 편집 페이지
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.04.21  임도헌   Created
 * 2025.04.21  임도헌   Modified  게시글 편집 페이지 추가
 * 2025.07.04  임도헌   Modified  게시글 등록, 편집 컴포넌트로 통합
 * 2025.11.13  임도헌   Modified  뒤로가기 버튼 layout으로 이동
 * 2025.11.20  임도헌   Modified  삭제 흐름 정리
 */
import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/post/PostForm";
import { updatePost } from "@/lib/post/update/updatePost";
import { getIsOwner } from "@/lib/get-is-owner";
import { deletePost, getPost } from "../actions/posts";

export default async function PostEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  const post = await getPost(id);
  if (!post) return notFound();

  const isOwner = await getIsOwner(post.userId);
  if (!isOwner) redirect("/home");

  const handleDeletePost = async () => {
    "use server";
    await deletePost(id);
    redirect("/posts");
  };

  return (
    <div className="min-h-screen dark:bg-neutral-900 bg-white">
      <PostForm
        initialValues={{
          id: post.id,
          title: post.title,
          description: post.description ?? "",
          category: post.category,
          tags: post.tags.map((tag) => tag.name),
          photos: post.images.map((image) => image.url),
        }}
        onSubmit={updatePost}
        backUrl={`/posts/${post.id}`}
        submitLabel="수정 완료"
        isEdit
      />
      <form
        action={handleDeletePost}
        className="flex items-center justify-center"
      >
        <button className="bg-rose-700 hover:bg-rose-500 w-full mx-5 py-2 rounded-md text-white font-semibold sm:text-sm md:text-md">
          삭제하기
        </button>
      </form>
    </div>
  );
}
