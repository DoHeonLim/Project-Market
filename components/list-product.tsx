/**
File Name : components/list-product
Description : 제품 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 컴포넌트 추가
2024.10.17  임도헌   Modified  이미지 object-cover로 변경
2024.11.02  임도헌   Modified  콘솔에 뜨는 Image에러 size 추가
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
2024.12.07  임도헌   Modified  제품 판매 여부 추가
2024.12.11  임도헌   Modified  제품 대표 이미지로 변경
2024.12.11  임도헌   Modified  제품 마우스 오버 시 애니메이션 추가
*/

import { formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import TimeAgo from "./time-ago";

interface IListProductProps {
  title: string;
  price: number;
  created_at: Date;
  images: { url: string }[];
  id: number;
  reservation_userId: number | null;
  purchase_userId: number | null;
}

export default function ListProduct({
  title,
  price,
  created_at,
  images,
  id,
  reservation_userId,
  purchase_userId,
}: IListProductProps) {
  const thumbnailUrl = `${images[0]?.url}/avatar`;

  return (
    <Link
      href={`/products/${id}`}
      className="flex gap-5 p-2 hover:bg-neutral-800 hover:rounded-md hover:scale-105 transition-all"
    >
      <div className="relative overflow-hidden rounded-md size-28">
        <Image
          fill
          src={thumbnailUrl}
          sizes="(max-width: 768px) 112px, 112px"
          className="object-cover"
          alt={title}
        />
      </div>
      <div className="flex flex-col gap-1 justify-center *:text-white">
        <span className="text-lg">{title}</span>
        <TimeAgo date={created_at.toString()} />
        <div className="flex items-center gap-2">
          {reservation_userId && purchase_userId ? (
            <span className="text-sm font-semibold bg-neutral-500 w-fit p-1 rounded-md">
              판매 완료
            </span>
          ) : reservation_userId ? (
            <span className="text-sm font-semibold bg-green-500 w-fit p-1 rounded-md">
              예약중
            </span>
          ) : null}
          <span className="text-lg font-semibold">{formatToWon(price)}원</span>
        </div>
      </div>
    </Link>
  );
}
