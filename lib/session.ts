/**
 * File Name : lib/session
 * Description : 세션 추가
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2024.10.06  임도헌   Created
 * 2024.10.06  임도헌   Modified  iron-session으로 쿠키 암호화
 * 2025.08.14  임도헌   Modified  unlockedStreamIds 추가
 */

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface ISessionContent {
  id?: number;
  /** PRIVATE 해제된 streamId 보관 */
  unlockedBroadcastIds?: Record<string, true>;
}

export default function getSession() {
  return getIronSession<ISessionContent>(cookies(), {
    cookieName: "user",
    password: process.env.COOKIE_PASSWORD!,
  });
}
