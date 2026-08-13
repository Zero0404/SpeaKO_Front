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

// GET /api/presentations/{id} 명세에서 확인된 공통 응답 봉투(envelope).
// isSuccess(= success 아님)/code/message/result 형태로 감싸져 있고,
// 실패 시 result가 null로 옵니다.
interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T | null;
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
  // AiSetPage에서는 파일 없이 "주제 + 가이드라인"만으로도 생성 요청을 보낼 수 있어서
  // file을 optional로 둡니다. (파일 없는 케이스의 정확한 백엔드 스펙은 아직 미확인 —
  // 지금은 같은 엔드포인트에 file 파트만 빼고 보내는 것으로 가정)
  file?: File;
  topic: string;
  duration: number;
  tone: ToneType;
  guideline?: string;
}

export async function createPresentation(
  payload: CreatePresentationPayload
): Promise<PresentationResult> {
  const formData = new FormData();
  if (payload.file) {
    formData.append('file', payload.file);
  }
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

  if (!response.ok || data?.success === false || data?.isSuccess === false) {
    const message = data?.message ?? '대본 생성 요청에 실패했습니다.';
    throw new Error(message);
  }

  // ⚠️ 이 엔드포인트가 { result: {...} }로 감싸서 주는지, PresentationResult를
  // 바로 최상위로 주는지 명세서로 확인이 안 돼서 방어적으로 둘 다 처리합니다.
  // (result가 있으면 그 안의 값을, 없으면 응답 자체를 결과로 사용)
  const result = (data?.result ?? data) as PresentationResult;

  if (!result?.presentationId) {
    throw new Error('서버 응답에 결과 데이터가 없습니다.');
  }

  return result;
}

/* ────────────────────────────────────────────────────────────
   2. 특정 발표 자료/대본 조회 — GET /api/presentations/{presentationId}
   ⚠️ 이 엔드포인트는 명세서로 확인됨: { isSuccess, code, message, result } 형태로
   감싸져 있고, PresentationResult는 result 안에 들어있음 (success가 아니라 isSuccess).
   createPresentation / regenerateScript는 아직 명세가 없어서 이 형태와 같은지
   확인 전까지는 건드리지 않았습니다.
   ──────────────────────────────────────────────────────────── */

export async function getPresentation(presentationId: number): Promise<PresentationResult> {
  const response = await fetch(`${API_BASE_URL}/api/presentations/${presentationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = (await parseJsonSafely(response)) as ApiEnvelope<PresentationResult> | null;

  if (!response.ok || !data || data.isSuccess === false) {
    const message = data?.message ?? '발표 자료 조회에 실패했습니다.';
    throw new Error(message);
  }

  if (!data.result) {
    throw new Error('발표 자료 데이터가 없습니다.');
  }

  return data.result;
}

/* ────────────────────────────────────────────────────────────
   3. 대본 재생성 — ⚠️ 명세서에 없어 추정으로 작성한 부분
   실제 재생성 API 명세(URL, method, 요청/응답 필드명)를 받으면
   이 함수 내부만 바꾸면 되도록 인터페이스는 그대로 유지했습니다.
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

  if (!response.ok || data?.isSuccess === false || data?.success === false) {
    const message = data?.message ?? '대본 재생성에 실패했습니다.';
    throw new Error(message);
  }

  // createPresentation과 마찬가지로, 명세서 확인 전까지는 result로 감싸져 있든
  // 아니든 둘 다 처리되도록 방어적으로 둡니다.
  return (data?.result ?? data) as PresentationResult;
}
