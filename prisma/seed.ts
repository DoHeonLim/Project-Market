/**
File Name : prisma/seed.ts
Description : 카테고리 시드
Author : 임도헌

History
Date        Author   Status    Description
2024.12.15  임도헌   Created
2024.12.15  임도헌   Modified  카테고리 시드 추가
*/

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: "전략",
      icon: "🎯",
      description: "전략적 사고가 필요한 게임",
      subcategories: [
        {
          name: "경제",
          icon: "💰",
          description: "자원 관리와 경제 운영이 중심인 게임",
        },
        {
          name: "정복",
          icon: "⚔️",
          description: "영토 확장과 전투가 있는 게임",
        },
        {
          name: "문명",
          icon: "🏛️",
          description: "문명을 발전시키고 성장시키는 게임",
        },
        { name: "워게임", icon: "🎖️", description: "전쟁 시뮬레이션 게임" },
      ],
    },
    {
      name: "가족",
      icon: "👨‍👩‍👧‍👦",
      description: "온가족이 함께 즐길 수 있는 게임",
      subcategories: [
        {
          name: "어린이",
          icon: "🧒",
          description: "아이들도 쉽게 즐길 수 있는 게임",
        },
        {
          name: "파티",
          icon: "🎉",
          description: "여러 명이 함께 즐기는 파티 게임",
        },
        {
          name: "교육",
          icon: "📚",
          description: "학습 요소가 포함된 교육용 게임",
        },
      ],
    },
    {
      name: "테마",
      icon: "🎭",
      description: "특정 테마나 세계관을 가진 게임",
      subcategories: [
        {
          name: "판타지",
          icon: "🐉",
          description: "마법과 모험이 있는 판타지 게임",
        },
        {
          name: "공포",
          icon: "👻",
          description: "공포와 미스터리 테마의 게임",
        },
        { name: "SF", icon: "🚀", description: "공상과학 테마의 게임" },
        {
          name: "역사",
          icon: "📜",
          description: "역사적 사건이나 시대 배경의 게임",
        },
      ],
    },
    {
      name: "추리",
      icon: "🔍",
      description: "논리적 추론이 필요한 게임",
      subcategories: [
        {
          name: "범죄",
          icon: "🕵️",
          description: "범죄 해결과 수사가 테마인 게임",
        },
        {
          name: "미스터리",
          icon: "🎭",
          description: "비밀과 수수께끼를 푸는 게임",
        },
        {
          name: "사회적 추리",
          icon: "🗣️",
          description: "마피아류의 사회적 추리 게임",
        },
      ],
    },
    {
      name: "협력",
      icon: "🤝",
      description: "플레이어들이 협력하는 게임",
      subcategories: [
        { name: "생존", icon: "🏕️", description: "함�� 생존해나가는 게임" },
        {
          name: "퍼즐",
          icon: "🧩",
          description: "협력하여 퍼즐을 해결하는 게임",
        },
        { name: "팀전", icon: "👥", description: "팀을 이루어 대결하는 게임" },
      ],
    },
  ];

  // 카테고리와 서브카테고리 생성
  for (const category of categories) {
    const { subcategories, ...categoryData } = category;

    const mainCategory = await prisma.category.create({
      data: categoryData,
    });

    // 서브카테고리 생성 및 부모 카테고리와 연결
    for (const subcategory of subcategories) {
      await prisma.category.create({
        data: {
          ...subcategory,
          parentId: mainCategory.id,
        },
      });
    }
  }

  console.log("카테고리 시드 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
