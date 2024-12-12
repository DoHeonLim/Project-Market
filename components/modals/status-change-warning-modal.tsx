/**
File Name : components/modals/status-change-warning-modal
Description : 상태 변경 경고 모달 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.04  임도헌   Created
2024.12.04  임도헌   Modified  상태 변경 경고 모달 컴포넌트 추가
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="p-6 bg-neutral-800 rounded-lg w-[90%] max-w-md">
        <h2 className="mb-4 text-xl font-bold text-white">상태 변경 경고</h2>
        <p className="mb-2 text-white">
          {productTitle} 제품을 판매 중으로 변경하시겠습니까?
        </p>
        <p className="mb-6 text-red-500">
          ⚠️ 주의: 판매 중으로 변경하면 이 제품에 작성된 모든 리뷰가 삭제됩니다.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white transition-colors bg-gray-600 rounded hover:bg-gray-500"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-500"
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
}
