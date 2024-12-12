/**
File Name : app/(tabs)/profile/(product)/my-sales/page
Description : 프로필 나의 판매 제품 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.11.30  임도헌   Created
2024.11.30  임도헌   Modified  프로필 나의 판매 제품 페이지 추가
2024.12.02  임도헌   Modified  nextCache기능 추가
2024.12.12  임도헌   Modified  뒤로가기 버튼 추가
*/

import MySalesProductList from "@/components/my-sales-product-list";
import { unstable_cache as nextCache } from "next/cache";
import { getSellingProducts } from "./actions";
import getSession from "@/lib/session";
import BackButton from "@/components/back-button";

export default async function MySalesPage() {
  const session = await getSession();
  const getCachedSellingProducts = nextCache(
    getSellingProducts,
    ["selling-product-list"],
    {
      tags: ["selling-product-list"],
    }
  );
  const sellingProduct = await getCachedSellingProducts(session.id!);

  return (
    <>
      <BackButton className="" />
      <MySalesProductList products={sellingProduct} userId={session.id!} />
    </>
  );
}
