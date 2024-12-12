/**
File Name : app/products/[id]/not-found.tsx
Description : 제품 상세보기 페이지 없을 때 페이지 이동
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created
2024.12.12  임도헌   Modified  제품 상세보기 페이지 없을 때 페이지 이동 코드 추가
*/

"use client";

const NotFound = () => {
  window.location.href = "/products";
  return null;
};

export default NotFound;
