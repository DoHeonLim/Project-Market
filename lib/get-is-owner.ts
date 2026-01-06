/**
File Name : lib/get-is-owner
Description : 소유자 체크 함수
Author : 임도헌

History
Date        Author   Status    Description
2024.07.06  임도헌   Created
*/
"use server";
import getSession from "./session";

/**
 * 소유자 체크 함수
 * @param targetUserId 유저 ID
 * @returns 소유자 여부
 */
export const getIsOwner = async (targetUserId: number) => {
  const session = await getSession();
  if (session.id) {
    return session.id === targetUserId;
  }
  return false;
};
