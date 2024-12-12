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
2024.12.05  임도헌   Modified  제품 상세 페이지 판매 여부 추가
2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
2024.12.11  임도헌   Modified  제품 사진 캐러셀 추가
2024.12.11  임도헌   Modified  제품 좋아요 추가
2024.12.11  임도헌   Modified  뒤로가기 버튼 추가
2024.12.12  임도헌   Modified  제품 생성 시간 표시 변경
*/

import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import UserAvatar from "@/components/user-avatar";
import Carousel from "@/components/carousel";
import ProductLikeButton from "@/components/product-like-button";
import BackButton from "@/components/back-button";
import TimeAgo from "@/components/time-ago";

/**
 * 제품 소유자 체크 함수
 * @param {number} userId 유저 아이디
 * @returns 소유자가 맞으면 참, 아니라면 거짓
 */
export const getIsOwner = async (userId: number) => {
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
      images: {
        orderBy: {
          order: "asc",
        },
        select: {
          url: true,
          order: true,
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

// 좋아요 상태 함수
const getProductLikeStatus = async (productId: number, userId: number) => {
  const isLiked = await db.productLike.findUnique({
    where: {
      id: {
        productId,
        userId,
      },
    },
  });
  const likeCount = await db.productLike.count({
    where: {
      productId,
    },
  });
  return {
    likeCount,
    isLiked: Boolean(isLiked),
  };
};

const getCachedProductLikeStatus = async (productId: number) => {
  const session = await getSession();
  const userId = session.id;
  const cachedOperation = nextCache(
    getProductLikeStatus,
    ["product-like-status"],
    {
      tags: [`product-like-status-${productId}`],
    }
  );
  return cachedOperation(productId, userId!);
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
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);
  const { likeCount, isLiked } = await getCachedProductLikeStatus(id);

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
    <div>
      <BackButton className="" />
      <div className="mb-24">
        <Carousel images={product.images} />
        <div className="flex items-center gap-3 p-5 border-b border-neutral-700">
          <UserAvatar
            avatar={product.user.avatar}
            username={product.user.username}
            size="md"
          />
        </div>
        <div className="flex justify-between items-center p-3 w-full">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <TimeAgo date={product.created_at?.toString()} />
        </div>
        <div className="pl-3 pb-3 max-w-[256px] md:max-w-[384px]">
          <p>{product.description}</p>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-between w-full max-w-screen-sm p-5 bg-neutral-800">
          <div className="flex items-center gap-2">
            <ProductLikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              productId={id}
            />
            {product.reservation_userId && product.purchase_userId ? (
              <span className="text-sm font-semibold bg-neutral-500 w-fit p-1 rounded-md">
                판매 완료
              </span>
            ) : product.reservation_userId ? (
              <span className="text-sm font-semibold bg-green-500 w-fit p-1 rounded-md">
                예약중
              </span>
            ) : null}
            <span className="text-lg font-semibold">
              {formatToWon(product.price)}원
            </span>
          </div>
          <div className="flex gap-5">
            {isOwner ? (
              <Link
                href={`/products/${id}/edit`}
                className="px-5 py-2.5 rounded-md text-white font-semibold bg-rose-700 hover:bg-rose-500 transition-colors"
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
