/**
 * File Name : components/product/ProductCardTitle
 * Description : 제품 제목 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created   제품 제목 전용 컴포넌트 분리
 */

interface ProductCardTitleProps {
  title: string;
  viewMode: "grid" | "list";
}

export function ProductCardTitle({ title, viewMode }: ProductCardTitleProps) {
  return (
    <h3
      className={`font-semibold text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors ${
        viewMode === "grid"
          ? "text-sm sm:text-base line-clamp-2"
          : "text-base sm:text-lg line-clamp-1"
      }`}
    >
      {title}
    </h3>
  );
}
