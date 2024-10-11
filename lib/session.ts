/**
File Name : lib/session
Description : 세션 추가
Author : 임도헌

History
Date        Author   Status    Description
2024.10.06  임도헌   Created
2024.10.06  임도헌   Modified  iron-session으로 쿠키 암호화
*/

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface ISessionContent {
  id?: number;
}

export default function getSession() {
  return getIronSession<ISessionContent>(cookies(), {
    cookieName: "user",
    password: process.env.COOKIE_PASSWORD!,
  });
}
