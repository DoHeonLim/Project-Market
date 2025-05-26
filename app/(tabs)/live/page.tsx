/**
 File Name : app/(tabs)/live/page
 Description : 라이브 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.12  임도헌   Created
 2024.11.12  임도헌   Modified  라이브 페이지 추가
 2024.11.19  임도헌   Modified  캐싱 기능 추가
 2024.11.21  임도헌   Modified  리스트 결과 값 스타일 수정
 2024.12.12  임도헌   Modified  라이브 페이지 스타일 변경
 2024.04.18  임도헌   Modified  스트리밍 상태 정보 전달 추가
 2025.05.20  임도헌   Modified  카테고리 필터링 기능 추가
 2025.05.22  임도헌   Modified  CONNECTED 상태의 방송만 표시하도록 수정
 2025.05.23  임도헌   Modified  팔로우 상태 정보 추가
 2025.05.23  임도헌   Modified  클라이언트 코드 분리
 */

import { getStreams } from "@/app/streams/actions";
import { getFollowingStreams } from "@/app/(tabs)/live/actions";
import LivePageClient from "./LivePageClient";

export type LiveStream = Awaited<ReturnType<typeof getStreams>>;
export type FollowingStream = Awaited<ReturnType<typeof getFollowingStreams>>;

interface LivePageProps {
  searchParams: {
    category?: string;
    keyword?: string;
  };
}

export default async function LivePage({ searchParams }: LivePageProps) {
  const allStreams = await getStreams(searchParams.category);
  const followingStreams = await getFollowingStreams();

  return (
    <LivePageClient
      allStreams={allStreams}
      followingStreams={followingStreams}
      searchParams={searchParams}
    />
  );
}
