/**
File Name : components/product/ProductInfoItem
Description : 제품 상세 정보 아이템 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.25  임도헌   Created
2024.12.25  임도헌   Modified  제품 상세 정보 아이템 컴포넌트 추가
*/

export default function ProductInfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </h3>
      <p className="text-text dark:text-text-dark">{value}</p>
    </div>
  );
}
