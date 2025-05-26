/**
File Name : app/(tabs)/profile/(product)/my-purchases/page
Description : 프로필 나의 구매 제품 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  프로필 나의 구매 제품 페이지 추가
2024.12.12  임도헌   Modified  뒤로가기 버튼 추가
*/

import getSession from "@/lib/session";
import { unstable_cache as nextCache } from "next/cache";
import { getPurchasedProducts } from "./actions";
import MyPurchasesList from "@/components/product/MyPurchasesList";
import BackButton from "@/components/common/BackButton";

// 상태 유저에 대한 리뷰 기능 추가해야됨
export default async function MyPurchasesPage() {
  const session = await getSession();
  const getCachedPurchasedProducts = nextCache(
    getPurchasedProducts,
    ["purchased-product-list"],
    {
      tags: ["purchased-product-list", "selling-product-list"],
    }
  );
  const purchasedProducts = await getCachedPurchasedProducts(session.id!);

  return (
    <>
      <BackButton className="" />
      <MyPurchasesList products={purchasedProducts} />
    </>
  );
}
