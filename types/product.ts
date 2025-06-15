/**
File Name : types\product
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
  GAME_TYPES,
} from "@/lib/constants";

// 🔹 View Mode (리스트 or 그리드)
export type ViewMode = "grid" | "list";

// 🔹 공통 Enum 기반 타입
export type GameType = (typeof GAME_TYPES)[number];
export type ConditionType = (typeof CONDITION_TYPES)[number];
export type CompletenessType = (typeof COMPLETENESS_TYPES)[number];

// 🔹 기본 이미지, 태그 타입
export interface ProductImage {
  url: string;
  order: number;
}

export interface ProductTag {
  name: string;
}

// 🔹 공통 제품 베이스
export interface BaseProduct {
  id: number;
  title: string;
  price: number;
  game_type: GameType;
  images: ProductImage[];
  search_tags: ProductTag[];
}

// 🔹 상세 정보 포함 (DB 기반, edit용 defaultValues로도 사용됨)
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

// 🔹 목록 조회용 (카테고리, 좋아요 수, 상태 등)
export interface ProductType extends BaseProduct {
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

// 🔹 상세 페이지용 (ProductType + ProductFullDetails + user)
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

// 🔹 카드 UI에 전달되는 props
export interface ProductCardProps {
  product: ProductType;
  viewMode: ViewMode;
  isPriority: boolean;
}

// 🔹 ProductList 컴포넌트의 props
export interface Products {
  products: ProductType[];
  nextCursor: number | null;
}

// 🔹 제품 응답 값
export interface ProductFormResponse {
  success: boolean;
  productId?: number;
  error?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
}

// 🔹 제품 폼 서버 액션
export type ProductFormAction = (
  formData: FormData
) => Promise<ProductFormResponse>;
