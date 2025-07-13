/**
 * File Name : components/common/WaveModal.tsx
 * Description : 공통 모달 (파도 애니메이션)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.07.06  임도헌   Created   파도 애니메이션 공통 모달 생성
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface WaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function WaveModal({
  isOpen,
  onClose,
  children,
}: WaveModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // 배경 클릭 시 모달 닫기
          />

          {/* 파도치는 모달 박스 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-80">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
