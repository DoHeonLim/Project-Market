/**
 * File Name : app/(tabs)/streams/page
 * Description : 라이브 스트리밍 탭 페이지 (URL 기반 탭 + 검색 + 무한스크롤)
 * Author : 임도헌
 *
 * History
 * 2024.04.18  임도헌   Modified  스트리밍 상태 정보 전달 추가
 * 2024.11.12  임도헌   Created
 * 2024.11.12  임도헌   Modified  라이브 페이지 추가
 * 2024.11.19  임도헌   Modified  캐싱 기능 추가
 * 2024.11.21  임도헌   Modified  리스트 결과 값 스타일 수정
 * 2024.12.12  임도헌   Modified  라이브 페이지 스타일 변경
 * 2025.05.20  임도헌   Modified  카테고리 필터링 기능 추가
 * 2025.05.22  임도헌   Modified  CONNECTED 상태의 방송만 표시하도록 수정
 * 2025.05.23  임도헌   Modified  팔로우 상태 정보 추가
 * 2025.05.23  임도헌   Modified  클라이언트 코드 분리
 * 2025.08.25  임도헌   Modified  posts 페이지 형태로 기능 분리(탭/검색/리스트/Empty/추가 버튼)
 * 2025.08.25  임도헌   Modified  StreamListSection 래퍼 도입(onRequestFollow 복구, router.refresh)
 * 2025.08.25  임도헌   Modified  URL 스코프 기반 초기 로딩 + 클라이언트 무한스크롤 연결
 * 2025.09.09  임도헌   Modified  a11y(nav/role=tablist), scope 정규화 변수, 주석 보강
 * 2025.11.21  임도헌   Modified  스트리밍 리스트 페이지 캐싱 제거(dynamic SSR로 변경)
 */

import Link from "next/link";
import getSession from "@/lib/session";

import { getInitialStreams } from "./actions/init";
import { searchStreams } from "./actions/search";

import StreamCategoryTabs from "@/components/search/StreamCategoryTabs";
import StreamSearchBarWrapper from "@/components/stream/StreamSearchBarWrapper";
import StreamEmptyState from "@/components/stream/StreamEmptyState";
import AddStreamButton from "@/components/stream/AddStreamButton";
import StreamListSection from "@/components/stream/StreamListSection";
import LiveStatusRealtimeSubscriber from "@/components/stream/LiveStatusRealtimeSubscriber";

export const dynamic = "force-dynamic"; // 명시적으로 동적 페이지 선언

interface StreamsPageProps {
  searchParams: {
    keyword?: string;
    category?: string;
    scope?: "all" | "following";
  };
}

export default async function StreamsPage({ searchParams }: StreamsPageProps) {
  const session = await getSession();
  const viewerId = session?.id ?? null;

  // 스코프 정규화
  const scope: "all" | "following" =
    searchParams.scope === "following" ? "following" : "all";

  // 검색/필터/스코프 여부
  const hasSearchParams =
    !!searchParams.keyword || !!searchParams.category || scope !== "all";

  /**
   * 리스트 페이지는 캐시 미사용
   * - 스트리밍 상태/팔로우 상태 등 실시간/개인화 의존도가 높음
   * - Supabase Realtime + router.refresh()로 최신 상태 반영
   */
  const initial = hasSearchParams
    ? await searchStreams({
        scope,
        category: searchParams.category,
        keyword: searchParams.keyword,
        viewerId,
      })
    : await getInitialStreams({
        scope: "all",
        category: undefined,
        keyword: undefined,
        viewerId,
      });

  // 탭 링크 빌더(기존 파라미터 유지)
  const buildHref = (nextScope: "all" | "following") => {
    const sp = new URLSearchParams();
    if (searchParams.category) sp.set("category", searchParams.category);
    if (searchParams.keyword) sp.set("keyword", searchParams.keyword);
    if (nextScope !== "all") sp.set("scope", nextScope);
    const q = sp.toString();
    return q ? `/streams?${q}` : `/streams`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-background-dark">
      {/* 같은 탭에서 라이브 상태 변동 시 즉시 새로고침 */}
      <LiveStatusRealtimeSubscriber />

      {/* 상단: 카테고리 탭 + 검색 + 스코프 탭 */}
      <div
        className="
          sticky top-0 z-10 border-b border-neutral-200 
         bg-white/80 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80
          p-3 sm:p-4           
        "
      >
        <StreamCategoryTabs currentCategory={searchParams.category} />

        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3 sm:gap-4">
          <StreamSearchBarWrapper />

          {/* 스코프 전환: 링크 탭 역할 */}
          <nav aria-label="스트리밍 보기 범위" role="tablist">
            <div
              className="
                inline-flex items-center rounded-2xl border border-neutral-200/60
                bg-white/50 backdrop-blur dark:border-neutral-700/60 dark:bg-neutral-900/40
                p-[3px] sm:p-1                        
              "
            >
              <Link
                href={buildHref("all")}
                role="tab"
                aria-selected={scope === "all"}
                aria-current={scope === "all" ? "page" : undefined}
                className={`
                  inline-flex items-center justify-center rounded-xl
                  h-9 min-w-[60px] px-3 text-xs sm:h-11 sm:min-w-[80px] sm:px-4 sm:text-sm
                  font-semibold transition
                  ${
                    scope === "all"
                      ? "bg-neutral-900 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] dark:bg-white dark:text-neutral-900"
                      : "text-neutral-700 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/5"
                  }
                `}
              >
                전체
              </Link>

              <Link
                href={buildHref("following")}
                role="tab"
                aria-selected={scope === "following"}
                aria-current={scope === "following" ? "page" : undefined}
                className={`
                  inline-flex items-center justify-center rounded-xl
                  h-9 min-w-[60px] px-3 text-xs sm:h-11 sm:min-w-[80px] sm:px-4 sm:text-sm
                  font-semibold transitio80
                  ${
                    scope === "following"
                      ? "bg-neutral-900 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] dark:bg-white dark:text-neutral-900"
                      : "text-neutral-700 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/5"
                  }
                `}
              >
                팔로잉
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* 목록 or Empty */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {initial.streams.length > 0 ? (
          <StreamListSection
            key={JSON.stringify(searchParams)} // 검색/탭 변경 시 클린 리마운트
            scope={scope}
            searchParams={{
              category: searchParams.category ?? "",
              keyword: searchParams.keyword ?? "",
            }}
            initialItems={initial.streams}
            initialCursor={initial.nextCursor}
            viewerId={viewerId}
          />
        ) : (
          <StreamEmptyState
            keyword={searchParams.keyword}
            category={searchParams.category}
            scope={scope}
          />
        )}
      </div>

      {/* 추가 버튼 */}
      <AddStreamButton />
    </div>
  );
}
