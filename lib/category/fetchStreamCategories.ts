/**
 * File Name : lib/category/fetchStreamCategories
 * Description : 스트리밍 카테고리 목록을 DB에서 조회하는 유틸 함수
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.30  임도헌   Created   app/streams/get-categories/route
 * 2025.07.30  임도헌   Modified  기존 app/streams/get-categories/route에서 api 방식이 아닌 직접 조회 방식으로 변경
 */

import db from "../db";

// 스트리밍 카테고리 목록 가져오기
export const fetchStreamCategories = async () => {
  try {
    const categories = await db.streamCategory.findMany({
      orderBy: {
        kor_name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("스트리밍 카테고리 조회 실패:", error);
    throw new Error("카테고리를 불러오는 데 실패했습니다.");
  }
};
