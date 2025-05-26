/**
File Name : app/(tabs)/layout
Description : 탭 레이아웃
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.14  임도헌   Modified  메타 데이타 변경
2025.04.29  임도헌   Modified  UI 수정
*/

import TabBar from "@/components/common/TabBar";

export default function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background-dark">
      <main className="flex-1 w-full max-w-screen-sm mx-auto">{children}</main>
      <TabBar />
    </div>
  );
}
