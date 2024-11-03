/**
File Name : app/(tabs)/products/layout
Description : 모달 레이아웃
Author : 임도헌

History
Date        Author   Status    Description
2024.10.22  임도헌   Created
2024.10.22  임도헌   Modified  모달 레이아웃 추가
*/

export default function ModalLayout({
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
