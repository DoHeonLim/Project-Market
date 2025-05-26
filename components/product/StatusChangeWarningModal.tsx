/**
File Name : components/product/StatusChangeWarningModal
Description : 상태 변경 경고 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.04  임도헌   Created
2024.12.04  임도헌   Modified  상태 변경 경고 모달 컴포넌트 추가
2024.12.29  임도헌   Modified  상태 변경 경고 모달 스타일 수정
*/

interface StatusChangeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle: string;
}

export default function StatusChangeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
}: StatusChangeWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-neutral-800 w-full max-w-md rounded-xl shadow-xl animate-fade-in mx-4">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
            상태 변경 경고
          </h2>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-4">
          <p className="text-neutral-700 dark:text-neutral-200">
            {productTitle} 제품을 판매 중으로 변경하시겠습니까?
          </p>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              주의: 판매 중으로 변경하면 이 제품에 작성된 모든 리뷰가
              삭제됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t dark:border-neutral-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 
              dark:bg-neutral-700 dark:hover:bg-neutral-600 
              text-neutral-700 dark:text-neutral-200 
              rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 
              dark:bg-red-600 dark:hover:bg-red-500 
              text-white rounded-lg transition-colors"
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
}
