/**
 * File Name : components/stream/recording/recordingDetail/RecordingVideo
 * Description : 스트리밍 녹화 상세 - 비디오 표시 (iframe)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.06  임도헌   Created   녹화 영상 iframe 컴포넌트 분리
 * 2025.09.03  임도헌   Modified  iframe title/lazy 및 레이아웃 래퍼 추가
 * 2025.09.10  임도헌   Modified  환경변수 가드/폴백, uid 변경시 리마운트, allow 속성 정리
 */

"use client";

interface RecordingVideoProps {
  uid: string;
}

export default function RecordingVideo({ uid }: RecordingVideoProps) {
  const domain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN;

  // 환경변수 누락 가드 (빌드/환경 오설정 대비)
  if (!domain) {
    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-3xl">
          <div className="aspect-video rounded-md bg-neutral-200 dark:bg-neutral-800 grid place-items-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              동영상을 불러올 수 없습니다. 관리자에게 스트림 도메인 설정을
              확인해 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const src = `${domain}/${uid}/iframe`;

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="aspect-video rounded-md overflow-hidden">
          <iframe
            key={uid} // uid 변경 시 리마운트 보장
            src={src}
            title={`Recording player • ${uid}`}
            loading="lazy"
            className="w-full h-full"
            // 표준 허용 목록 정리 (세미콜론 끝 제거)
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
