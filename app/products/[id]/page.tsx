/**
File Name : app/products/[id]/page
Description : 제품 상세 페이지
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 상세 페이지 추가
2024.10.17  임도헌   Modified  이미지 object-cover로 변경
2024.10.17  임도헌   Modified  제품 삭제 기능 추가
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

/**
 * 제품 소유자 체크 함수
 * @param {number} userId 유저 아이디
 * @returns 소유자가 맞으면 참, 아니라면 거짓
 */
const getIsOwner = async (userId: number) => {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
};

/**
 * 제품 id에 따른 제품 상세 정보
 * @param {number} id 제품 아이디
 * @returns 디비에 저장된 제품 상세 정보
 */
const getProduct = async (id: number) => {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
};

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);

  const handleDeleteProduct = async () => {
    "use server";
    await db.product.delete({
      where: {
        id,
      },
    });
    redirect("/products");
  };

  return (
    <div className="mb-24">
      <div className="relative aspect-square">
        <Image
          fill
          className="object-cover"
          src={product.photo}
          alt={product.title}
        />
      </div>
      <div className="flex items-center gap-3 p-5 border-b border-neutral-700">
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
      <div className="fixed bottom-0 left-0 flex items-center justify-between w-full p-5 bg-neutral-800">
        <span className="text-xl font-semibold">
          {formatToWon(product.price)}원
        </span>
        <div className="flex gap-5">
          {isOwner ? (
            <form action={handleDeleteProduct}>
              <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
                삭제하기
              </button>
            </form>
          ) : null}
          <Link
            className="px-5 py-2.5 font-semibold text-white bg-indigo-300 rounded-md hover:bg-indigo-400 transition-colors"
            href={``}
          >
            채팅하기
          </Link>
        </div>
      </div>
    </div>
  );
}
