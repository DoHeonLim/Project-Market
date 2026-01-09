/**
 * File Name : components/product/ProductCardTags
 * Description : 제품 태그 목록 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created   태그 리스트 컴포넌트로 분리
 */

interface ProductCardTagsProps {
  tags: {
    name: string;
  }[];
}

export function ProductCardTags({ tags }: ProductCardTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light rounded-full"
        >
          🏷️ {tag.name}
        </span>
      ))}
    </div>
  );
}
