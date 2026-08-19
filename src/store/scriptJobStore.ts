import { create } from 'zustand';
import {
  createPresentation,
  getPresentation,
  getFullScript,
  regenerateScript,
  type PresentationResult,
  type FullScriptResult,
  type ToneType,
} from '../apis/script.api';

export type ScriptJobStatus = 'idle' | 'running' | 'success' | 'error' | 'paywall';
export type FullScriptStatus = 'idle' | 'loading' | 'success' | 'error';

interface RunCreateInput {
  file: File | null;
  guideline?: string;
  title: string;
  duration: number;
  style: ToneType;
}

interface RegenerateInput {
  scriptId?: number;
  duration?: number;
  tone?: ToneType;
  extraRequirement?: string;
  currentScript: string;
}

interface ScriptJobState {
  status: ScriptJobStatus;
  error: string | null;
  result: PresentationResult | null;
  presentationId: number | null;
  /** 이번 발표에 원본 슬라이드 파일(PPT/PDF)이 있었는지 — 있으면 슬라이드별 화면, 없으면 전체 대본 화면.
   *  백엔드가 응답에 내려주는 result.hasFile을 그대로 신뢰한다 (fileUrl은 파일 없는 케이스에도
   *  채워질 수 있어서 hasFile 판단 기준으로 쓰지 않는다). */
  hasSourceFile: boolean;
  /** ScriptEditPage 상단 등에 표시할 발표 주제 */
  topic: string;

  /** "대본확인" 버튼 → GET /full-script 결과 (PPT X 전체 대본 화면 전환용) */
  fullScript: FullScriptResult | null;
  fullScriptStatus: FullScriptStatus;
  fullScriptError: string | null;

  /** AiSetPage: 새 대본 생성 요청 시작 */
  runCreate: (input: RunCreateInput) => Promise<void>;
  /** ScriptEditPage: 전체/부분 재생성 요청 */
  regenerate: (input: RegenerateInput) => Promise<void>;
  /** AiLoading: presentationId만 갖고 있고 result가 없을 때(새로고침 등) 다시 조회 */
  fetchResult: (presentationId: number) => Promise<void>;
  /** ScriptEditPage: "대본확인" 버튼 → 전체 대본(합쳐진 스크립트) 조회 */
  fetchFullScript: (presentationId: number) => Promise<void>;
  /** 새 job을 시작하기 전 상태 초기화(필요할 때 사용) */
  reset: () => void;
}

const initialState = {
  status: 'idle' as ScriptJobStatus,
  error: null as string | null,
  result: null as PresentationResult | null,
  presentationId: null as number | null,
  hasSourceFile: false,
  topic: '',
  fullScript: null as FullScriptResult | null,
  fullScriptStatus: 'idle' as FullScriptStatus,
  fullScriptError: null as string | null,
};

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// Vercel rewrites 프록시가 백엔드 응답을 기다리다 먼저 끊어서 발생하는 502/timeout류
// 에러인지 판별한다. 이 경우는 "진짜 실패"가 아니라 "응답이 늘어진 상황"이므로
// 폴링으로 전환해서 계속 기다린다. (참고: axios의 timeout 설정을 늘려도 이 502 자체는
// 해결되지 않는다 — Vercel 프록시가 자체 타임아웃으로 먼저 연결을 끊기 때문)
function isProxyTimeoutLike(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message;
  return (
    message.includes('502') ||
    message.includes('Bad Gateway') ||
    message.includes('timeout') ||
    message.includes('Network Error')
  );
}

// ── 대본 생성/재생성 완료 대기(폴링) ──────────────────────────────
// POST /api/presentations, POST /regenerate 모두 실제 작업(AI 생성)은
// 백엔드에서 비동기로 진행될 수 있어서, presentationId를 받은 뒤 GET으로
// 다시 조회해서 완료 여부를 몇 초 간격으로 재확인한다.
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 6 * 60 * 1000; // 최대 6분까지 기다림 (AiLoading 문구와 별개로 재생성은 더 여유있게)

function isGenerationComplete(result: PresentationResult): boolean {
  if (!result.slides || result.slides.length === 0) return false;
  return result.slides.every((slide) => Boolean(slide.content?.trim()));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForGeneratedScript(presentationId: number): Promise<PresentationResult> {
  const startedAt = Date.now();

  while (true) {
    const result = await getPresentation(presentationId);
    if (isGenerationComplete(result)) {
      return result;
    }
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new Error('대본 생성이 예상보다 오래 걸리고 있어요. 잠시 후 다시 시도해주세요.');
    }
    await wait(POLL_INTERVAL_MS);
  }
}

// 재생성 전용 폴링: 이미 대본이 채워져 있는 상태에서 다시 재생성하는 것이므로
// "content가 비어있지 않은지"가 아니라 "버전(version)이 이전보다 올라갔는지"로
// 완료 여부를 판단한다.
// - targetScriptId가 있으면(부분 재생성) 해당 slide만 확인
// - 없으면(전체 재생성) 슬라이드 중 하나라도 버전이 오르면 완료로 간주
async function waitForRegeneratedScript(
  presentationId: number,
  prevVersions: Map<number, number>,
  targetScriptId?: number
): Promise<PresentationResult> {
  const startedAt = Date.now();

  while (true) {
    const result = await getPresentation(presentationId);

    const changed = result.slides.some((slide) => {
      if (targetScriptId !== undefined && slide.scriptId !== targetScriptId) {
        return false;
      }
      const prevVersion = prevVersions.get(slide.slideId);
      return prevVersion === undefined || slide.version > prevVersion;
    });

    if (changed) {
      return result;
    }

    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new Error('재생성이 예상보다 오래 걸리고 있어요. 잠시 후 다시 확인해주세요.');
    }

    await wait(POLL_INTERVAL_MS);
  }
}

