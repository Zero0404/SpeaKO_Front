import { create } from 'zustand';
import {
  createPresentation,
  getPresentation,
  regenerateScript,
  type PresentationResult,
  type ToneType,
} from '../apis/script.api';

export type ScriptJobStatus = 'idle' | 'running' | 'success' | 'error' | 'paywall';

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
  /** 이번 발표에 원본 슬라이드 파일(PPT/PDF)이 있었는지 — 있으면 슬라이드별 화면, 없으면 전체 대본 화면 */
  hasSourceFile: boolean;
  /** ScriptEditPage 상단 등에 표시할 발표 주제 */
  topic: string;

  /** AiSetPage: 새 대본 생성 요청 시작 */
  runCreate: (input: RunCreateInput) => Promise<void>;
  /** ScriptEditPage: 전체/부분 재생성 요청 */
  regenerate: (input: RegenerateInput) => Promise<void>;
  /** AiLoading: presentationId만 갖고 있고 result가 없을 때(새로고침 등) 다시 조회 */
  fetchResult: (presentationId: number) => Promise<void>;
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
};

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ── 대본 생성 완료 대기(폴링) ──────────────────────────────────────
// POST /api/presentations는 요청을 접수만 하고, 실제 슬라이드별 대본은
// 백엔드에서 비동기(AI 생성)로 나중에 채워집니다. 그래서 POST 응답을 바로
// 최종 결과로 쓰면 아직 텍스트가 비어있는 스냅샷을 보여주게 됩니다.
// presentationId를 받은 뒤 GET으로 다시 조회해서, 슬라이드 대본이 실제로
// 채워질 때까지 몇 초 간격으로 재확인합니다.
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 4 * 60 * 1000; // AiLoading 문구와 맞춘 최대 4분

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
        hasSourceFile: Boolean(result.fileUrl),
      });
    } catch (err) {
      set({
        status: 'error',
        error: toErrorMessage(err, '대본 생성에 실패했습니다.'),
      });
    }
  },

    regenerate: async ({
      scriptId,
      duration,
      tone,
      extraRequirement,
      currentScript,
    }) => {
      const presentationId = get().presentationId;

      if (!presentationId) {
        set({
          status: "error",
          error: "재생성할 발표 자료를 찾을 수 없습니다.",
        });
        return;
      }

      set({
        status: "running",
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

        console.log("[재생성 POST 응답]", regenerated);

        // 2. 재생성 완료 후 최신 데이터 재조회
        const result = await getPresentation(presentationId);

        console.log("[재생성 후 GET 응답]", result);
        console.log("[재조회된 slides]", result.slides);

        // 3. 최신 GET 결과를 Zustand에 저장
        set({
          status: "success",
          result,
          presentationId: result.presentationId,
          topic: result.topic || get().topic,
          hasSourceFile: Boolean(result.fileUrl),
        });
      } catch (err) {
        set({
          status: "error",
          error: toErrorMessage(err, "대본 재생성에 실패했습니다."),
        });
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
        hasSourceFile: Boolean(result.fileUrl),
      });
    } catch (err) {
      set({
        status: 'error',
        error: toErrorMessage(err, '발표 자료 조회에 실패했습니다.'),
      });
    }
  },

  reset: () => set({ ...initialState }),
}));
