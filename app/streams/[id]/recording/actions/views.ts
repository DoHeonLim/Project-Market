/**
 * File Name : app/streams/[id]/recording/actions/views
 * Description : VOD 조회수 증가 server action
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.07  임도헌   Created   조회수 증가 처리
 */
"use server";

import { incrementVodViewCount } from "@/lib/stream/status/incrementVodViewCount";

export async function incrementVodView(vodId: number) {
  await incrementVodViewCount(vodId);
}
