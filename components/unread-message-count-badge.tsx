/**
 File Name : components/unread-message-count-badge
 Description : 읽지 않은 메시지 갯수 뱃지
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.15  임도헌   Created
 2024.11.15  임도헌   Modified  읽지 않은 메시지 갯수 뱃지 컴포넌트 추가
 */
interface UnreadMessageCountBadgeProps {
  unreadCount: number;
}
export default function UnreadMessageCountBadge({
  unreadCount,
}: UnreadMessageCountBadgeProps) {
  return (
    <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
      <span className="text-white text-md">{unreadCount}</span>
    </div>
  );
}
