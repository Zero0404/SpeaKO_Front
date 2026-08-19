import apiClient from './apiclient';

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
  hasThumbnail: boolean;
  thumbnailBase64?: string | null;
}

export interface PresentationResult {
  presentationId: number;
  topic: string;
  duration: number;
  tone: string;
  fileUrl: string;
  slides: SlideResult[];
  hasFile: boolean;
  thumbnailStatus?: string;
}


interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T | null;
}


function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return fallback;
}

/* ────────────────────────────────────────────────────────────
   1. 대본 생성 요청 — POST /api/presentations
   ──────────────────────────────────────────────────────────── */

export interface CreatePresentationPayload {
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

  try {
    const response = await apiClient.post('/api/presentations', formData, {
      headers: { 'Content-Type': undefined },
    });

    const data = response.data;
    const result = (data?.result ?? data) as PresentationResult;

    if (!result?.presentationId) {
      throw new Error('서버 응답에 결과 데이터가 없습니다.');
    }

    return result;
  } catch (err) {
    throw new Error(extractErrorMessage(err, '대본 생성 요청에 실패했습니다.'));
  }
}

/* ────────────────────────────────────────────────────────────
   2. 특정 발표 자료/대본 조회 — GET /api/presentations/{presentationId}
   ──────────────────────────────────────────────────────────── */

export async function getPresentation(presentationId: number): Promise<PresentationResult> {
  try {
    const response = await apiClient.get<ApiEnvelope<PresentationResult>>(
      `/api/presentations/${presentationId}`
    );

    const data = response.data;

    if (!data || data.isSuccess === false) {
      throw new Error(data?.message ?? '발표 자료 조회에 실패했습니다.');
    }

    if (!data.result) {
      throw new Error('발표 자료 데이터가 없습니다.');
    }

    return data.result;
  } catch (err) {
    if (err instanceof Error && err.message !== '발표 자료 데이터가 없습니다.') {
      throw err;
    }
    throw new Error(extractErrorMessage(err, '발표 자료 조회에 실패했습니다.'));
  }
}

/* ────────────────────────────────────────────────────────────
   대본 재생성 — POST /api/presentations/{id}/regenerate 또는
   /api/presentations/{id}/scripts/{scriptId}/regenerate
   ──────────────────────────────────────────────────────────── */

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
    ? `/api/presentations/${payload.presentationId}/scripts/${payload.scriptId}/regenerate`
    : `/api/presentations/${payload.presentationId}/regenerate`;

  const body = isPartial
    ? {
        ...(payload.tone !== undefined ? { tone: payload.tone } : {}),
        ...(payload.extraRequirement ? { extraRequirement: payload.extraRequirement } : {}),
        currentScript: payload.currentScript,
      }
    : {
        ...(payload.duration !== undefined ? { duration: payload.duration } : {}),
        ...(payload.tone !== undefined ? { tone: payload.tone } : {}),
        ...(payload.extraRequirement ? { extraRequirement: payload.extraRequirement } : {}),
        currentScript: payload.currentScript,
      };

  try {
    const response = await apiClient.post(url, body);
    const data = response.data;
    console.log('[재생성 POST 응답]', data);

    if (!data?.result) {
      throw new Error('재생성 결과 데이터가 없습니다.');
    }

    return data.result as PresentationResult;
  } catch (err) {
    throw new Error(extractErrorMessage(err, '대본 재생성에 실패했습니다.'));
  }
}

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
  try {
    const response = await apiClient.get(`/api/presentations/${presentationId}/full-script`);
    const data = response.data;

    const result = (data?.result ?? data) as FullScriptResult;

    if (!result?.presentationId) {
      throw new Error('전체 대본 데이터가 없습니다.');
    }

    return result;
  } catch (err) {
    throw new Error(extractErrorMessage(err, '전체 대본 조회에 실패했습니다.'));
  }
}

/* ────────────────────────────────────────────────────────────
   4. 일반 대본 다운로드 — GET /api/presentations/{presentationId}/download/script
   text/plain 파일 스트림(.txt)이 그대로 내려온다. axios에서는 responseType: 'blob'
   지정이 필요하고, 실패 시(400/404)에는 JSON 에러 바디가 온다.
   ──────────────────────────────────────────────────────────── */

export interface DownloadedScriptFile {
  blob: Blob;
  filename: string;
}

function extractFilenameFromDisposition(disposition: string | null | undefined): string | null {
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
  try {
    const response = await apiClient.get(
      `/api/presentations/${presentationId}/download/script`,
      { responseType: 'blob' }
    );

    const filename =
      extractFilenameFromDisposition(response.headers['content-disposition']) ?? 'script.txt';

    return { blob: response.data, filename };
  } catch (err) {
    // 실패 응답은 JSON 에러 바디로 오지만, responseType: 'blob' 때문에
    // err.response.data도 Blob으로 온다. 이 경우 텍스트로 변환해 메시지를 파싱한다.
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { data?: Blob } }).response;
      if (response?.data instanceof Blob) {
        try {
          const text = await response.data.text();
          const parsed = JSON.parse(text);
          throw new Error(parsed?.message ?? '대본 다운로드에 실패했습니다.');
        } catch {
          throw new Error('대본 다운로드에 실패했습니다.');
        }
      }
    }
    throw new Error(extractErrorMessage(err, '대본 다운로드에 실패했습니다.'));
  }
}