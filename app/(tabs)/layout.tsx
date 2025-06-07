/**
File Name : app/(tabs)/layout
Description : 탭 레이아웃
Author : 임도헌

History
Date        Author   Status    Description
2024.10.01  임도헌   Created
2024.10.14  임도헌   Modified  메타 데이타 변경
2025.04.29  임도헌   Modified  UI 수정
2025.05.29  임도헌   Modified  
*/

import TabBar from "@/components/common/TabBar";
import AppWrapper from "@/components/layout/AppWrapper";

export default function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWrapper>
      <main className="flex-1 w-full max-w-screen-sm mx-auto">{children}</main>
      <TabBar />
    </AppWrapper>
  );
}
