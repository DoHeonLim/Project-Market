/**
 * File Name : app/streams/[id]/recording/actions/likes
 * Description : 녹화본 좋아요 토글 server action (VodAsset 단위)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.04  임도헌   Created   녹화본 좋아요 기능 구현 (legacy liveStream)
 * 2025.09.06  임도헌   Modified  unstable_cache/revalidateTag 제거, 멱등/경합 내성 유지
 * 2025.09.10  임도헌   Modified  like/dislike가 즉시 isLiked/likeCount 반환 (클라 1회왕복)
 * 2025.09.20  임도헌   Modified  VodAsset 단위로 전환 (RecordingLike: @@id([userId, vodId]))
 */
"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

/** 현재 VodAsset에 대한 좋아요 상태/개수 조회 */
export async function getRecordingLikeStatus(
  vodId: number,
  userId: number | null
) {
  const [likeCount, likedRow] = await Promise.all([
    db.recordingLike.count({ where: { vodId } }),
    userId
      ? db.recordingLike.findUnique({
          where: { id: { userId, vodId } }, // @@id([userId, vodId])
          select: { userId: true },
        })
      : Promise.resolve(null),
  ]);

  return { isLiked: !!likedRow, likeCount };
}

type LikeResult =
  | { success: true; isLiked: boolean; likeCount: number }
  | { success: false; error: string };

/** 좋아요 ON (멱등/경합 내성) + 결과 반환 */
export async function likeRecording(vodId: number): Promise<LikeResult> {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "NOT_LOGGED_IN" };

  try {
    await db.recordingLike.create({
      data: { vodId, userId: session.id },
    });
  } catch (e: any) {
    // 이미 존재(P2002)는 멱등으로 무시, 나머지는 전파
    if (e?.code !== "P2002") throw e;
  }

  const likeCount = await db.recordingLike.count({ where: { vodId } });
  return { success: true, isLiked: true, likeCount };
}

/** 좋아요 OFF (멱등) + 결과 반환 */
export async function dislikeRecording(vodId: number): Promise<LikeResult> {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "NOT_LOGGED_IN" };

  await db.recordingLike.deleteMany({
    where: { vodId, userId: session.id },
  });

  const likeCount = await db.recordingLike.count({ where: { vodId } });
  return { success: true, isLiked: false, likeCount };
}
