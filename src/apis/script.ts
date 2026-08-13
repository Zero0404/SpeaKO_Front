import { useAuthStore } from '../store/authStore'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://13.209.87.115:8080';

export type ToneType = 'formal' | 'casual';

/* ────────────────────────────────────────────────────────────
   공통 타입
   ──────────────────────────────────────────────────────────── */

export interface SlideResult {
  slideId: number;
  slideOrder: number;
  slideTitle: string;
  rawText: string;
  scriptId: number;
  content: string;
  version: number;
}

export interface PresentationResult {
  presentationId: number;
  topic: string;
  duration: number;
  tone: string;
  fileUrl: string;
  slides: SlideResult[];
}

function getAuthHeader(): Record<string, string> {
  const accessToken = useAuthStore.getState().accessToken;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────
   1. 대본 생성 요청 — POST /api/presentations
   ──────────────────────────────────────────────────────────── */

export interface CreatePresentationPayload {
  file: File;
  topic: string;
  duration: number;
  tone: ToneType;
  guideline?: string;
}

export async function createPresentation(
  payload: CreatePresentationPayload
): Promise<PresentationResult> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append(
    'request',
    new Blob(
      [
        JSON.stringify({
          topic: payload.topic,
          duration: payload.duration,
          tone: payload.tone,
          guideline: payload.guideline ?? '',
        }),
      ],
      { type: 'application/json' }
    )
  );

  const response = await fetch(`${API_BASE_URL}/api/presentations`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.success === false) {
    const message = data?.message ?? '대본 생성 요청에 실패했습니다.';
    throw new Error(message);
  }

  if (!data?.result) {
    throw new Error('서버 응답에 결과 데이터가 없습니다.');
  }

  return data.result as PresentationResult;
}

/* ────────────────────────────────────────────────────────────
   2. 특정 발표 자료/대본 조회 — GET /api/presentations/{presentationId}
   ──────────────────────────────────────────────────────────── */

export async function getPresentation(presentationId: number): Promise<PresentationResult> {
  const response = await fetch(`${API_BASE_URL}/api/presentations/${presentationId}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.success === false) {
    const message = data?.message ?? '발표 자료 조회에 실패했습니다.';
    throw new Error(message);
  }

  if (!data?.result) {
    throw new Error('발표 자료 데이터가 없습니다.');
  }

  return data.result as PresentationResult;
}

/* ────────────────────────────────────────────────────────────
   3. 대본 재생성 — ⚠️ 명세서에 없어 추정으로 작성한 부분
   실제 재생성 API 명세(URL, method, 요청/응답 필드명)를 받으면
   이 함수 내부만 바꾸면 되도록 인터페이스는 그대로 유지했습니다.
   아직은 신경X
   ──────────────────────────────────────────────────────────── */

export interface RegenerateScriptPayload {
  presentationId: number;
  scriptId?: number; // 부분 재생성 시 대상 슬라이드의 scriptId, 없으면 전체 재생성
  duration: number;
  tone: ToneType;
  requirement?: string; // 자유 입력 요구사항
}

export async function regenerateScript(
  payload: RegenerateScriptPayload
): Promise<PresentationResult> {
  const url = payload.scriptId
    ? `${API_BASE_URL}/api/presentations/${payload.presentationId}/scripts/${payload.scriptId}/regenerate`
    : `${API_BASE_URL}/api/presentations/${payload.presentationId}/regenerate`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      duration: payload.duration,
      tone: payload.tone,
      requirement: payload.requirement,
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.isSuccess === false) {
    const message = data?.message ?? '대본 재생성에 실패했습니다.';
    throw new Error(message);
  }

  return data.result as PresentationResult;
}