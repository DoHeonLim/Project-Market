/**
File Name : lib/cloudflare/getUploadUrl
Description : Cloudflare 이미지 업로드용 URL 요청 함수
Author : 임도헌

History
Date        Author   Status    Description
2025.06.12  임도헌   Created
2025.06.12  임도헌   Modified  Cloudflare 이미지 업로드용 URL 요청 함수를 lib로 옮김
*/
"use server";

export const getUploadUrl = async () => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data;
};
