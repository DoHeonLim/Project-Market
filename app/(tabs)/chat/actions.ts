/**
File Name : app/(tabs)/chat/actions
Description : 채팅 server 코드
Author : 임도헌

History
Date        Author   Status    Description
2024.11.15  임도헌   Created
2024.11.15  임도헌   Modified  활성화된 채팅방 불러오는 함수 추가
2024.11.15  임도헌   Modified  읽지 않은 메시지 갯수 함수 추가
2024.11.18  임도헌   Modified  getChatRooms 최신 메시지 기준으로 정렬
2024.11.21  임도헌   Modified  Chatroom을 productChatRoom으로 변경
2024.12.12  임도헌   Modified  제품 대표 사진 하나 들고오기
*/
"use server";

import db from "@/lib/db";

export type ChatRoomType = {
  id: string;
  created_at: Date;
  updated_at: Date;
  productId: number;
  users: {
    id: number;
    username: string;
    avatar: string | null;
  }[];
  messages: {
    payload: string;
    created_at: Date;
    isRead: boolean;
    userId: number;
  }[];
  product: {
    id: number;
    title: string;
    images: {
      url: string;
    }[];
  };
};

export const getChatRoom = async (id: string, userId: number) => {
  const chatRoom = (await db.productChatRoom.findUnique({
    where: {
      id,
    },
    include: {
      // 상대 유저
      users: {
        where: {
          NOT: {
            id: userId,
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      // 제품명 및 제품 사진
      product: {
        select: {
          id: true,
          title: true,
          images: {
            where: { order: 0 },
            select: { url: true },
            take: 1,
          },
        },
      },
      // 마지막으로 보낸 메시지
      messages: {
        orderBy: {
          created_at: "desc",
        },
        take: 1,
        select: {
          payload: true,
          created_at: true,
          isRead: true,
          userId: true,
        },
      },
    },
  })) as ChatRoomType;
  return chatRoom;
};

// 모든 활성화된 채팅방 불러오기
export const getChatRooms = async (id: number) => {
  const chatRooms = (await db.productChatRoom.findMany({
    // 로그인한 유저의 id가 포함된 채팅방 찾기
    where: {
      users: {
        some: {
          id: {
            in: [id],
          },
        },
      },
    },
    // 보여줘야 될 것 : 어떤 제품의 채팅방인가, 상대 유저의 정보, 제품의 정보, 최신 메시지 내용
    include: {
      // 상대 유저
      users: {
        where: {
          NOT: {
            id,
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      // 제품명 및 제품 사진
      product: {
        select: {
          id: true,
          title: true,
          images: {
            where: { order: 0 },
            select: { url: true },
            take: 1,
          },
        },
      },
      // 마지막으로 보낸 메시지
      messages: {
        orderBy: {
          created_at: "desc",
        },
        take: 1,
        select: {
          payload: true,
          created_at: true,
          isRead: true,
          userId: true,
        },
      },
    },
  })) as ChatRoomType[];

  // 메시지의 created_at을 기준으로 채팅방을 정렬
  chatRooms.sort((a, b) => {
    const aCreatedAt = a.messages[0]?.created_at || new Date(0);
    const bCreatedAt = b.messages[0]?.created_at || new Date(0);
    return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
  });
  return chatRooms;
};

// 다른 유저가 보낸 읽지 않은 메시지 갯수
// 나의 메시지를 제외한 다른 유저가 보낸 메시지의 갯수만 카운트
export const unreadMessageCountDB = async (
  id: number,
  productChatRoomId: string
) => {
  try {
    const count = await db.productMessage.count({
      where: {
        userId: {
          not: id,
        },
        productChatRoomId,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
};
