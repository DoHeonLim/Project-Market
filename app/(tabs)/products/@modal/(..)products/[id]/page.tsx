/**
 File Name : app/(tabs)/products/(..)products/[id]/page
 Description : products/[id] 인터셉트 후 모달 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.22  임도헌   Created
 2024.10.22  임도헌   Modified  모달 페이지 추가(페러렐 라우트)
 2024.11.02  임도헌   Modified  제품 삭제 버튼 편집 페이지로 옮김
 2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
 */

import { getIsOwner, getProduct } from "@/app/products/[id]/page";
import CloseButton from "@/components/close-button";

import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Modal({
  params,
}: {
  params: {
    id: string;
  };
}) {
  // 제품 아이디
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  // 제품 정보
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-60">
      <CloseButton />
      <div className="flex flex-col justify-center h-auto max-w-screen-sm overflow-hidden rounded-lg bg-neutral-700">
        <div className="relative flex items-center justify-center w-64 max-w-screen-sm bg-white text-neutral-200 aspect-square md:w-96">
          <Image
            fill
            className="object-cover"
            src={`${product.photo}/width=300,height=300`}
            alt={product.title}
          />
        </div>
        <div className="flex items-center gap-3 p-5 border-b border-neutral-200">
          <div className="overflow-hidden rounded-full size-10">
            {product.user.avatar !== null ? (
              <Image
                width={40}
                height={40}
                src={product.user.avatar!}
                alt={product.user.username}
              />
            ) : (
              <UserIcon />
            )}
          </div>
          <div>
            <h3>{product.user.username}</h3>
          </div>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p>{product.description}</p>
        </div>
        <div className="flex items-center justify-between max-w-screen-sm gap-5 p-5 bg-neutral-800">
          <span className="text-sm font-semibold sm:text-sm md:text-md lg:text-lg ">
            {formatToWon(product.price)}원
          </span>
          <div className="flex gap-5">
            {isOwner ? (
              <Link
                href={`/products/${id}/edit`}
                className="px-2 py-1.5 font-semibold text-[10px] text-white bg-rose-700 rounded-md hover:bg-rose-500 transition-colors sm:text-sm md:text-md"
              >
                수정하기
              </Link>
            ) : null}
            <Link
              className="px-2 py-1.5 font-semibold text-[10px] text-white bg-indigo-300 rounded-md hover:bg-indigo-400 transition-colors sm:text-sm md:text-md"
              href={``}
            >
              채팅하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
