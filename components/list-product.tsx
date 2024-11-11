/**
File Name : components/list-product
Description : 제품 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.10.14  임도헌   Created
2024.10.14  임도헌   Modified  제품 컴포넌트 추가
2024.10.17  임도헌   Modified  이미지 object-cover로 변경
2024.11.11  임도헌   Modified  클라우드 플레어 이미지 variants 추가
*/

import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface IListProductProps {
  title: string;
  price: number;
  created_at: Date;
  photo: string;
  id: number;
}

export default function ListProduct({
  title,
  price,
  created_at,
  photo,
  id,
}: IListProductProps) {
  return (
    <Link href={`/products/${id}`} className="flex gap-5">
      <div className="relative overflow-hidden rounded-md size-28">
        <Image
          fill
          src={`${photo}/avatar`}
          className="object-cover"
          alt={title}
        />
      </div>
      <div className="flex flex-col gap-1 *:text-white">
        <span className="text-lg">{title}</span>
        <span className="text-sm text-neutral-500">
          {formatToTimeAgo(created_at.toString())}
        </span>
        <span className="text-lg font-semibold">{formatToWon(price)}원</span>
      </div>
    </Link>
  );
}
