/**
 * File Name : lib/stream/status/incrementVodViewCount
 * Description : VodAsset 조회수 증가
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.07  임도헌   Created   replay_view_count 증가 로직 추가 (legacy LiveStream)
 * 2025.09.20  임도헌   Modified  VodAsset 기준 전환 — 별도 집계로 이관될 때까지 no-op 처리
 */

import db from "@/lib/db";

export async function incrementVodViewCount(vodId: number): Promise<void> {
  if (!Number.isFinite(vodId)) return;
  await db.vodAsset.update({
    where: { id: vodId },
    data: { views: { increment: 1 } },
    select: { id: true }, // 최소 select
  });
}
