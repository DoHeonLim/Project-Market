/**
File Name : app/(tabs)/profile/action
Description : 프로필 서버 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.25  임도헌   Created
2024.11.25  임도헌   Modified  프로필 수정 코드 추가
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export const getUser = async () => {
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

export const logOut = async () => {
  "use server";
  const session = await getSession();
  session.destroy();
  redirect("/");
};
