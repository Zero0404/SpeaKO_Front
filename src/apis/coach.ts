import { apiFetch } from './client';

/**
 * 발음 코칭(하이라이팅) 분석 API 자리.
 *
 * client.ts / script.ts에서 이미 쓰고 있는 apiFetch 방식(axios 아님)에 맞춰서 작성했습니다.
 * 인증 토큰(useAuthStore), 에러 메시지 매핑은 client.ts의 apiFetch가 이미 처리해주므로
 * 여기서는 신경 쓸 필요 없습니다.
 *
 * CoachSetPage에서 파일 또는 대본 텍스트를 받아 -> 분석 후 -> CoachViewPage가 쓰는
 * "장단음 / 연음 / 표기-발음 불일치" 하이라이트 대본 + 단어 목록을 응답으로 받는 흐름입니다.
 * 타입은 현재 CoachViewPage.tsx에 하드코딩되어 있는 mock 데이터 구조를 그대로 따랐습니다.
 *
 * ⚠️ 아직 이 기능의 실제 백엔드 스펙은 못 받아서, 엔드포인트 경로/요청 형태는 추정치입니다.
 * 실제 스펙 나오면 ANALYZE_COACHING_ENDPOINT와 요청 바디만 맞춰주면 됩니다.
 *
 * 참고: "실시간 평가받기"(녹음 후 점수 매기기)는 이 파일이 아니라 feedback.ts의
 * recordEvaluation(POST /api/evaluations/record)을 씁니다. 헷갈리지 않게 구분해두세요.
 */

export type HighlightType = 'duration' | 'liaison' | 'mismatch';

export interface ScriptSegment {
  id?: string;
  text: string;
  highlight?: HighlightType;
}

export type ScriptParagraph = ScriptSegment[];

export interface WordEntry {
  id: string;
  word: string;
  pronunciation: string;
  type: HighlightType;
  description: string;
}

export interface AnalyzeCoachingParams {
  file?: File | null;
  scriptText?: string;
}

export interface AnalyzeCoachingResponse {
  scriptParagraphs: ScriptParagraph[];
  wordEntries: WordEntry[];
}

// TODO: 백엔드 팀과 확정되면 실제 경로로 교체
const ANALYZE_COACHING_ENDPOINT = '/api/coach/analyze';

// 백엔드 연동 전까지는 true로 두고, 연동되면 false로 바꿔주세요.
const USE_MOCK = true;

const MOCK_DELAY_MS = 2000;

function buildMockResponse(): AnalyzeCoachingResponse {
  return {
    scriptParagraphs: [
      [{ text: '안녕하세요, 여러분!' }],
      [
        { text: '먼저 첫 번째 슬라이드를 통해 기본적인 ' },
        { id: 'hl-guseong', text: '구성', highlight: 'duration' },
        { text: ' 요소를 알아보도록 하겠습니다.' },
      ],
    ],
    wordEntries: [
      {
        id: 'hl-guseong',
        word: '구성',
        pronunciation: '[구ː성]',
        type: 'duration',
        description: '장단음: 이 단어의 첫 음절은 길게 발음합니다. (Mock 데이터)',
      },
    ],
  };
}

function mockAnalyzeCoaching(_params: AnalyzeCoachingParams): Promise<AnalyzeCoachingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildMockResponse()), MOCK_DELAY_MS);
  });
}

/**
 * 발음 코칭 하이라이팅 분석 요청.
 */
export function analyzeCoaching(params: AnalyzeCoachingParams): Promise<AnalyzeCoachingResponse> {
  if (USE_MOCK) {
    return mockAnalyzeCoaching(params);
  }

  const formData = new FormData();
  if (params.file) formData.append('file', params.file);
  if (params.scriptText) formData.append('scriptText', params.scriptText);

  return apiFetch<AnalyzeCoachingResponse>(ANALYZE_COACHING_ENDPOINT, {
    method: 'POST',
    body: formData,
  });
}
