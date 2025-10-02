/**
 * File Name : app/(tabs)/streams/actions/search
 * Description : 스트리밍 검색(키워드/카테고리/탭) 첫 페이지 액션
 * Author : 임도헌
 *
 * History
 * 2025.08.25  임도헌   Created   posts의 searchPosts 패턴과 동일한 역할
 * 2025.09.02  임도팀   Modified  TAKE 상수 STREAMS_PAGE_TAKE로 변경
 * 2025.09.10  임도헌   Modified  TAKE+1 페이지네이션/입력 정규화/주석 보강
 * 2025.09.17  임도헌   Modified  keyword/category 입력 정규화(trim) 일관화
 */

"use server";

import { getStreams } from "@/lib/stream/getStreams";
import { StreamsPage } from "./init";
import { STREAMS_PAGE_TAKE } from "@/lib/constants";

const TAKE = STREAMS_PAGE_TAKE;

function norm(v?: string) {
  const t = v?.trim();
  return t ? t : undefined;
}

export async function searchStreams(params: {
  scope: "all" | "following";
  keyword?: string;
  category?: string;
  viewerId: number | null;
}): Promise<StreamsPage> {
  const list = await getStreams({
    scope: params.scope,
    keyword: norm(params.keyword),
    category: norm(params.category),
    viewerId: params.viewerId,
    cursor: null,
    take: TAKE + 1,
  });

  const hasMore = list.length > TAKE;
  const streams = hasMore ? list.slice(0, TAKE) : list;
  const nextCursor = hasMore ? streams[streams.length - 1].id : null;

  return { streams, nextCursor };
}
