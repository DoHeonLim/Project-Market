/**
File Name : app/products/view/[id]/not-found
Description : 제품 상세 페이지 Not Found UI
Author : 임도헌

History
Date        Author   Status    Description
2024.12.12  임도헌   Created
2024.12.12  임도헌   Modified  제품 상세보기 페이지 없을 때 페이지 이동 코드 추가
2025.06.08  임도헌   Created   제품 상세 페이지 Not Found UI 공통 컴포넌트 적용
*/

import NotFound from "@/components/common/NotFound";

export default function ProductDetailNotFoundPage() {
  return (
    <NotFound
      title="제품을 찾을 수 없습니다"
      description="요청하신 제품이 삭제되었거나 존재하지 않습니다."
      redirectText="제품 목록으로 돌아가기"
      redirectHref="/products"
    />
  );
}
