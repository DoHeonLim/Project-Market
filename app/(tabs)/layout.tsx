/**
File Name : app/(tabs)/layout
Description : 탭 레이아웃
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.14  임도헌   Modified  메타 데이타 변경
*/

import TabBar from "@/components/tab-bar";

export default function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <TabBar />
    </div>
  );
}
