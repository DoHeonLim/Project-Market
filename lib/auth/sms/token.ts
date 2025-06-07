/**
 File Name : lib/auth/sms/smsSchema
 Description : 유저 SMS 로그인 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2025.05.30  임도헌   Created
 2025.05.30  임도헌   Modified  전송된 token 체크 기능 분리
*/
import crypto from "crypto";
import db from "@/lib/db";

export async function generateUniqueToken(): Promise<string> {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({ where: { token } });
  return exists ? generateUniqueToken() : token;
}
