/**
File Name : app/(tabs)/profile/page
Description : 프로필 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.05  임도헌   Created
2024.10.05  임도헌   Modified  프로필 페이지 추가
2024.10.07  임도헌   Modified  로그아웃 버튼 추가
2024.11.25  임도헌   Modified  프로필 페이지 레이아웃 추가
*/

import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { getUser, logOut } from "./actions";
import Link from "next/link";

export default async function Profile() {
  const user = await getUser();

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <span className="text-2xl font-semibold">프로필</span>
      <div className="flex flex-col gap-10 rounded-xl border-[2px] border-neutral-500 w-full py-10">
        <div className="flex justify-around ">
          {user.avatar !== null ? (
            <Image
              width={200}
              height={200}
              src={`${user.avatar!}/avatar`}
              alt={user.username}
              className="rounded-full size-52"
            />
          ) : (
            <UserIcon aria-label="user_icon" />
          )}
          <div className="flex items-center justify-center">
            <span>{user.username}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-6">
          <Link
            href="/profile/edit"
            className="primary-btn text-lg py-2.5 px-10 w-1/2"
          >
            프로필 수정
          </Link>
          <Link
            href="/profile/edit-password"
            className="primary-btn text-lg py-2.5 px-10 w-1/2"
          >
            비밀번호 수정
          </Link>
        </div>
      </div>

      <div>
        여기서 구매자나 판매자에 따라 거래 후기를 적을 수 있는 폼으로 이동 가능
      </div>
      <div className="flex gap-5">
        <div>판매 물품 컴포넌트</div>
        <div>구매 물품 컴포넌트</div>
      </div>

      <span>받은 거래후기</span>
      <div className="flex flex-col items-center justify-center">
        <div>거래 후기 간단 요약 </div>
        <div>거래후기 리스트</div>
      </div>
      <form action={logOut}>
        <button
          type="button"
          className="flex items-center justify-center w-40 h-10 font-semibold text-white transition-colors bg-indigo-600 rounded-md px-auto hover:bg-indigo-400"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
