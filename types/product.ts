/**
File Name : types/product
Description : 제품 타입 정의
Author : 임도헌

History
Date        Author   Status    Description
2025.06.07  임도헌   Created
2025.06.07  임도헌   Modified  제품 타입 정의
2025.06.15  임도헌   Modified   ProductWithDetails → ProductFullDetails로 통합
*/
import {
  COMPLETENESS_TYPES,
  CONDITION_TYPES,
  GAME_TYPE_DISPLAY,
  GAME_TYPES,
} from "@/lib/constants";

// View Mode (리스트 or 그리드)
export type ViewMode = "grid" | "list";

// 공통 Enum 기반 타입
export type GameType = (typeof GAME_TYPES)[number];
export type ConditionType = (typeof CONDITION_TYPES)[number];
export type CompletenessType = (typeof COMPLETENESS_TYPES)[number];

// 기본 이미지, 태그 타입
export interface ProductImage {
  url: string;
  order?: number;
}

export interface ProductTag {
  name: string;
}

// 공통 제품 베이스
export interface BaseProduct {
  id: number;
  title: string;
  price: number;
  game_type: GameType | string;
  images: ProductImage[];
  search_tags: ProductTag[];
}

// 상세 정보 포함 (DB 기반, edit용 defaultValues로도 사용됨)
export interface ProductFullDetails extends BaseProduct {
  description: string;
  min_players: number;
  max_players: number;
  play_time: string;
  condition: ConditionType;
  completeness: CompletenessType;
  has_manual: boolean;
  categoryId: number;
  userId: number;
}

// 목록 조회용 (카테고리, 좋아요 수, 상태 등)
export interface ProductType extends BaseProduct {
  created_at: Date | string;
  reservation_userId: number | null;
  purchase_userId: number | null;
  views: number;
  category: {
    kor_name: string;
    icon: string | null;
    parent?: {
      kor_name: string;
      icon: string | null;
    } | null;
  };
  _count: {
    product_likes: number;
  };
}

// 상세 페이지용 (ProductType + ProductFullDetails + user)
export interface ProductDetailType extends ProductFullDetails {
  user: {
    id: number;
    avatar: string | null;
    username: string;
  };
  created_at: Date;
  reservation_userId: number | null;
  purchase_userId: number | null;
  views: number;
  category: {
    eng_name: string;
    kor_name: string;
    icon: string | null;
    parent?: {
      eng_name: string;
      kor_name: string;
      icon: string | null;
    } | null;
  };
  _count: {
    product_likes: number;
  };
}

// 카드 UI에 전달되는 props
export interface ProductCardProps {
  product: ProductType;
  viewMode: ViewMode;
  isPriority: boolean;
}

// 제품 응답 값
export interface ProductFormResponse {
  success: boolean;
  productId?: number;
  error?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
}

// 제품 폼 서버 액션
export type ProductFormAction = (
  formData: FormData
) => Promise<ProductFormResponse>;

// --- 공용 유틸 타입 ---
export type ISODate = Date | string | null;

export interface ProductReview {
  id: number;
  userId: number;
  productId: number;
  payload: string;
  rate: number;
}

export interface ProfileUserLite {
  username: string;
  avatar: string | null;
}

// 제네릭 페이지네이션
export interface Paginated<T> {
  products: T[];
  nextCursor: number | null;
}

// 제품 탭별 갯수
export type TabCounts = { selling: number; reserved: number; sold: number };

// --- 프로필: '나의 판매 제품' 리스트 아이템용 ---
/**
 * 판매/예약/판매완료 탭 공용으로 쓰는 얇은 아이템 타입
 * - ProductType에서 필요한 필드만 Pick
 * - 리뷰/타임스탬프/판매자 간단정보는 선택적으로 추가(select 차이 흡수)
 */
export type MySalesListItem = {
  id: number;
  title: string;
  price: number;
  images: { url: string }[]; // 썸네일용 최소 형태
  created_at: ISODate;

  // 거래 상태 관련 (UI는 문자열/nullable에 맞춰 렌더)
  reservation_at?: ISODate | null;
  purchased_at?: ISODate | null;
  reservation_userId?: number | null;
  purchase_userId?: number | null;
  reservation_user?: { username: string; avatar: string | null } | null; // 추가
  purchase_user?: { username: string; avatar: string | null } | null; // 추가

  // 카테고리 칩
  category?: { kor_name: string; icon?: string | null } | null;

  // 지표
  views: number;
  _count: { product_likes: number };

  // 게임 스펙 칩
  game_type: keyof typeof GAME_TYPE_DISPLAY | string | null;
  min_players?: number | null;
  max_players?: number | null;
  play_time?: string | null;
  condition?: string | null;
  completeness?: string | null;

  // 선택적으로 붙는 프론트 전용 데이터
  reviews?: ProductReview[];
  user?: ProfileUserLite;
};

// --- 프로필: '나의 구매 제품' 리스트 아이템용 ---
/**
 * 구매 목록은 구매 시점(purchased_at)과 판매자 정보(user), 리뷰가 항상 필요
 */
export type MyPurchasedListItem = Pick<
  ProductType,
  "id" | "title" | "price" | "images" | "purchase_userId"
> & {
  purchased_at: ISODate; // 서버 select에 따라 null 가능하면 ISODate로 유지
  user: ProfileUserLite;
  reviews: ProductReview[];
};
