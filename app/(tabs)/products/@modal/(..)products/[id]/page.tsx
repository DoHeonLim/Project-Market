/**
 File Name : app/(tabs)/products/(..)products/[id]/page
 Description : products/[id] 인터셉트 후 모달 페이지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.10.22  임도헌   Created
 2024.10.22  임도헌   Modified  모달 페이지 추가(페러렐 라우트)
 2024.11.02  임도헌   Modified  제품 삭제 버튼 편집 페이지로 옮김
 2024.11.08  임도헌   Modified  채팅방 생성 함수 추가
 2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
 2024.11.15  임도헌   Modified  본인이라면 채팅하기 버튼 필요 없으므로 코드 수정
 2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
 2024.11.21  임도헌   Modified  제품 제목이나 내용이 길어질 경우 창이 커지는 것 수정
 2024.12.05  임도헌   Modified  제품 상세 페이지 판매 여부 추가
 2024.12.07  임도헌   Modified  프로필 이미지 컴포넌트 분리
 */

import { getIsOwner, getProduct } from "@/app/products/[id]/page";
import CloseButton from "@/components/close-button";
import UserAvatar from "@/components/user-avatar";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
      revalidateTag("chatroom-list");
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
    revalidateTag("chatroom-list");
    redirect(`/chats/${room.id}`);
  };

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
          <UserAvatar
            avatar={product.user.avatar}
            username={product.user.username}
            size="md"
          />
        </div>
        <div className="p-3 max-w-[256px] ">
          <h1 className="text-2xl font-semibold mb-2">{product.title}</h1>
          <p>{product.description}</p>
        </div>
        <div className="flex items-center justify-between max-w-screen-sm gap-5 p-5 bg-neutral-800">
          <div className="flex items-center gap-2">
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
                className="px-2 py-1.5 font-semibold text-[10px] text-white bg-rose-700 rounded-md hover:bg-rose-500 transition-colors sm:text-sm md:text-md"
              >
                수정하기
              </Link>
            ) : (
              <form action={createChatRoom}>
                <button className="px-2 py-1.5 font-semibold text-[10px] text-white bg-indigo-300 rounded-md hover:bg-indigo-400 transition-colors sm:text-sm md:text-md">
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
