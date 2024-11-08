/**
 File Name : app/(tabs)/products/(..)products/[id]/not-found
 Description : notFound 페이지 
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.05  임도헌   Created
 2024.11.05  임도헌   Modified  notFound 페이지 추가
 */

/**
  * products/add로 페이지 이동시 notFound가 발생하는데 page에서 아래 코드 때문인것 같다.
  * const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
     product/add로 이동시 add가 isNaN(add)이런 식으로 들어가서 생기는 에러인 듯 
  *  */
"use client";

const NotFound = () => {
  window.location.reload();
  return null;
};

export default NotFound;
