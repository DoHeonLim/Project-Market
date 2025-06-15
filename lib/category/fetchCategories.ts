/**
 * File Name : lib/category/fetchCategories
 * Description : 카테고리 목록을 DB에서 조회하는 유틸 함수
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.12  임도헌   Created   카테고리 전체 목록을 이름순으로 조회
 */

import db from "../db";

// 카테고리 목록 가져오기
export const fetchCategories = async () => {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        kor_name: "asc", // 한글 이름 기준 오름차순 정렬
      },
    });
    return categories;
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    throw new Error("카테고리를 불러오는 데 실패했습니다.");
  }
};
