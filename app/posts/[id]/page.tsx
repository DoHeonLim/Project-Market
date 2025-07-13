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
2025.07.06  임도헌   Modified  PostDetailWrapper로 분리
*/
import { notFound } from "next/navigation";
import { getCachedPost, getUser } from "./actions/posts";
import { getCachedLikeStatus } from "./actions/likes";
import PostDetailWrapper from "@/components/post/postsDetail";

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  const post = await getCachedPost(id);
  if (!post) return notFound();

  const user = await getUser();
  const { likeCount, isLiked } = await getCachedLikeStatus(id);

  return (
    <PostDetailWrapper
      post={post}
      user={user}
      likeCount={likeCount}
      isLiked={isLiked}
    />
  );
}
