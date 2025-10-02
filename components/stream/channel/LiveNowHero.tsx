/**
 * File Name : components/stream/channel/LiveNowHero
 * Description : 실시간 방송 히어로 섹션 (FOLLOWERS/PRIVATE 가드 + Cloudflare live iframe)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.09  임도헌   Created   히어로 섹션 분리
 * 2025.09.13  임도헌   Modified  태그 배지 렌더링 개선, Cloudflare 라이브 iframe, VISITOR 티저 UI(좌상단 LIVE→팔로워, 중앙 CTA), 다크모드
 * 2025.09.13  임도헌   Modified  StreamCategoryTags 컴포넌트로 태그/카테고리 출력 통일, 오버레이 z-index 고정(클릭 가능)
 * 2025.09.13  임도헌   Modified  iframe 자동재생 추가
 * 2025.09.30  임도헌   Modified  우상단 버튼 제거, 전체 클릭 시 상세페이지 이동
 */

"use client";

import Link from "next/link";
import type { BroadcastSummary } from "@/types/stream";
import StreamCategoryTags from "@/components/stream/StreamDetail/StreamCategoryTags";
import { useEffect, useRef, useState } from "react";

type Role = "OWNER" | "FOLLOWER" | "VISITOR";

interface Props {
  stream?: BroadcastSummary;
  role: Role;
  onFollow?: () => void;
}

export default function LiveNowHero({ stream, role, onFollow }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4">
      <h2 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
        실시간 방송
      </h2>

      {!stream ? (
        <div className="flex flex-col items-center gap-2 py-10 text-neutral-600 dark:text-neutral-400">
          <span>📡 진행 중인 방송이 없어요.</span>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow">
          <HeroMedia stream={stream} role={role} onFollow={onFollow} />
          <HeroMeta stream={stream} />
        </div>
      )}
    </section>
  );
}

/* -------------------- Media 영역 -------------------- */

function HeroMedia({
  stream,
  role,
  onFollow,
}: {
  stream: BroadcastSummary;
  role: Role;
  onFollow?: () => void;
}) {
  const isPrivateLocked = stream.visibility === "PRIVATE" && role !== "OWNER";
  const isFollowersTeaser =
    stream.visibility === "FOLLOWERS" && role === "VISITOR";
  const isPlayable = !isPrivateLocked && !isFollowersTeaser;

  return (
    <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-900">
      {isPlayable ? (
        <>
          {/* 전체 영역 클릭 가능한 링크 래퍼 */}
          <Link
            href={`/streams/${stream.id}`}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label={`${stream.title} 상세 페이지로 이동`}
          >
            {/* 시각적 표시는 없지만 전체 영역이 클릭 가능 */}
            <span className="sr-only">상세보기</span>
          </Link>

          {/* 시청 가능: Cloudflare 라이브 플레이어 (z-index 0으로 링크 아래) */}
          <div className="absolute inset-0 z-0">
            <PlayableLive
              liveInputUid={stream.stream_id}
              thumbnail={stream.thumbnail ?? undefined}
            />
          </div>

          {/* 좌상단 코너 뱃지 (z-index 20으로 링크 위, pointer-events-none으로 클릭 통과) */}
          <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2">
            <Badge red>LIVE</Badge>
            {stream.visibility === "FOLLOWERS" && (
              <Badge yellow>팔로워 전용</Badge>
            )}
          </div>
        </>
      ) : isFollowersTeaser ? (
        <FollowersTeaser
          title={stream.title}
          onFollow={onFollow}
          thumbnail={stream.thumbnail ?? undefined}
        />
      ) : (
        <LockedOverlay
          label="비공개"
          title={stream.title}
          tone="orange"
          thumbnail={stream.thumbnail ?? undefined}
        />
      )}
    </div>
  );
}

/* -------------------- Meta/태그 영역 -------------------- */

function HeroMeta({ stream }: { stream: BroadcastSummary }) {
  return (
    <div className="p-4">
      <div className="text-base font-semibold line-clamp-2 text-neutral-900 dark:text-neutral-100">
        {stream.title}
      </div>

      {/* 카테고리/태그: StreamCategoryTags 로 통일 */}
      <div className="mt-2">
        <StreamCategoryTags
          category={
            stream.category
              ? {
                  kor_name: stream.category.kor_name,
                  icon: (stream.category as any).icon ?? null,
                }
              : undefined
          }
          tags={coerceTagsToNameArray(stream.tags)}
        />
      </div>
    </div>
  );
}

/* -------------------- Sub components -------------------- */

/** stream.tags 가 string[] | {name:string}|mixed 인 경우를 안전하게 {name}[] 로 치환 */
function coerceTagsToNameArray(tags: unknown): { name: string }[] {
  if (!Array.isArray(tags)) return [];
  const names = tags
    .map((t) => {
      if (typeof t === "string") return t;
      if (t && typeof t === "object") {
        const anyT = t as Record<string, unknown>;
        return (
          (typeof anyT.name === "string" && anyT.name) ||
          (typeof anyT.kor_name === "string" && anyT.kor_name) ||
          (typeof anyT.tag === "string" && anyT.tag) ||
          ""
        );
      }
      return "";
    })
    .filter(Boolean) as string[];

  return names.map((name) => ({ name }));
}

