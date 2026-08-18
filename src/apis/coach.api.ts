import { apiFetch } from './client';
import type { ApiSuccessResponse } from '../types/api.types';


export type HighlightCategory = 'length' | 'liaison' | 'mismatch' | (string & {});

export interface PresentationHighlight {
  highlightId: number;
  word: string;
  category: HighlightCategory;
  standardPronunciation: string;
  ruleDesc: string;
  /** content 문자열 안에서 이 단어가 시작하는 인덱스 */
  positionStart: number;
  /** content 문자열 안에서 이 단어가 끝나는 인덱스 */
  positionEnd: number;
}

export interface PresentationScript {
  scriptId: number;
  slideId: number;
  content: string;
  highlights: PresentationHighlight[];
}

/** GET /api/presentations/{id}/highlights 성공 응답의 result 필드 */
export interface CustomPresentationResult {
  presentationId: number;
  scripts: PresentationScript[];
}


export interface CustomPresentationCreateResult {
  presentationId: number;
  topic: string;
  duration: number;
  tone: string;
  fileUrl: string;
  /** 슬라이드별 분석 결과. 생성 직후에는 아직 처리가 안 끝나서 빈 배열로 온다. */
  slides: unknown[];
  hasFile: boolean;
  thumbnailStatus: string;
}

export interface CreateCustomPresentationParams {
  /** .docx / .txt / .pdf, 최대 20MB */
  scriptFile?: File;
  scriptText?: string;
  /** 미입력 시 서버 기본값: "커스텀 대본 발표" */
  topic?: string;
}

const CUSTOM_PRESENTATION_ENDPOINT = '/api/presentations/custom';

export async function createCustomPresentation(
  params: CreateCustomPresentationParams,
): Promise<CustomPresentationCreateResult> {
  const hasFile = Boolean(params.scriptFile);
  const hasText = Boolean(params.scriptText?.trim());

  if (!hasFile && !hasText) {
    // 서버도 동일한 조건으로 400을 반환하지만, 굳이 네트워크를 왕복하지 않고 미리 걸러준다.
    throw new Error('대본 파일이나 수기 텍스트 중 하나는 반드시 입력해야 합니다.');
  }

  const formData = new FormData();
  if (params.scriptFile) formData.append('scriptFile', params.scriptFile);
  if (hasText) formData.append('scriptText', params.scriptText!.trim());
  if (params.topic?.trim()) formData.append('topic', params.topic.trim());


  const response = await apiFetch<ApiSuccessResponse<CustomPresentationCreateResult>>(
    CUSTOM_PRESENTATION_ENDPOINT,
    { method: 'POST', body: formData },
  );

  return response.result;
}


export async function getPresentationHighlights(
  presentationId: number,
): Promise<CustomPresentationResult> {
  const response = await apiFetch<ApiSuccessResponse<CustomPresentationResult>>(
    `/api/presentations/${presentationId}/highlights`,
    { method: 'GET' },
  );

  return response.result;
}
