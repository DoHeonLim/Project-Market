/**
 * File Name : types/post.ts
 * Description : 게시글 타입 정의
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.26  임도헌   Created   PostItem, PostDetail 타입 정의
 */

// 🔹 게시글의 기본 구조
export interface PostImage {
  id: number;
  url: string;
  order?: number; // 상세 페이지 대응용 (optional)
}

// 🔹 태그 정보
export interface PostTag {
  name: string;
}

// 🔹 게시글의 기본 구조
export interface BasePost {
  id: number;
  title: string;
  description: string | null;
  category: string; // 또는 categoryId 등
  created_at: Date;
}

// 🔹 목록 조회용
export interface PostType extends BasePost {
  tags: PostTag[];
  images: PostImage[];
}

// 🔹 상세 조회용
export interface PostDetail extends PostType {
  user: {
    username: string;
    avatar: string | null;
  };
  updated_at: Date;
  views: number;
  _count: {
    post_likes: number;
    comments: number;
  };
}

// 🔹 PostCard에 전달되는 props
export interface PostCardProps {
  post: PostDetail;
  viewMode: "list" | "grid";
  isPriority: boolean;
}

// 🔹 게시글 리스트 컴포넌트 props
export interface Posts {
  posts: PostDetail[];
  nextCursor: number | null;
}

// 🔹 게시글 폼 값
export interface PostFormValues {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  photos?: string[];
}

// 🔹 게시글 댓글
export interface PostComment {
  user: {
    username: string;
    avatar?: string;
  };
  id: number;
  created_at: Date;
  userId: number;
  payload: string;
}
