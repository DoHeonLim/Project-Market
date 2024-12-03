/**
File Name : components/my-purchases-list
Description : 나의 구매 제품 리스트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.02  임도헌   Created
2024.12.02  임도헌   Modified  나의 구매 제품 리스트 컴포넌트
*/

import MyPurchasesProductItem from "./my-purchases-product-item";

type ProductType = {
  user: {
    username: string;
    avatar: string | null;
  };
  id: number;
  title: string;
  price: number;
  photo: string;
  purchase_userId: number | null;
  purchased_at: Date | null;
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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl flex justify-center items-center">구매 제품</h1>
      {products.length === 0 ? (
        <p className="text-neutral-500 text-center">구매한 제품이 없습니다.</p>
      ) : (
        products.map((product) => (
          <MyPurchasesProductItem key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
