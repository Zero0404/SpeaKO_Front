import { create } from 'zustand';
import { createScript, type CreateScriptParams, type ScriptResponse } from '../apis/script';

type JobStatus = 'idle' | 'running' | 'success' | 'error' | 'paywall';

interface ScriptJobState {
  status: JobStatus;
  result: ScriptResponse | null;
  error: string | null;
  hasSourceFile: boolean;
  sourceFileName: string | null;

  runCreate: (params: CreateScriptParams) => Promise<void>;
  reset: () => void;
}

export const useScriptJobStore = create<ScriptJobState>((set) => ({
  status: 'idle',
  result: null,
  error: null,
  hasSourceFile: false,
  sourceFileName: null,

  runCreate: async (params) => {
    console.group('%c[scriptJobStore] runCreate 시작', 'color: #6E8BFF; font-weight: bold;');
    console.log('요청 파라미터:', {
      title: params.title,
      duration: params.duration,
      style: params.style,
      guideline: params.guideline,
      file: params.file
        ? { name: params.file.name, size: params.file.size, type: params.file.type }
        : null,
    });
    console.time('[scriptJobStore] createScript 소요시간');

    set({
      status: 'running',
      error: null,
      hasSourceFile: !!params.file,
      sourceFileName: params.file?.name ?? null,
    });
    console.log('상태 전환: idle → running');

    try {
      const result = await createScript(params);
      console.timeEnd('[scriptJobStore] createScript 소요시간');
      console.log('%c요청 성공', 'color: #22c55e; font-weight: bold;', result);
      console.log('scriptId:', result.scriptId);
      console.log('slides 개수:', result.slides?.length ?? 0);
      console.table(result.slides);

      set({ status: 'success', result });
      console.log('상태 전환: running → success');
    } catch (e) {
      console.timeEnd('[scriptJobStore] createScript 소요시간');
      const err = e as Error & { status?: number };
      console.log('%c요청 실패', 'color: #ef4444; font-weight: bold;');
      console.log('HTTP status:', err.status ?? '(알 수 없음, 네트워크 오류 가능성)');
      console.log('에러 메시지:', err.message);
      console.error('원본 에러 객체:', err);

      if (err.status === 403) {
        set({ status: 'paywall', error: err.message });
        console.log('상태 전환: running → paywall (무료 이용 횟수 초과)');
      } else {
        set({ status: 'error', error: err.message });
        console.log('상태 전환: running → error');
      }
    } finally {
      console.groupEnd();
    }
  },

  reset: () => {
    console.log('%c[scriptJobStore] reset 호출', 'color: #94a3b8;');
    set({ status: 'idle', result: null, error: null, hasSourceFile: false, sourceFileName: null });
  },
}));