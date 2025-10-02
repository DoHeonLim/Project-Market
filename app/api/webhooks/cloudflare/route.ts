/**
 * File Name : app/api/webhooks/cloudflare/route
 * Description : Cloudflare Stream 웹훅 수신 → Broadcast/VodAsset 갱신 (WebCrypto HMAC 검증)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.09.16  임도헌   Created
 * 2025.09.17  임도헌   Modified  video.ready 무타입 바디 지원, assetUid/liveInputUid 분리,
 *                                Notifications 헤더/Stream HMAC 검증 강화,
 *                                WebCrypto 기반 HMAC 검증 도입
 * 2025.09.17  임도헌   Modified  방송 시작시 썸네일 업데이트 기능 추가
 */

import "server-only";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "node:crypto";
import db from "@/lib/db";
import { sendLiveStatusFromServer } from "@/lib/stream/status/serverBroadcast";

export const runtime = "nodejs";

const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DEST_SECRET = (process.env.CLOUDFLARE_WEBHOOK_SECRET ?? "").trim();
const STREAM_SECRET = (
  process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET ?? ""
).trim();

const subtle = (crypto.webcrypto ?? globalThis.crypto).subtle;
const te = new TextEncoder();
const MAX_SKEW_SEC = 300;

/**
 * Webhook-Signature 헤더에서 타임스탬프와 서명값을 파싱
 * @param header - "time=1234567890,sig1=abcdef..." 형식의 헤더 문자열
 * @returns 파싱된 time과 sig1 객체, 또는 null
 */
function parseStreamSignature(
  header: string | null
): { time: string; sig1: string } | null {
  if (!header) return null;
  const kv: Record<string, string> = {};
  for (const p of header.split(",").map((s) => s.trim())) {
    const [k, v] = p.split("=", 2);
    if (k && v) kv[k.toLowerCase()] = v;
  }
  const time = kv["time"],
    sig1 = kv["sig1"];
  return time && sig1 ? { time, sig1 } : null;
}

/**
 * 문자열이 16진수 형식인지 확인 (32자 이상)
 * @param s - 검사할 문자열
 * @returns hex 형식 여부
 */
function looksHex(s: string) {
  return /^[0-9a-f]{32,}$/i.test(s);
}

/**
 * 16진수 문자열을 Uint8Array 바이트 배열로 변환
 * @param hex - 16진수 문자열
 * @returns 바이트 배열
 */
function hexToBytes(hex: string): Uint8Array {
  const s = hex.trim();
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2)
    out[i / 2] = parseInt(s.slice(i, i + 2), 16);
  return out;
}

/**
 * 타이밍 공격을 방지하는 상수 시간 바이트 배열 비교
 * @param a - 첫 번째 바이트 배열
 * @param b - 두 번째 바이트 배열
 * @returns 두 배열이 동일한지 여부
 */
function ctEqual(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) return false;
  let v = 0;
  for (let i = 0; i < a.byteLength; i++) v |= a[i] ^ b[i];
  return v === 0;
}

/**
 * WebCrypto API를 사용하여 Cloudflare Stream 웹훅 서명 검증
 * - UTF-8 키와 hex 키 두 가지 방식으로 검증 시도
 * - 타임스탬프 검증으로 리플레이 공격 방지 (±5분)
 *
 * @param raw - 원본 요청 바디 문자열
 * @param signatureHeader - Webhook-Signature 헤더 값
 * @param secret - 웹훅 시크릿 키
 * @returns 서명 검증 성공 여부
 */
