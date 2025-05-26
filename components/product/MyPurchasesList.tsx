/**
File Name : components/product/MyPurchasesList
Description : 나의 구매 제품 리스트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.02  임도헌   Created
2024.12.02  임도헌   Modified  나의 구매 제품 리스트 컴포넌트
2024.12.12  임도헌   Modified  photo속성에서 images로 변경
2024.12.24  임도헌   Modified  다크모드 적용
2024.12.29  임도헌   Modified  구매 제품 리스트 컴포넌트 스타일 수정
*/

import MyPurchasesProductItem from "./MyPurchasesProductItem";

type ProductType = {
  id: number;
  title: string;
  price: number;
  images: {
    url: string;
  }[];
  purchase_userId: number | null;
  purchased_at: Date | null;
  user: {
    username: string;
    avatar: string | null;
  };
  reviews: {
    id: number;
    userId: number;
    productId: number;
    payload: string;
    rate: number;
  }[];
};

interface IPurchasedProductList {
  products: ProductType[];
}

export default function MyPurchasesList({ products }: IPurchasedProductList) {
  return (
    <div className="flex flex-col gap-6 mx-auto p-4">
      <h1 className="text-2xl font-semibold text-center text-primary dark:text-primary-light">
        구매 제품
      </h1>
      {products.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            구매한 제품이 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <MyPurchasesProductItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
