/**
 File Name : app\(tabs)\profile\[username]\streams\page.tsx
 Description : 유저 방송국 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.16  임도헌   Created
 2025.05.16  임도헌   Modified  유저 방송국 페이지 추가
 */
import { getUserStreams } from "@/app/streams/actions";
import UserStreamsClient from "@/components/user-streams-client";
import { Prisma } from "@prisma/client";
import { getisFollowing, getUserProfile } from "../actions";
import getSession from "@/lib/session";

interface Params {
  username: string;
}

export type UserStream = Prisma.PromiseReturnType<typeof getUserStreams>;
export type UserInfo = Prisma.PromiseReturnType<typeof getUserProfile>;

export default async function UserStreamsPage({ params }: { params: Params }) {
  // 한글 닉네임 디코딩
  const username = decodeURIComponent(params.username);
  // 현재 로그인한 사용자의 ID 가져오기
  const session = await getSession();
  const userId = session?.id;

  // getUserStreams로 해당 유저 방송만 가져오기
  const userStreams = await getUserStreams(username);
  //
  const userInfo = await getUserProfile(username, false);

  // 현재 로그인한 사용자가 이 프로필의 주인을 팔로우하고 있는지 확인
  let isFollowing = false;
  if (userInfo.id && userId) {
    isFollowing = await getisFollowing(userId, userInfo.id);
  }

  return (
    <UserStreamsClient
      userStreams={userStreams}
      userInfo={{
        ...userInfo,
        isFollowing,
      }}
      me={userInfo.id === userId}
    />
  );
}
