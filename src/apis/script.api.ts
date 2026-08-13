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



export interface RegenerateScriptPayload {
  presentationId: number;
  scriptId?: number;
  duration?: number;
  tone?: ToneType;
  extraRequirement?: string;
  currentScript: string;
}

export async function regenerateScript(
  payload: RegenerateScriptPayload
): Promise<PresentationResult> {
  const isPartial = payload.scriptId !== undefined;

  const url = isPartial
    ? `${API_BASE_URL}/api/presentations/${payload.presentationId}/scripts/${payload.scriptId}/regenerate`
    : `${API_BASE_URL}/api/presentations/${payload.presentationId}/regenerate`;

  const body = isPartial
    ? {
        ...(payload.tone !== undefined ? { tone: payload.tone } : {}),
        ...(payload.extraRequirement
          ? { extraRequirement: payload.extraRequirement }
          : {}),
        currentScript: payload.currentScript,
      }
    : {
        ...(payload.duration !== undefined
          ? { duration: payload.duration }
          : {}),
        ...(payload.tone !== undefined ? { tone: payload.tone } : {}),
        ...(payload.extraRequirement
          ? { extraRequirement: payload.extraRequirement }
          : {}),
        currentScript: payload.currentScript,
      };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonSafely(response);
  console.log("[재생성 POST 응답]", data);

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ?? '대본 재생성에 실패했습니다.'
    );
  }

  if (!data?.result) {
    throw new Error('재생성 결과 데이터가 없습니다.');
  }

  return data.result as PresentationResult;
}