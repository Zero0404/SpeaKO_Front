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
  hasFile: boolean; // ← 추가
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


export interface ApiSuccessResponse<T> {
  code: string;
  message: string;
  result: T;
  success: true;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  result: null;
  success: false;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/* ────────────────────────────────────────────────────────────
   3. 전체 대본 조회 — GET /api/presentations/{presentationId}/full-script
   ──────────────────────────────────────────────────────────── */

export interface FullScriptSlide {
  slideId: number;
  slideOrder: number;
  slideTitle: string | null;
  rawText: string | null;
  scriptId: number;
  content: string;
  version: number;
}

export interface FullScriptResult {
  presentationId: number;
  topic: string;
  duration: number;
  fileUrl: string;
  combinedScript: string;
  slideScripts: FullScriptSlide[];
}

export async function getFullScript(presentationId: number): Promise<FullScriptResult> {
  const response = await fetch(`${API_BASE_URL}/api/presentations/${presentationId}/full-script`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.success === false || data?.isSuccess === false) {
    const message = data?.message ?? '전체 대본 조회에 실패했습니다.';
    throw new Error(message);
  }

  // ⚠️ 명세서상으로는 { code, message, result, success }로 감싸져 와야 하지만,
  // 실제 응답은 envelope 없이 result 내용이 바로 최상위로 오는 걸 확인했습니다.
  // (createPresentation과 동일하게) result가 있으면 그 안의 값을, 없으면 응답 자체를 결과로 사용합니다.
  const result = (data?.result ?? data) as FullScriptResult;

  if (!result?.presentationId) {
    throw new Error('전체 대본 데이터가 없습니다.');
  }

  return result;
}

/* ────────────────────────────────────────────────────────────
   4. 일반 대본 다운로드 — GET /api/presentations/{presentationId}/download/script
   ⚠️ 이 엔드포인트는 JSON이 아니라 text/plain 파일 스트림(.txt)을 그대로 내려줍니다.
   성공 시 Content-Disposition 헤더에 파일명이 담겨 오고, 실패 시(400/404)에만
   기존과 같은 { code, message, result, success } JSON 에러 바디가 옵니다.
   ──────────────────────────────────────────────────────────── */

export interface DownloadedScriptFile {
  blob: Blob;
  filename: string;
}

// Content-Disposition: attachment; filename=script.txt (또는 filename="script.txt",
// filename*=UTF-8''script.txt 형태)에서 파일명만 뽑아낸다.
function extractFilenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] ?? null;
}

export async function downloadScript(presentationId: number): Promise<DownloadedScriptFile> {
  const response = await fetch(
    `${API_BASE_URL}/api/presentations/${presentationId}/download/script`,
    {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    // 실패 케이스는 명세상 JSON 에러 바디로 온다.
    const data = await parseJsonSafely(response);
    const message = data?.message ?? '대본 다운로드에 실패했습니다.';
    throw new Error(message);
  }

  const blob = await response.blob();
  const filename =
    extractFilenameFromDisposition(response.headers.get('Content-Disposition')) ??
    'script.txt';

  return { blob, filename };
}