function PlayableLive({
  liveInputUid,
  thumbnail,
}: {
  liveInputUid?: string | null;
  thumbnail?: string;
}) {
  const [mount, setMount] = useState(false);
  const DOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN;

  // 뷰포트 진입 시 마운트 (IntersectionObserver)
  const holderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!holderRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setMount(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMount(true);
          obs.disconnect();
        }
      },
      { rootMargin: "600px 0px 0px 0px", threshold: 0.01 }
    );
    obs.observe(holderRef.current);
    return () => obs.disconnect();
  }, []);

  const canEmbed = !!DOMAIN && !!liveInputUid;
  if (!canEmbed) return <FallbackBG thumbnail={thumbnail} />;

  // 자동재생(음소거) 파라미터 부여
  const params = new URLSearchParams({
    autoplay: "1",
    muted: "1",
    preload: "auto",
  });
  const src = `${DOMAIN}/${liveInputUid}/iframe?${params.toString()}`;

  return (
    <div ref={holderRef} className="absolute inset-0">
      {mount ? (
        <iframe
          src={src}
          title="Cloudflare Live Player"
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
          allowFullScreen
        />
      ) : (
        <FallbackBG thumbnail={thumbnail} />
      )}
    </div>
  );
}

/** VISITOR 티저: 좌상단 뱃지 순서(LIVE → 팔로워 전용), 중앙 CTA, z-index 고정 */
function FollowersTeaser({
  title,
  onFollow,
  thumbnail,
}: {
  title: string;
  onFollow?: () => void;
  thumbnail?: string;
}) {
  return (
    <div className="absolute inset-0">
      {/* 배경 (맨 아래) */}
      <div className="absolute inset-0 z-0">
        <FallbackBG thumbnail={thumbnail} />
      </div>

      {/* 블러/딤 (시각효과만, 클릭 통과) */}
      <div
        className="absolute inset-0 z-10 bg-black/35 backdrop-blur-[2px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 좌상단 뱃지 */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <Badge red>LIVE</Badge>
        <Badge yellow>팔로워 전용</Badge>
      </div>

      {/* 중앙 컨텐츠: 제목 + CTA */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h3 className="text-white text-xl font-semibold leading-snug line-clamp-2 drop-shadow">
          {title}
        </h3>
        <button
          type="button"
          onClick={onFollow}
          className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm shadow hover:opacity-95 active:opacity-90 transition"
        >
          팔로우하고 시청하기
        </button>
      </div>
    </div>
  );
}

/** PRIVATE 잠금 오버레이: z-index 고정(클릭 통과) */
function LockedOverlay({
  label,
  title,
  tone = "orange",
  thumbnail,
}: {
  label: string;
  title: string;
  tone?: "orange" | "rose";
  thumbnail?: string;
}) {
  const toneClass =
    tone === "orange" ? "bg-orange-500 text-white" : "bg-rose-500 text-white";

  return (
    <div className="absolute inset-0">
      {/* 배경 */}
      <div className="absolute inset-0 z-0">
        <FallbackBG thumbnail={thumbnail} />
      </div>

      {/* 블러/딤 (클릭 통과) */}
      <div
        className="absolute inset-0 z-10 bg-black/35 backdrop-blur-[2px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 잠금 정보 */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end gap-3 p-4">
        <span className={`px-2 py-0.5 rounded text-xs w-max ${toneClass}`}>
          {label}
        </span>
        <h3 className="text-white text-lg font-semibold line-clamp-2">
          {title}
        </h3>
      </div>
    </div>
  );
}

function FallbackBG({ thumbnail }: { thumbnail?: string }) {
  if (thumbnail) {
    return (
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${thumbnail})` }}
        aria-hidden="true"
      />
    );
  }
  // 썸네일 없을 때: 다크/라이트 자연스러운 그라디언트 + 은은한 마스크
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-900 dark:to-neutral-800
                 [mask-image:radial-gradient(80%_60%_at_50%_40%,#000_60%,transparent_100%)]"
      aria-hidden="true"
    />
  );
}

function Badge({
  children,
  red,
  yellow,
  orange,
}: {
  children: React.ReactNode;
  red?: boolean;
  yellow?: boolean;
  orange?: boolean;
}) {
  const base = "px-2 py-0.5 rounded text-xs";
  const tone = red
    ? "bg-red-600 text-white"
    : yellow
      ? "bg-yellow-400 text-black"
      : orange
        ? "bg-orange-500 text-white"
        : "bg-neutral-700 text-white dark:bg-neutral-800 dark:text-neutral-200";
  return <span className={`${base} ${tone}`}>{children}</span>;
}
