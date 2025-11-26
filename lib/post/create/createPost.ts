/**
 * File Name : lib/post/create/createPost
 * Description : 게시글 생성 서버 액션
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.11.23  임도헌   Created
 * 2024.11.23  임도헌   Modified  동네생활 게시글 생성 코드 추가
 * 2024.12.10  임도헌   Modified  이미지 여러개 업로드 코드 추가
 * 2025.03.02  임도헌   Modified  게시글 작성시 게시글 추가 관련 뱃지 체크 추가
 * 2025.03.29  임도헌   Modified  checkBoardExplorerBadge 기능 추가
 * 2025.07.04  임도헌   Modified   게시글 생성 액션 분리 및 리팩토링
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { postFormSchema } from "@/lib/post/form/postFormSchema";
import {
  badgeChecks,
  checkBoardExplorerBadge,
  checkRuleSageBadge,
} from "@/lib/check-badge-conditions";

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "로그인이 필요합니다." };

  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    tags: JSON.parse(JSON.stringify(formData.getAll("tags[]"))),
    photos: JSON.parse(JSON.stringify(formData.getAll("photos[]"))),
  };

  const results = postFormSchema.safeParse(data);
  if (!results.success) {
    return { success: false, error: "유효성 검사에 실패했습니다." };
  }

  try {
    // 트랜잭션으로 게시글과 관련 데이터를 한번에 생성
    const post = await db.$transaction(async (tx) => {
      // 1. 게시글 생성
      const post = await tx.post.create({
        data: {
          title: results.data.title,
          description: results.data.description,
          category: results.data.category,
          user: { connect: { id: session.id } },
        },
      });

      // 2. 태그 처리
      if (results.data.tags?.length) {
        for (const tagName of results.data.tags) {
          // 태그 생성 또는 업데이트
          const tag = await tx.postTag.upsert({
            where: { name: tagName },
            create: { name: tagName, count: 1 },
            update: { count: { increment: 1 } },
          });
          // 게시글과 태그 연결
          await tx.post.update({
            where: { id: post.id },
            data: { tags: { connect: { id: tag.id } } },
          });
        }
      }

      // 3. 이미지 처리
      if (results.data.photos?.length) {
        await Promise.all(
          results.data.photos.map((url, index) =>
            tx.postImage.create({
              data: {
                url,
                order: index,
                post: { connect: { id: post.id } },
              },
            })
          )
        );
      }
      // 생성된 게시글 반환
      return post;
    });

    // 게시글 생성 후 뱃지 체크 수행
    await badgeChecks.onPostCreate(session.id);
    await badgeChecks.onEventParticipation(session.id);

    // 만약 category가 MAP일 경우에만 RULE_SAGE, BoardExplorer 뱃지 체크 수행
    if (results.data.category === "MAP") {
      await checkRuleSageBadge(session.id);
      await checkBoardExplorerBadge(session.id);
      // LOG일 경우에만 수행
    } else if (results.data.category === "LOG") {
      await checkBoardExplorerBadge(session.id);
    }

    // 게시글 ID 반환
    return { success: true, postId: post.id };
  } catch (error) {
    console.error("게시글 생성 오류:", error);
    return { success: false, error: "게시글 생성 중 오류가 발생했습니다." };
  }
}
