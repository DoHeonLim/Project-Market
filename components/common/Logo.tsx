/**
File Name : components/common/Logo
Description : 로고 컴포넌트트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.13  임도헌   Created
2024.12.13  임도헌   Modified  로고 컴포넌트 추가

*/
"use client";
import Image from "next/image";
import logo from "@/public/images/logo.svg";
import { motion } from "framer-motion";

interface LogoProps {
  variant?: "full" | "symbol";
  size?: number;
  className?: string;
}

export default function Logo({
  variant = "full",
  size = 64,
  className = "",
}: LogoProps) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 로고 이미지 컨테이너 */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* 빛나는 효과 (로고 뒤에) */}
        <motion.div
          className="absolute inset-0 bg-yellow-300/30 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 로고 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: [0, -3, 3, -3, 0],
          }}
          transition={{
            duration: 0.8,
            rotate: {
              duration: 2,
              delay: 0.8,
              ease: "easeInOut",
            },
          }}
          className="relative w-full h-full"
        >
          <Image
            src={logo}
            alt="보드포트"
            fill
            priority
            className="object-contain z-10"
          />
        </motion.div>

        {/* 추가 빛나는 효과 (로고 앞에) */}
        <motion.div
          className="absolute inset-0 bg-white/40 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      {variant === "full" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 1,
          }}
          className="mt-4 text-center"
        >
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            보드포트
          </h1>
          <p className="text-blue-100 text-lg mt-1">모든 게임이 모이는 곳</p>
        </motion.div>
      )}
    </div>
  );
}
