/**
 File Name : app/add-product/schema
 Description : 제품 스키마
 Author : 임도헌
 
 History
 Date        Author   Status    Description
 2024.11.11  임도헌   Created
 2024.11.11  임도헌   Modified  제품 스키마 추가
 2024.12.12  임도헌   Modified  products/add 에서 add-product로 이동
 2024.12.16  임도헌   Modified  제품 스키마를 보드게임으로 변경

 
*/
import { z } from "zod";

export const productSchema = z.object({
  title: z.string({
    required_error: "제목을 입력해주세요.",
  }),
  description: z.string({
    required_error: "설명을 입력해주세요.",
  }),
  price: z.coerce.number({
    required_error: "가격을 입력해주세요.",
  }),
  photos: z.array(
    z.string({
      required_error: "최소 1개 이상의 사진을 넣어주세요.",
    })
  ),
  game_type: z.enum(["보드게임", "TRPG", "카드게임"], {
    required_error: "게임 종류를 선택해주세요.",
  }),
  min_players: z.coerce
    .number({
      required_error: "최소 플레이어 수를 입력해주세요.",
    })
    .min(1, "최소 1명 이상이어야 합니다."),
  max_players: z.coerce.number({
    required_error: "최대 플레이어 수를 입력해주세요.",
  }),
  play_time: z.string({
    required_error: "플레이 시간을 입력해주세요.",
  }),
  condition: z.enum(["새제품급", "거의새것", "사용감있음", "많이사용됨"], {
    required_error: "제품 상태를 선택해주세요.",
  }),
  completeness: z.enum(["구성품전체", "부품일부없음", "호환품포함"], {
    required_error: "구성품 상태를 선택해주세요.",
  }),
  has_manual: z.boolean({
    required_error: "설명서 포함 여부를 선택해주세요.",
  }),
  categoryId: z.coerce.number({
    required_error: "카테고리를 선택해주세요.",
  }),
  tags: z
    .array(z.string())
    .min(1, "최소 1개 이상의 태그를 입력해주세요.")
    .max(5, "태그는 최대 5개까지 입력 가능합니다."),
});

export type ProductType = z.infer<typeof productSchema>;

// 상수 정의
export const GAME_TYPES = ["보드게임", "TRPG", "카드게임"] as const;
export const CONDITION_TYPES = [
  "새제품급",
  "거의새것",
  "사용감있음",
  "많이사용됨",
] as const;
export const COMPLETENESS_TYPES = [
  "구성품전체",
  "부품일부없음",
  "호환품포함",
] as const;
