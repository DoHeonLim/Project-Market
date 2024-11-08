/**
File Name : app/(tabs)/products/layout
Description : 모달 레이아웃
Author : 임도헌

History
Date        Author   Status    Description
2024.10.22  임도헌   Created
2024.10.22  임도헌   Modified  메타 데이타 변경
*/

export default function HomeLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