export const useScriptJobStore = create<ScriptJobState>()((set, get) => ({
  ...initialState,

  runCreate: async ({ file, guideline, title, duration, style }) => {
    // AiSetPage 버튼이 "생성 요청 중..."으로 바뀌고, 곧바로 이동하는 AiLoading 페이지가
    // 처음부터 'running' 상태를 보고 진행 단계 애니메이션을 시작할 수 있도록
    // 여기서 status를 먼저 'running'으로 바꿔둔다. (topic도 미리 채워서
    // ScriptEditPage 상단 표시가 즉시 맞도록 함)
    set({ status: 'running', error: null, topic: title });

    try {
      const created = await createPresentation({
        file: file ?? undefined,
        topic: title,
        duration,
        tone: style,
        guideline,
      });

      // POST 응답에 이미 대본이 다 채워져 있으면 그대로 쓰고,
      // 아직 비어있으면(비동기 생성 중) 완성될 때까지 기다린다.
      const result = isGenerationComplete(created)
        ? created
        : await waitForGeneratedScript(created.presentationId);

      set({
        status: 'success',
        result,
        presentationId: result.presentationId,
        topic: result.topic || title,
        // fileUrl은 파일 없는 케이스(topic-only)에도 채워져 내려오므로 판단 기준으로 쓰지 않는다.
        // 백엔드가 명시적으로 내려주는 hasFile을 그대로 신뢰한다.
        hasSourceFile: Boolean(result.hasFile),
      });
    } catch (err) {
      set({
        status: 'error',
        error: toErrorMessage(err, '대본 생성에 실패했습니다.'),
      });
    }
  },

  regenerate: async ({ scriptId, duration, tone, extraRequirement, currentScript }) => {
    const presentationId = get().presentationId;

    if (!presentationId) {
      set({
        status: 'error',
        error: '재생성할 발표 자료를 찾을 수 없습니다.',
      });
      return;
    }

    // 재생성 시도 전 현재 버전 스냅샷 저장 — 502로 응답이 끊겨도
    // 이 스냅샷 기준으로 폴링하며 완료 여부를 판단한다.
    const prevResult = get().result;
    const prevVersions = new Map<number, number>(
      prevResult?.slides.map((slide) => [slide.slideId, slide.version]) ?? []
    );

    set({
      status: 'running',
      error: null,
    });

    try {
      // 1. 재생성 POST
      const regenerated = await regenerateScript({
        presentationId,
        scriptId,
        duration,
        tone,
        extraRequirement,
        currentScript,
      });

      console.log('[재생성 POST 응답]', regenerated);

      // 2. 재생성 완료 후 최신 데이터 재조회
      const result = await getPresentation(presentationId);

      console.log('[재생성 후 GET 응답]', result);
      console.log('[재조회된 slides]', result.slides);

      // 3. 최신 GET 결과를 Zustand에 저장
      set({
        status: 'success',
        result,
        presentationId: result.presentationId,
        topic: result.topic || get().topic,
        hasSourceFile: Boolean(result.hasFile),
      });
    } catch (err) {
      // Vercel 프록시가 백엔드 응답을 기다리다 먼저 끊은 502/timeout류라면,
      // 이미 백엔드에서는 재생성이 계속 진행 중일 가능성이 높다.
      // 진짜 실패로 처리하지 않고 GET 폴링으로 전환해서 완료를 기다린다.
      if (!isProxyTimeoutLike(err)) {
        set({
          status: 'error',
          error: toErrorMessage(err, '대본 재생성에 실패했습니다.'),
        });
        return;
      }

      console.warn('[재생성] 502/timeout 감지 — GET 폴링으로 전환합니다.', err);

      try {
        const result = await waitForRegeneratedScript(presentationId, prevVersions, scriptId);

        set({
          status: 'success',
          result,
          presentationId: result.presentationId,
          topic: result.topic || get().topic,
          hasSourceFile: Boolean(result.hasFile),
        });
      } catch (pollErr) {
        set({
          status: 'error',
          error: toErrorMessage(pollErr, '대본 재생성 확인에 실패했습니다.'),
        });
      }
    }
  },

  fetchResult: async (presentationId) => {
    set({
      status: 'running',
      error: null,
    });

    try {
      const result = await waitForGeneratedScript(presentationId);

      set({
        status: 'success',
        result,
        presentationId: result.presentationId,
        topic: result.topic || get().topic,
        hasSourceFile: Boolean(result.hasFile),
      });
    } catch (err) {
      set({
        status: 'error',
        error: toErrorMessage(err, '발표 자료 조회에 실패했습니다.'),
      });
    }
  },

  fetchFullScript: async (presentationId) => {
    set({ fullScriptStatus: 'loading', fullScriptError: null });

    try {
      const result = await getFullScript(presentationId);

      set({
        fullScriptStatus: 'success',
        fullScript: result,
      });
    } catch (err) {
      set({
        fullScriptStatus: 'error',
        fullScriptError: toErrorMessage(err, '전체 대본 조회에 실패했습니다.'),
      });
    }
  },

  reset: () => set({ ...initialState }),
}));