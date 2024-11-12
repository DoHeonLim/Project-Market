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
2024.10.26  임도헌   Modified  메타데이터 추가
2024.11.02  임도헌   Modified  제품 삭제 버튼 편집 페이지로 옮김
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache as nextCache } from "next/cache";

/**
 * 제품 소유자 체크 함수
 * @param {number} userId 유저 아이디
 * @returns 소유자가 맞으면 참, 아니라면 거짓
 */
export const getIsOwner = async (userId: number) => {
  // 13.10 - cookie를 사용한다면 dynamic하다는 소리이기 때문에 주석처리하고 다른 코드를 사용해본다.
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
export const getProduct = async (id: number) => {
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

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail"],
});

/**
 * 제품 id에 따른 제품 타이틀 명
 * @param {number} id 제품 아이디
 * @returns 디비에 저장된 제품 타이틀 명
 */
export const getProductTitle = async (id: number) => {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
};

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  tags: ["product-title"],
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);

  return (
    <div className="mb-24">
      <div className="relative aspect-square">
        <Image
          fill
          className="object-cover"
          src={`${product.photo}/width=500,height=500`}
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
            <Link
              href={`/products/${id}/edit`}
              className="px-5 py-2.5 rounded-md text-white font-semibold  bg-rose-700 hover:bg-rose-500 transition-colors"
            >
              수정하기
            </Link>
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

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  return products.map((product) => ({ id: product.id + "" }));
}
