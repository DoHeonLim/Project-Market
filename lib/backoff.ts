/**
 * File Name : lib/backoff
 * Description : 지수 백오프 기반 폴링 유틸 (클라이언트/서버 공용)
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.08.23  임도헌   Created   지수 백오프 폴링 유틸 생성 (visibility 휴면, 지터 옵션)
 */

export interface BackoffOptions {
  baseMs?: number;
  maxMs?: number;
  factor?: number;
  jitter?: boolean;
  pauseWhenHidden?: boolean;
  startImmediate?: boolean;
}

export interface BackoffController {
  start(): void;
  stop(): void;
  triggerNow(): void;
}

/**
 * createBackoffPoller
 * - task가 "success"면 딜레이를 base로 리셋
 * - "fail"이면 딜레이를 factor배로 증가(최대 maxMs)
 * - "stop"이면 폴링을 종료
 */
export function createBackoffPoller(
  task: () => Promise<boolean | "success" | "fail" | "stop" | void>,
  opts: BackoffOptions = {}
): BackoffController {
  const baseMs = opts.baseMs ?? 5000;
  const maxMs = opts.maxMs ?? 30000;
  const factor = opts.factor ?? 2;
  const jitter = opts.jitter ?? true;
  const pauseWhenHidden = opts.pauseWhenHidden ?? true;
  const startImmediate = opts.startImmediate ?? true;

  let running = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let delay = baseMs;

  const isHidden = () =>
    pauseWhenHidden &&
    typeof document !== "undefined" &&
    typeof document.hidden === "boolean" &&
    document.hidden;

  const jitterize = (ms: number) => {
    if (!jitter) return ms;
    const r = 0.5 + Math.random(); // 0.5x ~ 1.5x
    return Math.round(ms * r);
  };

  const schedule = (ms: number) => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(run, ms);
  };

  const onVisibility = () => {
    if (!isHidden() && running) triggerNow();
  };

  async function run() {
    if (!running) return;
    if (isHidden()) {
      schedule(baseMs);
      return;
    }
    try {
      const res = await task();
      if (res === "stop") {
        stop();
        return;
      }
      const ok = res === true || res === "success" || res === undefined;
      delay = ok ? baseMs : Math.min(maxMs, Math.max(baseMs, delay * factor));
    } catch {
      delay = Math.min(maxMs, Math.max(baseMs, delay * factor));
    } finally {
      if (running) schedule(jitterize(delay));
    }
  }

  function start() {
    if (running) return;
    running = true;
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }
    delay = baseMs;
    if (startImmediate) triggerNow();
    else schedule(jitterize(delay));
  }

  function stop() {
    running = false;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibility);
    }
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function triggerNow() {
    schedule(0);
  }

  return { start, stop, triggerNow };
}
