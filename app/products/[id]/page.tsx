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
2024.11.09  임도헌   Modified  제품 채팅방 생성 함수 추가
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
2024.11.15  임도헌   Modified  본인이라면 채팅하기 버튼 필요 없으므로 코드 수정, 캐싱 기능 추가
2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";

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

  const createChatRoom = async () => {
    "use server";
    const session = await getSession();
    // 기존에 존재하는 방인지 확인
    const existingRoom = await db.productChatRoom.findFirst({
      where: {
        productId: product.id,
        users: {
          every: {
            id: {
              in: [product.userId, session.id!],
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (existingRoom) {
      // 이미 존재하는 채팅방으로 이동
      revalidateTag("chat-list");
      return redirect(`/chats/${existingRoom.id}`);
    }
    // 아니라면 채팅방 생성
    const room = await db.productChatRoom.create({
      data: {
        users: {
          connect: [
            {
              id: product.userId, // 판매자
            },
            {
              id: session.id,
            },
          ],
        },
        product: {
          connect: {
            id: product.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
    revalidateTag("chat-list");
    redirect(`/chats/${room.id}`);
  };

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
            <UserIcon aria-label="user_icon" />
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
          ) : (
            <form action={createChatRoom}>
              <button className="px-5 py-2.5 font-semibold text-white bg-indigo-300 rounded-md hover:bg-indigo-400 transition-colors">
                채팅하기
              </button>
            </form>
          )}
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
