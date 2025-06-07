/**
 File Name : lib/auth/create-account/createAccount
 Description : 유저 회원가입 비즈니스 로직
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.30  임도헌   Created
 2025.05.30  임도헌   Modified  유저 회원가입 함수 분리
 */

import bcrypt from "bcrypt";
import db from "@/lib/db";
import getSession from "@/lib/session";

export async function createAccount(data: {
  username: string;
  email: string;
  password: string;
}) {
  // 패스워드 해싱
  const hashedPassword = await bcrypt.hash(data.password, 12);
  // 유저 저장
  const user = await db.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
    },
    select: { id: true },
  });
  // 로그인한 유저 저장
  const session = await getSession();
  session.id = user.id;
  await session.save();
}
