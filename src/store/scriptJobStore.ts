import { create } from 'zustand';
import {
  createPresentation,
  getPresentation,
  regenerateScript,
  type PresentationResult,
  type ToneType,
} from '../apis/script';

export type ScriptJobStatus = 'idle' | 'running' | 'success' | 'error' | 'paywall';

interface RunCreatePayload {
  file: File | null;
  guideline?: string;
  title: string;
  duration: number;
  style: ToneType;
}

interface RegeneratePayload {
  scriptId?: number; // 부분 재생성 대상 슬라이드의 scriptId (없으면 전체 재생성)
  duration: number;
  tone: ToneType;
  requirement?: string;
}

interface ScriptJobState {
  status: ScriptJobStatus;
  error: string | null;

  presentationId: number | null;
  result: PresentationResult | null;

  topic: string | null;
  hasSourceFile: boolean;
  sourceFileName: string | null;

  runCreate: (payload: RunCreatePayload) => Promise<void>;
  fetchResult: (presentationId?: number) => Promise<void>;
  regenerate: (payload: RegeneratePayload) => Promise<void>;
  reset: () => void;
}

const initialState = {
  status: 'idle' as ScriptJobStatus,
  error: null as string | null,
  presentationId: null as number | null,
  result: null as PresentationResult | null,
  topic: null as string | null,
  hasSourceFile: false,
  sourceFileName: null as string | null,
};

export const useScriptJobStore = create<ScriptJobState>((set, get) => ({
  ...initialState,

  // AiSetPage에서 파일 + 설정값 업로드 → POST 응답에 슬라이드/대본까지 전부 포함되어 옴
  runCreate: async (payload) => {
    if (!payload.file) {
      set({ status: 'error', error: '업로드할 파일이 없습니다.' });
      return;
    }

    set({ status: 'running', error: null, result: null, topic: payload.title });

    try {
      const result = await createPresentation({
        file: payload.file,
        topic: payload.title,
        duration: payload.duration,
        tone: payload.style,
        guideline: payload.guideline,
      });

      set({
        status: 'success',
        presentationId: result.presentationId,
        result,
        topic: result.topic,
        hasSourceFile: true,
        sourceFileName: payload.file.name,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '대본 생성 요청에 실패했습니다.';
      const isPaywall = message.includes('결제') || message.includes('구독');
      set({ status: isPaywall ? 'paywall' : 'error', error: message });
    }
  },

  // 새로고침 등으로 result가 비어있을 때 presentationId로 다시 조회 (단발성, 폴링 아님)
  fetchResult: async (id) => {
  const presentationId = id ?? get().presentationId;

  if (!presentationId) {
    set({ status: 'error', error: '조회할 발표 자료 ID가 없습니다.' });
    return;
  }

  set({ status: 'running', error: null });

  try {
    const result = await getPresentation(presentationId);

    set({
      result,
      status: 'success',
      presentationId,
      topic: result.topic,
      hasSourceFile: result.slides.length > 0,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '발표 자료 조회에 실패했습니다.';

    set({
      status: 'error',
      error: message,
    });
  }
},

  // ScriptEditPage 우측 편집 도구 "재생성" 버튼
  regenerate: async (payload) => {
    const { presentationId } = get();
    if (!presentationId) {
      set({ status: 'error', error: '재생성할 발표 자료가 없습니다.' });
      return;
    }

    set({ status: 'running', error: null });

    try {
      const result = await regenerateScript({ presentationId, ...payload });
      set({ result, status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : '대본 재생성에 실패했습니다.';
      set({ status: 'error', error: message });
    }
  },

  reset: () => set({ ...initialState }),
}));