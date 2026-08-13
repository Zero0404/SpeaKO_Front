import { apiFetch } from './client';
import type { ApiSuccessResponse } from '../types/api.types';

/**
 * 발표 음성 평가(발음 점수 + 음성인식) API.
 *
 * POST /api/evaluations/record (multipart/form-data, 인증 필요)
 * Request: userId, scriptId, file(오디오: .m4a/.webm/.mp3/.wav 등)
 *
 * ⚠️ scriptId 관련 미해결 이슈: 이 API는 scriptId가 필수인데,
 * FeedbackFileUploadPage(파일 업로드로 바로 평가받는 플로우)는 특정 대본에 연결되어
 * 있지 않아 scriptId를 받아올 데이터 소스가 아직 없습니다. 백엔드팀과 scriptId 발급/조회
 * 방식을 확인해야 합니다 (claude/로딩페이지_리팩터링_API준비_정리.md 3번 항목 참고).
 *
 * ⚠️ evaluations/record가 CoachViewPage의 "실시간 평가받기"(현재 mockEvaluateRecording)와
 * 공용인지도 아직 미확인 상태입니다.
 */

export interface RecordEvaluationParams {
  userId: number;
  scriptId: number;
  file: File; // .m4a / .webm / .mp3 / .wav 등
}

/**
 * POST /api/evaluations/record 성공 응답의 result 필드 (API 명세서 기준 전체 필드 반영).
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
  feedbackDetail: string | null;
  evaluatedAt: string;
}

const RECORD_EVALUATION_ENDPOINT = '/api/evaluations/record';

export async function recordEvaluation(params: RecordEvaluationParams): Promise<EvaluationResult> {
  const formData = new FormData();
  formData.append('userId', String(params.userId));
  formData.append('scriptId', String(params.scriptId));
  formData.append('file', params.file);

  // ⚠️ Content-Type을 직접 지정하지 않습니다. FormData를 fetch에 넘기면 브라우저가
  // multipart/form-data 경계(boundary)를 자동으로 채워주는데, 여기서 수동으로
  // 'multipart/form-data'만 지정하면 boundary가 빠져서 서버가 파일을 파싱하지 못합니다.
  const response = await apiFetch<ApiSuccessResponse<EvaluationResult>>(
    RECORD_EVALUATION_ENDPOINT,
    { method: 'POST', body: formData },
  );

  return response.result;
}
