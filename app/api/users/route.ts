/**
File Name : app/api/users
Description : 유저 api route
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.01  임도헌   Modified  유저 api 기능 추가
*/
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(request);
  return Response.json({
    ok: true,
  });
}

export async function POST(requset: NextRequest) {
  const data = await requset.json();
  return Response.json({
    data,
  });
}
