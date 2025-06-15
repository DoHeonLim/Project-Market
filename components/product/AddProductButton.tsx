/**
 * File Name : components/product/AddProductButton
 * Description : 오른쪽 하단 고정형 제품 등록 버튼
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.07  임도헌   Created  플로팅 등록 버튼 컴포넌트화
 */

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function AddProductButton() {
  return (
    <Link
      href="/products/add"
      className="fixed flex items-center justify-center text-white transition-all duration-300 bg-primary dark:bg-primary-light rounded-full size-14 sm:size-16 bottom-20 sm:bottom-24 right-4 sm:right-8 hover:bg-primary-dark dark:hover:bg-primary-light-dark hover:scale-105 shadow-lg hover:shadow-xl"
    >
      <PlusIcon aria-label="add_product" className="size-8 sm:size-10" />
    </Link>
  );
}
