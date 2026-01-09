/**
File Name : prisma/seed
Description : 카테고리, 뱃지 시드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.15  임도헌   Created
2024.12.15  임도헌   Modified  카테고리 시드 추가
2025.04.13  임도헌   Modified  뱃지 시드 추가
2025.05.08  임도헌   Modified  스트리밍 카테고리 시드 추가
2025.12.07  임도헌   Modified  뱃지 설명 수정
*/

// prisma db seed 사용해서 데이터 추가

import db from "@/lib/db";

async function main() {
  // 기존 데이터 삭제 (순서 중요)
  await db.productMessage.deleteMany();
  await db.productChatRoom.deleteMany();
  await db.productImage.deleteMany();
  await db.productLike.deleteMany();
  await db.review.deleteMany();
  await db.product.deleteMany();
  await db.badge.deleteMany();
  await db.category.deleteMany();
  await db.streamCategory.deleteMany();

  const categories = [
    {
      eng_name: "STRATEGY",
      kor_name: "전략",
      icon: "🎯",
      description: "전략적 사고가 필요한 게임",
      subcategories: [
        {
          eng_name: "ECONOMY",
          kor_name: "경제",
          icon: "💰",
          description: "자원 관리와 경제 운영이 중심인 게임",
        },
        {
          eng_name: "CONQUEST",
          kor_name: "점령",
          icon: "⚔️",
          description: "영토 확장과 전투가 있는 게임",
        },
        {
          eng_name: "CIVILIZATION",
          kor_name: "문명",
          icon: "🏛️",
          description: "문명을 발전시키고 성장시키는 게임",
        },
        {
          eng_name: "WARGAME",
          kor_name: "전쟁",
          icon: "🎖️",
          description: "전쟁 시뮬레이션 게임",
        },
      ],
    },
    {
      eng_name: "FAMILY",
      kor_name: "가족",
      icon: "👨‍👩‍👧‍👦",
      description: "온가족이 함께 즐길 수 있는 게임",
      subcategories: [
        {
          eng_name: "CHILDREN",
          kor_name: "어린이",
          icon: "🧒",
          description: "아이들도 쉽게 즐길 수 있는 게임",
        },
        {
          eng_name: "PARTY",
          kor_name: "파티",
          icon: "🎉",
          description: "여러 명이 함께 즐기는 파티 게임",
        },
        {
          eng_name: "EDUCATION",
          kor_name: "교육",
          icon: "📚",
          description: "학습 요소가 포함된 교육용 게임",
        },
      ],
    },
    {
      eng_name: "THEME",
      kor_name: "테마",
      icon: "🎭",
      description: "특정 테마나 세계관을 가진 게임",
      subcategories: [
        {
          eng_name: "FANTASY",
          kor_name: "판타지",
          icon: "🐉",
          description: "마법과 모험이 있는 판타지 게임",
        },
        {
          eng_name: "HORROR",
          kor_name: "공포",
          icon: "👻",
          description: "공포와 미스터리 테마의 게임",
        },
        {
          eng_name: "SF",
          kor_name: "공상과학",
          icon: "🚀",
          description: "공상과학 테마의 게임",
        },
        {
          eng_name: "HISTORY",
          kor_name: "역사",
          icon: "📜",
          description: "역사적 사건이나 시대 배경의 게임",
        },
      ],
    },
    {
      eng_name: "REASONING",
      kor_name: "추리",
      icon: "🔍",
      description: "논리적 추론이 필요한 게임",
      subcategories: [
        {
          eng_name: "CRIME",
          kor_name: "범죄",
          icon: "🕵️",
          description: "범죄 해결과 수사가 테마인 게임",
        },
        {
          eng_name: "MYSTERY",
          kor_name: "미스터리",
          icon: "🎭",
          description: "비밀과 수수께끼를 푸는 게임",
        },
        {
          eng_name: "SOCIAL_MYSTERY",
          kor_name: "사회적 추리",
          icon: "🗣️",
          description: "마피아류의 사회적 추리 게임",
        },
      ],
    },
    {
      eng_name: "COOPERATION",
      kor_name: "협력",
      icon: "🤝",
      description: "플레이어들이 협력하는 게임",
      subcategories: [
        {
          eng_name: "SURVIVAL",
          kor_name: "생존",
          icon: "🏝️",
          description: "함께 생존해나가는 게임",
        },
        {
          eng_name: "PUZZLE",
          kor_name: "퍼즐",
          icon: "🧩",
          description: "협력하여 퍼즐을 해결하는 게임",
        },
        {
          eng_name: "TEAM_GAME",
          kor_name: "팀 게임",
          icon: "👥",
          description: "팀을 이루어 대결하는 게임",
        },
      ],
    },
  ];

  // 카테고리와 서브카테고리 생성
  for (const category of categories) {
    const { subcategories, ...categoryData } = category;

    const mainCategory = await db.category.create({
      data: categoryData,
    });

    // 서브카테고리 생성 및 부모 카테고리와 연결
    for (const subcategory of subcategories) {
      await db.category.create({
        data: {
          ...subcategory,
          parentId: mainCategory.id,
        },
      });
    }
  }

  // 스트리밍 카테고리 데이터
  const streamCategories = [
    {
      eng_name: "GAME_PLAY",
      kor_name: "게임 플레이",
      icon: "🎮",
      description: "실시간 게임 플레이 스트리밍",
      subcategories: [
        {
          eng_name: "MULTIPLAYER",
          kor_name: "멀티플레이",
          icon: "👥",
          description: "여러 명이 함께하는 게임 플레이",
        },
        {
          eng_name: "SOLO_PLAY",
          kor_name: "솔로 플레이",
          icon: "🎯",
          description: "개인 플레이 스트리밍",
        },
        {
          eng_name: "TOURNAMENT",
          kor_name: "토너먼트",
          icon: "🏆",
          description: "대회나 토너먼트 스트리밍",
        },
      ],
    },
    {
      eng_name: "REVIEW",
      kor_name: "리뷰",
      icon: "📝",
      description: "게임 리뷰 및 분석",
      subcategories: [
        {
          eng_name: "NEW_GAME_REVIEW",
          kor_name: "신규 게임 리뷰",
          icon: "🆕",
          description: "새로 출시된 게임 리뷰",
        },
        {
          eng_name: "CLASSIC_REVIEW",
          kor_name: "클래식 게임 리뷰",
          icon: "⭐",
          description: "클래식 게임 리뷰",
        },
        {
          eng_name: "COMPARISON_REVIEW",
          kor_name: "비교 리뷰",
          icon: "⚖️",
          description: "게임 비교 분석",
        },
      ],
    },
    {
      eng_name: "WORKTHROUGH",
      kor_name: "공략",
      icon: "📚",
      description: "게임 공략 및 팁",
      subcategories: [
        {
          eng_name: "BEGINNER_GUIDE",
          kor_name: "초보자 가이드",
          icon: "🎓",
          description: "초보자를 위한 게임 가이드",
        },
        {
          eng_name: "STRATEGY_WORKTHROUGH",
          kor_name: "전략 공략",
          icon: "🎯",
          description: "게임 전략과 공략",
        },
        {
          eng_name: "RULE_DESCRIPTION",
          kor_name: "규칙 설명",
          icon: "📖",
          description: "게임 규칙 상세 설명",
        },
      ],
    },
    {
      eng_name: "COMMUNITY",
      kor_name: "커뮤니티",
      icon: "💬",
      description: "커뮤니티 활동",
      subcategories: [
        {
          eng_name: "Q&A",
          kor_name: "질문과 답변",
          icon: "❓",
          description: "게임 관련 질문과 답변",
        },
        {
          eng_name: "DISCUSSION",
          kor_name: "토론",
          icon: "🗣️",
          description: "게임 관련 토론",
        },
        {
          eng_name: "EVENT",
          kor_name: "이벤트",
          icon: "🎉",
          description: "커뮤니티 이벤트",
        },
      ],
    },
  ];

  // 스트리밍 카테고리와 서브카테고리 생성
  for (const category of streamCategories) {
    const { subcategories, ...categoryData } = category;

    const mainCategory = await db.streamCategory.create({
      data: categoryData,
    });

    // 서브카테고리 생성 및 부모 카테고리와 연결
    for (const subcategory of subcategories) {
      await db.streamCategory.create({
        data: {
          ...subcategory,
          parentId: mainCategory.id,
        },
      });
    }
  }

  // 뱃지 데이터 생성
  const badges = [
    {
      name: "FIRST_DEAL",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/63dbdbf0-61bc-4632-b3cb-698f99bd1500",
      description:
        "첫 거래를 성공적으로 완료한 첫 거래 선원입니다. 작은 목선에서 첫 거래의 기쁨을 맛보았어요!",
    },
    {
      name: "POWER_SELLER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/18844d35-d462-4d59-839d-2fcc25134800",
      description:
        "10건 이상의 거래와 4.0 이상의 높은 평점을 기록한 파워 선상 상인입니다. 보드포트에서 신뢰할 수 있는 거래를 이어가고 있어요!",
    },
    {
      name: "QUICK_RESPONSE",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/b5a00613-399d-476f-2c00-fe3bd0297100",
      description:
        "최근 60일 기준 50개 이상의 메시지, 80% 이상의 응답률과 60분 이내의 빠른 답변을 기록한 신속한 교신병입니다. 조개껍데기 무전기로 발 빠른 소통을 이어가고 있어요!",
    },
    {
      name: "FIRST_POST",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/2239e58c-d339-4777-be77-7d9a38fc7300",
      description:
        "첫 게시글을 작성한 항해일지 작성자입니다. 등대 도서관에서 첫 발자국을 남겼어요!",
    },
    {
      name: "POPULAR_WRITER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/6791fdc6-dac2-4858-2db6-448b246a1e00",
      description:
        "최근 6개월 동안 5개 이상의 게시글과 총 50개 이상의 좋아요를 받은 인기 항해사입니다. 난파선 카페의 유명 작가가 되었어요!",
    },
    {
      name: "ACTIVE_COMMENTER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/9cc7214f-ae58-43ab-ba4d-75d31a9f6500",
      description:
        "최근 30일 동안 30개 이상의 댓글을 남기고, 그 중 규칙/후기 게시글에 남긴 댓글 비율이 30% 이상인 열정적인 통신사입니다.",
    },
    {
      name: "GAME_COLLECTOR",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/ee622a84-9d9c-4201-7dc6-a778069e2e00",
      description:
        "20회 이상 다양한 장르와 카테고리의 보드게임을 거래한 보물선 수집가입니다. 여러 항구를 넘나들며 풍부한 게임 경험을 쌓고 있어요!",
    },
    {
      name: "GENRE_MASTER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/bb30cb4b-d65a-481b-e65e-f5aead306100",
      description:
        "한 장르(카테고리)에서 10회 이상의 거래와 4.4 이상의 평점을 기록한 장르의 항해사입니다.",
    },
    {
      name: "RULE_SAGE",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/90fb9c56-d6be-49da-fe60-0471bfbbc400",
      description:
        "10개 이상의 규칙 설명 게시글과 500회 이상의 조회수를 받은 규칙의 현자입니다.",
    },
    {
      name: "VERIFIED_SAILOR",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/0534d88d-1944-4844-563c-20cc0a843200",
      description:
        "전화번호 인증을 완료한 인증된 선원입니다. 신뢰할 수 있는 나침반을 들고 있어요!",
    },
    {
      name: "FAIR_TRADER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/04b908dd-e9c7-40bb-4786-fe2b5af89900",
      description:
        "5회 이상의 거래에서 4.5 이상의 높은 평점을 기록한 정직한 상인입니다. 공정한 거래로 신뢰를 쌓고 있어요!",
    },
    {
      name: "QUALITY_MASTER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/4b6ed65a-732d-439e-4509-faa53dcb9400",
      description:
        "8회 이상 판매를 완료하고, 그 중 70% 이상을 새제품급/거의 새것 상태와 완벽한 구성으로 유지한 품질의 달인입니다!",
    },
    {
      name: "EARLY_SAILOR",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/63d81c0f-250a-4a87-ffea-142726992f00",
      description:
        "2025년 1월 1일 이전에 가입하고 활동한 첫 항해 선원입니다. 새벽 항구에서 첫 닻을 올린 선구자예요!",
    },
    {
      name: "PORT_FESTIVAL",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/7abfbeaa-f4e4-4499-f4ce-fb6bf9745d00",
      description:
        "최근 한 달 동안 3개 이상의 게시글, 10개 이상의 댓글, 1회 이상의 성공적인 거래로 항구를 뜨겁게 달군 축제의 주인공입니다. 당신의 활발한 활동이 우리 항구를 빛나게 만들어요!",
    },
    {
      name: "BOARD_EXPLORER",
      icon: "https://imagedelivery.net/3o3hwIVwLhMgAkoMCda2JQ/c033d8e8-a96f-4632-6f86-cc76b62a9700",
      description:
        "4가지 이상의 게임 타입을 거래하고, MAP/LOG 게시글 7개 이상을 남기며, 최근 6개월 기준 댓글 10개와 좋아요 30개 이상의 커뮤니티 기여도를 보여준 보드게임 탐험가입니다. 새로운 게임의 바다를 끝없이 탐험하고 있어요!",
    },
  ];

  // 뱃지 생성
  for (const badge of badges) {
    await db.badge.create({
      data: badge,
    });
  }

  console.log("카테고리, 스트리밍 카테고리, 뱃지 시드 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
