/**
File Name : app/profile/page
Description : 프로필 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.05  임도헌   Created
2024.10.05  임도헌   Modified  프로필 페이지 추가
2024.10.07  임도헌   Modified  로그아웃 버튼 추가
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

const getUser = async () => {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
};

export default async function Profile() {
  const user = await getUser();
  const logOut = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };
  return (
    <div>
      <h1>Welcome {user?.username}!</h1>
      <form action={logOut}>
        <button>Log out</button>
      </form>
    </div>
  );
}
