/**
File Name : app/streams/get-categories/route
Description : 스트리밍 카테고리 조회 API
Author : 임도헌

History
Date        Author   Status    Description
2025.05.22  임도헌   Created
2025.05.22  임도헌   Modified  스트리밍 카테고리 가져오는는 API 추가
*/
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.streamCategory.findMany({
      orderBy: {
        kor_name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch stream categories:", error);
    return NextResponse.json(
      { error: "카테고리를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