async function verifyStreamSignatureWebCrypto(
  raw: string,
  signatureHeader: string | null,
  secret: string
) {
  const parsed = parseStreamSignature(signatureHeader);
  if (!parsed) return false;

  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(parsed.time, 10);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > MAX_SKEW_SEC) return false;

  const source = `${parsed.time}.${raw}`;
  const provided = hexToBytes(parsed.sig1);

  // UTF-8 키로 검증 시도
  {
    const keyUtf8 = await subtle.importKey(
      "raw",
      te.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedUtf8 = new Uint8Array(
      await subtle.sign("HMAC", keyUtf8, te.encode(source))
    );
    if (ctEqual(expectedUtf8, provided)) return true;
  }
  // hex 키로 fallback 검증
  if (looksHex(secret)) {
    const keyHex = await subtle.importKey(
      "raw",
      hexToBytes(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedHex = new Uint8Array(
      await subtle.sign("HMAC", keyHex, te.encode(source))
    );
    if (ctEqual(expectedHex, provided)) return true;
  }
  return false;
}

/**
 * 요청 헤더에 Destination 웹훅 인증 정보가 포함되어 있는지 확인
 * @param req - Next.js Request 객체
 * @returns 인증 헤더 존재 여부
 */
function hasDestinationHeaderSecret(req: Request) {
  const h = req.headers;
  return Boolean(
    h.get("cf-webhook-auth") ||
      h.get("x-webhook-secret") ||
      h.get("x-cloudflare-webhook-secret")
  );
}

/**
 * 웹훅 페이로드에서 이벤트 타입 추출
 * @param body - 웹훅 페이로드 객체
 * @returns 이벤트 타입 문자열 (예: "live_input.connected", "video.ready")
 */
function getEventType(body: any): string {
  return (
    body?.type ||
    body?.event ||
    body?.event_type ||
    body?.result?.type ||
    body?.data?.type ||
    body?.data?.event_type ||
    "unknown"
  );
}

/**
 * 페이로드에서 비디오 에셋 UID 추출
 * @param body - 웹훅 페이로드 객체
 * @returns 에셋 UID 또는 null
 */
function getAssetUid(body: any): string | null {
  return typeof body?.uid === "string" ? body.uid : null;
}

/**
 * 페이로드에서 라이브 인풋 UID 추출
 * - 다양한 페이로드 구조에 대응
 * @param body - 웹훅 페이로드 객체
 * @returns 라이브 인풋 UID 또는 null
 */
function getLiveInputUid(body: any): string | null {
  const li =
    body?.liveInput ??
    body?.input ??
    body?.data?.liveInput ??
    body?.data?.input;
  if (typeof li === "string") return li;
  if (li && typeof li === "object" && typeof li.uid === "string") return li.uid;
  if (typeof body?.data?.input_id === "string") return body.data.input_id;
  return null;
}

/**
 * 페이로드가 비디오 준비 완료(video.ready) 형식인지 판별
 * - readyToStream, playback 정보, uid 존재 여부로 확인
 * @param body - 웹훅 페이로드 객체
 * @returns video.ready 페이로드 여부
 */
function isAssetReadyPayload(body: any): boolean {
  const ready =
    body?.readyToStream === true ||
    body?.status?.state === "ready" ||
    body?.status === "ready";
  const hasPlayback =
    !!body?.playback &&
    (body.playback.hls ||
      body.playback.dash ||
      typeof body.playback === "object");
  return Boolean(ready && hasPlayback && typeof body?.uid === "string");
}

/**
 * LiveInput 연결 시 Cloudflare API에서 비디오 목록을 조회하여 썸네일 업데이트
 * - 우선순위: live-inprogress > ready > 첫 항목
 * - 기존 썸네일이 없을 때만 업데이트
 *
 * @param liveInputUid - 라이브 인풋 UID
 * @param broadcastId - 방송 ID
 * @param ownerId - 방송 소유자 ID
 */
async function tryFillThumbnailFromCloudflare(
  liveInputUid: string,
  broadcastId: number,
  ownerId: number
) {
  if (!CF_ACCOUNT || !CF_TOKEN) return;

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
      CF_ACCOUNT
    )}/stream/live_inputs/${encodeURIComponent(liveInputUid)}/videos`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      console.warn("[CF] videos fetch failed:", resp.status, await resp.text());
      return;
    }

    const json = await resp.json();
    const list: any[] = Array.isArray(json?.result) ? json.result : [];

    if (list.length === 0) return;

    // 우선순위: live-inprogress -> ready -> 첫 항목
    const chosen =
      list.find((v) => v?.status?.state === "live-inprogress") ||
      list.find((v) => v?.status?.state === "ready") ||
      list[0];

    const thumbnailUrl: string | undefined = chosen?.thumbnail;

    if (thumbnailUrl && typeof thumbnailUrl === "string") {
      // DB에서 현재 썸네일 확인
      const broadcast = await db.broadcast.findUnique({
        where: { id: broadcastId },
        select: { thumbnail: true },
      });

      // 썸네일이 없을 때만 업데이트
      if (!broadcast?.thumbnail) {
        await db.broadcast.update({
          where: { id: broadcastId },
          data: { thumbnail: thumbnailUrl },
          select: { id: true },
        });

        revalidateTag(`broadcast-detail-${broadcastId}`);
        revalidateTag("broadcast-list");
        revalidateTag(`user-broadcasts-${ownerId}`);
      }
    }
  } catch (err) {
    console.warn("[CF] fetch videos error:", err);
  }
}

/**
 * 라이브 인풋 연결(live_input.connected) 이벤트 처리
 * - 방송 상태를 CONNECTED로 업데이트
 * - started_at 설정 (없는 경우)
 * - 썸네일 자동 업데이트 시도
 * - 실시간 상태 브로드캐스트
 *
 * @param liveInputUid - 라이브 인풋 UID
 */
async function onConnected(liveInputUid: string) {
  const li = await db.liveInput.findUnique({
    where: { provider_uid: liveInputUid },
    select: {
      id: true,
      userId: true,
      broadcasts: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { id: true, status: true, started_at: true, thumbnail: true },
      },
    },
  });
  if (!li || li.broadcasts.length === 0) return;

  const b = li.broadcasts[0];
  if (b.status !== "CONNECTED") {
    // 상태 업데이트
    const updated = await db.broadcast.update({
      where: { id: b.id },
      data: { status: "CONNECTED", started_at: b.started_at ?? new Date() },
      select: { id: true, thumbnail: true },
    });

    // 시도: Cloudflare API에서 실제 비디오 정보를 가져와 thumbnail 채우기
    try {
      await tryFillThumbnailFromCloudflare(liveInputUid, updated.id, li.userId);
    } catch (err) {
      console.warn("[onConnected] tryFillThumbnailFromCloudflare failed:", err);
    }

    // revalidateTag는 tryFill 내부에서 이미 처리되므로 중복해도 무해
    try {
      await sendLiveStatusFromServer?.({
        streamId: liveInputUid,
        status: "CONNECTED",
        ownerId: li.userId,
      });
    } catch {}
  }
}

/**
 * 라이브 인풋 연결 해제(live_input.disconnected) 이벤트 처리
 * - 방송 상태를 ENDED로 업데이트
 * - ended_at 타임스탬프 설정
 * - 캐시 무효화
 * - 실시간 상태 브로드캐스트
 *
 * @param liveInputUid - 라이브 인풋 UID
 */
async function onDisconnected(liveInputUid: string) {
  const li = await db.liveInput.findUnique({
    where: { provider_uid: liveInputUid },
    select: {
      id: true,
      userId: true,
      broadcasts: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { id: true, status: true, started_at: true, ended_at: true },
      },
    },
  });
  if (!li || li.broadcasts.length === 0) return;

  const b = li.broadcasts[0];
  if (b.status !== "ENDED") {
    const now = new Date();
    await db.broadcast.update({
      where: { id: b.id },
      data: { status: "ENDED", ended_at: now },
      select: { id: true },
    });
    revalidateTag(`broadcast-detail-${b.id}`);
    revalidateTag("broadcast-list");
    revalidateTag(`user-broadcasts-${li.userId}`);
    try {
      await sendLiveStatusFromServer?.({
        streamId: liveInputUid,
        status: "ENDED",
        ownerId: li.userId,
      });
    } catch {}
  }
}

/**
 * 비디오 준비 완료(video.ready) 이벤트 처리
 * - VOD 에셋 정보를 DB에 upsert
 * - playback URL, 썸네일, 재생시간 등 저장
 * - liveInputUid로 방송 찾기, 없으면 최근 종료된 방송과 연결
 * - 캐시 무효화
 *
 * @param liveInputUid - 라이브 인풋 UID (nullable)
 * @param assetBody - 비디오 에셋 페이로드
 */
async function onVideoReady(liveInputUid: string | null, assetBody: any) {
  const assetUid = getAssetUid(assetBody);
  if (!assetUid) return;

  const playback_hls: string | null = assetBody?.playback?.hls ?? null;
  const playback_dash: string | null = assetBody?.playback?.dash ?? null;
  const thumbnail_url: string | null = assetBody?.thumbnail ?? null;
  const duration_sec: number | null =
    typeof assetBody?.duration === "number"
      ? Math.floor(assetBody.duration)
      : null;
  const ready_at: Date | null = assetBody?.readyToStreamAt
    ? new Date(assetBody.readyToStreamAt)
    : assetBody?.created
      ? new Date(assetBody.created)
      : null;

  let broadcastIdResolved: number | null = null;

  // 1. liveInputUid로 방송 찾기
  if (liveInputUid) {
    const li = await db.liveInput.findUnique({
      where: { provider_uid: liveInputUid },
      select: {
        broadcasts: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { id: true },
        },
      },
    });
    if (li?.broadcasts?.length) broadcastIdResolved = li.broadcasts[0].id;
  }
  // 2. 없으면 최근 종료된 방송 찾기
  if (!broadcastIdResolved) {
    const ended = await db.broadcast.findFirst({
      where: { status: "ENDED" },
      orderBy: { created_at: "desc" },
      select: { id: true },
    });
    broadcastIdResolved = ended?.id ?? null;
  }
  if (!broadcastIdResolved) return;

  await db.vodAsset.upsert({
    where: { provider_asset_id: assetUid },
    update: {
      playback_hls,
      playback_dash,
      thumbnail_url,
      duration_sec,
      ready_at: ready_at ?? undefined,
      broadcast: { connect: { id: broadcastIdResolved } },
    },
    create: {
      provider_asset_id: assetUid,
      playback_hls,
      playback_dash,
      thumbnail_url,
      duration_sec,
      ready_at: ready_at ?? undefined,
      broadcast: { connect: { id: broadcastIdResolved } },
    },
  });

  revalidateTag(`broadcast-detail-${broadcastIdResolved}`);
}

/**
 * Cloudflare Stream 웹훅 엔드포인트 핸들러
 *
 * 처리 흐름:
 * 1. 요청 바디 읽기 및 서명 검증
 *    - Stream 웹훅: Webhook-Signature 헤더로 HMAC 검증
 *    - Destination 웹훅: 인증 헤더 존재 여부 확인
 * 2. 이벤트 타입 파싱 및 분기 처리
 *    - live_input.connected: 방송 시작 처리
 *    - live_input.disconnected: 방송 종료 처리
 *    - video.ready: VOD 생성 처리
 * 3. 캐시 무효화 및 실시간 상태 전파
 *
 * @param req - Next.js Request 객체
 * @returns JSON 응답 (성공/실패)
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text();

    const sigHeader = req.headers.get("webhook-signature");
    const isStreamWebhook = !!sigHeader;
    const hasDestHeader = hasDestinationHeaderSecret(req);

    // Stream 웹훅 서명 검증
    if (isStreamWebhook) {
      if (STREAM_SECRET) {
        const ok = await verifyStreamSignatureWebCrypto(
          raw,
          sigHeader,
          STREAM_SECRET
        );
        if (!ok)
          return NextResponse.json(
            { ok: false, error: "BAD_SIGNATURE" },
            { status: 401 }
          );
      }
    } else {
      // Destination 웹훅 인증 확인
      if (DEST_SECRET && !hasDestHeader) {
        return NextResponse.json(
          { ok: false, error: "UNAUTHORIZED" },
          { status: 401 }
        );
      }
    }

    // JSON 파싱
    let body: any = {};
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "BAD_JSON" },
        { status: 400 }
      );
    }

    const type = getEventType(body);
    let liveInputUid = getLiveInputUid(body);

    // video.ready 타입 없는 페이로드 처리
    if (type === "unknown" && isAssetReadyPayload(body)) {
      if (!liveInputUid) {
        liveInputUid = getLiveInputUid({
          liveInput: body?.liveInput,
          input: body?.input,
        });
      }
      await onVideoReady(liveInputUid, body);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 라이브 인풋 연결
    if (type === "live_input.connected") {
      if (!liveInputUid)
        return NextResponse.json(
          { ok: false, error: "MISSING_LIVEINPUT_UID" },
          { status: 400 }
        );
      await onConnected(liveInputUid);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 라이브 인풋 연결 해제
    if (type === "live_input.disconnected") {
      if (!liveInputUid)
        return NextResponse.json(
          { ok: false, error: "MISSING_LIVEINPUT_UID" },
          { status: 400 }
        );
      await onDisconnected(liveInputUid);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 비디오 준비 완료
    if (type === "video.ready") {
      await onVideoReady(liveInputUid, body);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 알 수 없는 이벤트 타입도 정상 응답
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[webhooks/cloudflare] error:", e);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
