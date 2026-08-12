import { apiFetch } from './client';
import type { ApiSuccessResponse } from '../types/api.types';

/**
 * 발표 음성 평가(발음 점수 + 음성인식) API.
 *
 * client.ts / script.ts에서 이미 쓰고 있는 apiFetch 방식(axios 아님)에 맞춰서 작성했습니다.
 *
 * POST /api/evaluations/record (multipart/form-data, 인증 필요)
 * Request: userId, scriptId, file(오디오: .m4a/.webm/.mp3/.wav 등)
 *
 * ⚠️ script.ts의 createScript가 돌려주는 ScriptResponse에 scriptId가 이미 들어있으니,
 * "AI 대본 생성 -> 그 결과로 평가받기" 흐름에서는 그 scriptId를 그대로 쓰면 될 것 같아요.
 * 다만 CoachSetPage에서 대본을 직접 입력/업로드하는 케이스는 createScript를 거치지 않으니
 * scriptId를 어떻게 받을지는 여전히 확인이 필요해요.
 *
 * ⚠️ presentations(성공 시 본문 그대로 ScriptResponse)와 다르게, evaluations/record는
 * 스펙상 성공 응답이 { code, message, result, success } 봉투로 옵니다. 그래서 아래에서는
 * apiFetch로 봉투 전체를 받은 다음 result만 꺼내서 돌려주도록 했습니다.
 */

export interface RecordEvaluationParams {
  userId: number;
  scriptId: number;
  file: File; // .m4a / .webm / .mp3 / .wav 등
}

export interface EvaluationResult {
  evaluationId: number;
  userId: number;
  slideId: number;
  audioFileName: string;
  audioDuration: number;
  totalScore: number;
  pronunciationScore: number;
  recognizedText: string;
}

const RECORD_EVALUATION_ENDPOINT = '/api/evaluations/record';

// 백엔드 연동 전까지는 true로 두고, 연동되면 false로 바꿔주세요.
const USE_MOCK = false;

const MOCK_DELAY_MS = 2000;

function buildMockResult(params: RecordEvaluationParams): EvaluationResult {
  return {
    evaluationId: 1,
    userId: params.userId,
    slideId: 5,
    audioFileName: params.file.name,
    audioDuration: 15,
    totalScore: 88.5,
    pronunciationScore: 90.0,
    recognizedText: '(Mock) 안녕하세요 발표를 시작하겠습니다...',
  };
}

function mockRecordEvaluation(params: RecordEvaluationParams): Promise<EvaluationResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildMockResult(params)), MOCK_DELAY_MS);
  });
}

/**
 * 녹음/업로드된 발표 음성 평가 요청.
 * (CoachViewPage의 "실시간 평가받기", FeedbackPage 파일 업로드 피드백 양쪽에서
 *  이 함수를 같이 쓰는 것으로 우선 설계해뒀습니다 — 실제로 공용인지는 확인 필요.)
 */
export async function recordEvaluation(params: RecordEvaluationParams): Promise<EvaluationResult> {
  if (USE_MOCK) {
    return mockRecordEvaluation(params);
  }

  const formData = new FormData();
  formData.append('userId', String(params.userId));
  formData.append('scriptId', String(params.scriptId));
  formData.append('file', params.file);

  const response = await apiFetch<ApiSuccessResponse<EvaluationResult>>(
    RECORD_EVALUATION_ENDPOINT,
    { method: 'POST', body: formData },
  );

  return response.result;
}
