/**
 * File Name : components/post/postDetail/PostDetailCarousel
 * Description : 게시글 상세 이미지 캐러셀
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.11  임도헌   Created   PostDetail Carousel 분리
 */
"use client";

import { motion } from "framer-motion";
import Carousel from "@/components/common/Carousel";

interface PostDetailCarouselProps {
  images: { id: number; url: string }[];
}

export default function PostDetailCarousel({
  images,
}: PostDetailCarouselProps) {
  if (images.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
      className="relative aspect-video w-full overflow-hidden mt-6 rounded-xl shadow"
    >
      <Carousel images={images} className="w-full h-full" />
    </motion.div>
  );
}
