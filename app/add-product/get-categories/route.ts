/**
File Name : app/add-product/get-categories/route.ts
Description : 카테고리 조회 라우트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.16  임도헌   Created
2024.12.16  임도헌   Modified  카테고리 조회 라우트 추가
*/
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("카테고리 조회 중 오류 발생:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
