import { apiFetch } from './client';
import type { ApiSuccessResponse } from '../types/api.types';

/**
 * 발표 음성 평가(발음 점수 + 음성인식) API.
 *
 * POST /api/evaluations/record (multipart/form-data, 인증 필요)
 *
 * ⚠️ 스펙이 바뀌었습니다 — 예전엔 이 API가 scriptId를 필수로 받는다고 알고 있었는데,
 * 실제 스펙은 scriptId라는 필드 자체가 없습니다. 대신 "이미 등록된 발표 자료가 있으면
 * presentationId를, 새 파일/텍스트로 바로 평가하고 싶으면 scriptFile 또는 scriptText를"
 * 보내는 구조입니다. userId와 file(녹음 오디오)만 필수고, presentationId/scriptFile/
 * scriptText는 셋 다 선택이지만 셋 중 하나는 반드시 있어야 합니다 — 그래서 이전처럼
 * scriptId만 보내고 저 셋을 하나도 안 보내면 서버가
 * "presentationId, 대본 파일, 혹은 텍스트 중 하나는 반드시 제공되어야 합니다." 500 에러를
 * 던집니다. (CoachViewPage/FeedbackFileUploadPage에서 이미 로드된 대본으로 평가받는
 * 흐름은 presentationId를 보내는 쪽으로 맞춰야 합니다.)
 */

export interface RecordEvaluationParams {
  userId: number;
  file: File; // .m4a / .webm / .mp3 / .wav 등 (필수)
  /** 기존에 등록된 발표 자료 ID. 신규 대본 등록 시(scriptFile/scriptText 사용)엔 생략 가능. */
  presentationId?: number;
  /** 신규 대본 파일(.docx/.pdf/.txt)로 바로 평가받고 싶을 때 */
  scriptFile?: File;
  /** 수기 작성 대본 텍스트로 바로 평가받고 싶을 때 */
  scriptText?: string;
  /**
   * ⚠️ FeedbackLoading이 마운트 시점에 이 요청을 보내는데, React 18 개발 모드의
   * <StrictMode>가 마운트를 두 번 시뮬레이션하면서 이 POST가 실제로 서버까지 두 번
   * 나가는 문제가 있었다(백엔드 쪽에서 evaluations/record가 중복으로 찍힌다고 확인해줌).
   * 호출하는 쪽이 AbortController의 signal을 넘기면, StrictMode가 첫 번째 마운트를
   * 정리(cleanup)하는 시점에 그 요청 자체를 중간에 취소해서 실제로는 한 번만 서버에
   * 도달하게 만든다.
   */
  signal?: AbortSignal;
}

/** wordsDetail[] 안의 항목 하나 — 인식된 발음과 원문이 어긋난 구간 정보 */
export interface EvaluationWordDetail {
  error_type: string;
  /** referenceText 문자열 안에서의 [start, end] 구간 */
  reference_span: [number, number];
  /** recognizedText 문자열 안에서의 [start, end] 구간 */
  recognized_span: [number, number];
}

/**
 * POST /api/evaluations/record 성공 응답의 result 필드 (API 명세서 기준 전체 필드 반영).
 * ⚠️ referenceText / wordsDetail은 이번에 새로 추가된 필드입니다 — 틀린 단어 하이라이팅에
 * wordsDetail을 쓸 수 있습니다.
 */
export interface EvaluationResult {
  evaluationId: number;
  userId: number;
  slideId: number;
  recordingId: number;
  audioFileName: string;
  audioDuration: number;
  totalScore: number;
  pronunciationScore: number;
  fillerWordCount: number;
  /** 서버가 JSON 문자열로 내려주는 필러워드 상세 (예: "[]") */
  fillerWordDetail: string;
  pauseScore: number;
  /** 서버가 JSON 문자열로 내려주는 침묵/포즈 상세 (예: "[]") */
  pauseDetail: string;
  recognizedText: string;
  /** 원본(발표) 대본 텍스트 */
  referenceText: string;
  /** 틀린 단어 하이라이팅용 상세 정보 */
  wordsDetail: EvaluationWordDetail[];
  feedbackDetail: string | null;
  evaluatedAt: string;
}

const RECORD_EVALUATION_ENDPOINT = '/api/evaluations/record';

export async function recordEvaluation(params: RecordEvaluationParams): Promise<EvaluationResult> {
  if (!params.presentationId && !params.scriptFile && !params.scriptText) {
    // 서버도 동일한 조건으로 500을 반환하지만, 굳이 네트워크를 왕복하지 않고 미리 걸러준다.
    throw new Error('presentationId, 대본 파일, 혹은 텍스트 중 하나는 반드시 제공되어야 합니다.');
  }

  const formData = new FormData();
  formData.append('userId', String(params.userId));
  formData.append('file', params.file);
  if (params.presentationId != null) {
    formData.append('presentationId', String(params.presentationId));
  }
  if (params.scriptFile) formData.append('scriptFile', params.scriptFile);
  if (params.scriptText?.trim()) formData.append('scriptText', params.scriptText.trim());

  // ⚠️ Content-Type을 직접 지정하지 않습니다. FormData를 fetch에 넘기면 브라우저가
  // multipart/form-data 경계(boundary)를 자동으로 채워주는데, 여기서 수동으로
  // 'multipart/form-data'만 지정하면 boundary가 빠져서 서버가 파일을 파싱하지 못합니다.
  const response = await apiFetch<ApiSuccessResponse<EvaluationResult>>(
    RECORD_EVALUATION_ENDPOINT,
    { method: 'POST', body: formData, signal: params.signal },
  );

  return response.result;
}
