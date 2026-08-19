import { apiFetch } from './client';
import { useAuthStore } from '../store/authStore';
import type { ApiSuccessResponse } from '../types/api.types';

/**
 * 커스텀 대본으로 발음 코칭용 프레젠테이션을 생성하는 API.
 *
 * POST /api/presentations/custom (multipart/form-data, 인증 필요)
 * Request: scriptFile 또는 scriptText 중 하나 이상 필수, topic은 선택
 * (미입력 시 서버 기본값 "커스텀 대본 발표")
 *
 * ⚠️ 이 API가 claude/로딩페이지_리팩터링_API준비_정리.md 3번 항목에서 미해결로 남겨뒀던
 * "코칭용으로 직접 입력/업로드한 대본을 저장하고 scriptId를 받는 방법"에 대한 실제 스펙입니다.
 * (기존 coach.api.ts는 실제 스펙이 없어 추정 타입으로 만들어졌던 상태 — 이번에 실제 스펙으로 교체)
 * ⚠️ (업데이트) 응답의 scripts[].scriptId를 evaluations/record에 넘기던 건 이제 안 씁니다 —
 * 그 API의 실제 스펙에는 scriptId 필드가 없고, 대신 이 API의 최상위 응답에 있는
 * presentationId를 evaluations/record 쪽으로 넘겨야 합니다. (feedback.ts 참고)
 */

// 서버(하이라이트 요약 API 등)가 실제로 내려주는 하이라이트 카테고리 값.
// ⚠️ "length"는 화면의 "장단음" 배지(CoachViewPage의 HighlightType으로는 "duration")에
// 대응한다 — 이름이 다르다고 새로 정의한 게 아니라 같은 개념을 가리키는 것! 서버가 이
// 세 가지 외의 값을 내려줄 수도 있어 문자열 전체를 막아두지는 않는다.
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

/**
 * ⚠️ POST /api/presentations/custom 성공 응답의 result 필드.
 * 이름이 CustomPresentationResult랑 비슷해서 헷갈리기 쉽지만 응답 모양이 다르다 —
 * 실제로 테스트해보니 이 API는 파일 저장/업로드까지만 처리하고 끝나서, 대본 원문
 * (content)이나 하이라이팅은 이 응답에 안 들어있다. slides는 분석이 비동기라서
 * 생성 직후에는 항상 빈 배열로 온다(스펙 문서에 있던 scripts[].content/highlights
 * 구조는 이 API 응답이 아니라 GET /highlights 쪽 응답이었다). 실제 대본+하이라이팅은
 * 여기서 받은 presentationId로 getPresentationHighlights()를 따로 호출해야 얻는다.
 */
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

  // ⚠️ Content-Type을 직접 지정하지 않는다. FormData를 fetch에 넘기면 브라우저가
  // multipart/form-data 경계(boundary)를 자동으로 채워주는데, 여기서 수동으로
  // 'multipart/form-data'만 지정하면 boundary가 빠져서 서버가 파일을 파싱하지 못한다.
  // (feedback.ts의 recordEvaluation과 동일한 이유)
  const response = await apiFetch<ApiSuccessResponse<CustomPresentationCreateResult>>(
    CUSTOM_PRESENTATION_ENDPOINT,
    { method: 'POST', body: formData },
  );

  return response.result;
}

/**
 * 업로드한 대본 파일 또는 (ScriptEditPage에서 수정된) 생성 대본에 발음 하이라이팅을
 * 적용해서 조회하는 API.
 *
 * GET /api/presentations/{presentationId}/highlights (인증 필요)
 *
 * ⚠️ createCustomPresentation()의 응답(CustomPresentationCreateResult)에는 대본 원문/
 * 하이라이팅이 없다 — 그건 이 API로 따로 받아야 한다. presentationId 하나만 있으면 되고,
 * CoachSetPage(커스텀 대본 업로드/직접 입력)든 ScriptEditPage("발표코칭" 버튼으로 넘어온
 * AI 생성/수정 대본)든 진입 경로와 상관없이 이 API 하나로 공용 처리한다. 그래서 로딩
 * 페이지도 흐름별로 두 개 나눌 필요 없이 CoachLoading 하나로 공용 처리하면 된다.
 */
export async function getPresentationHighlights(
  presentationId: number,
  // ⚠️ CoachLoading이 마운트 시점에 이 요청을 보내는데, React 18 개발 모드의 <StrictMode>가
  // 마운트를 두 번 시뮬레이션하면서 이 GET도 실제로 서버까지 두 번 나간다(recordEvaluation과
  // 동일한 패턴). GET이라 레코드가 새로 쌓이진 않지만, 하이라이팅 분석 자체가 가벼운 작업이
  // 아닐 수 있어서 signal을 받아 첫 번째(StrictMode 테스트용) 요청을 취소할 수 있게 한다.
  signal?: AbortSignal,
): Promise<CustomPresentationResult> {
  const response = await apiFetch<ApiSuccessResponse<CustomPresentationResult>>(
    `/api/presentations/${presentationId}/highlights`,
    { method: 'GET', signal },
  );

  return response.result;
}

// ── apiFetch를 안 쓰는(=응답이 JSON이 아니라 바이너리/파일 스트림인) 엔드포인트 공용 ──

// client.js의 API_BASE_URL 결정 규칙과 동일하게 맞춘다:
// 1) VITE_API_BASE_URL이 있으면 그 값을 그대로 쓰고,
// 2) 없으면 프로덕션(https) 빌드에서는 상대경로("")를 써서 vercel.json rewrites가
//    중계하게 하고, 로컬 개발에서는 백엔드로 바로 요청한다.
// (HTTPS 페이지에서 http://로 직접 요청하면 mixed content로 조용히 막히는 문제가
// client.js에서 이미 한 번 있었던 문제라 동일하게 방어한다.)
// ⚠️ TTS 음성 재생뿐 아니라 아래 하이라이트 리포트 다운로드에서도 같이 쓰여서
// "AUDIO_"가 아니라 좀 더 일반적인 이름으로 뒀다.
const RAW_FETCH_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '' : 'http://13.209.87.115:8080');

// ── 하이라이트 단어 음성(TTS) 듣기 ────────────────────────────────

const HIGHLIGHT_TTS_ENDPOINT = '/api/audio/tts/highlight';

export interface HighlightTtsParams {
  /** 해당 단어가 속한 발표 자료 ID */
  presentationId: number;
  /** 음성으로 변환할 하이라이트 단어 텍스트 */
  word: string;
  /** 목소리 스타일 (예: "hyeri_energetic", "daesung_calm") */
  voice?: string;
  /** 음성 재생 속도 (예: 1, 1.2) */
  speed?: number;
}

/**
 * 특정 하이라이트 단어를 선택한 목소리/속도로 읽어주는 TTS API.
 *
 * POST /api/audio/tts/highlight (application/json, 인증 필요)
 * 성공 시(200) 응답 본문이 JSON이 아니라 MP3 오디오 바이너리(Content-Type: audio/mpeg)로
 * 그대로 내려온다.
 *
 * ⚠️ apiFetch()는 JSON이 아니면 무조건 res.text()로 읽는데, text()는 바이트를 UTF-8
 * 문자열로 디코딩해버려서 MP3 같은 바이너리 데이터가 깨진다. 그래서 이 함수는 apiFetch를
 * 쓰지 않고 직접 fetch + res.blob()으로 바이너리를 그대로 받는다. (인증 헤더 붙이는 방식은
 * apiFetch/client.js와 동일하게 맞춘다.)
 */
export async function fetchHighlightTtsAudio(
  params: HighlightTtsParams,
): Promise<Blob> {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${RAW_FETCH_API_BASE_URL}${HIGHLIGHT_TTS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    // 실패 응답은 스펙상 JSON(예: 존재하지 않는 발표 자료입니다)이라 이건 그대로 파싱한다.
    let message = `음성 생성에 실패했습니다. (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* 바디 없음 또는 JSON이 아님 */
    }
    throw new Error(message);
  }

  return res.blob();
}

// ── 하이라이팅 적용된 대본 다운로드 ──────────────────────────────

const DEFAULT_HIGHLIGHTED_DOWNLOAD_FILENAME = 'highlighted_script_report.txt';

export interface DownloadedHighlightedScript {
  blob: Blob;
  filename: string;
}

// Content-Disposition 헤더(예: `attachment; filename=highlighted_script_report.txt`,
// 또는 한글 파일명이면 `filename*=UTF-8''...` 형태일 수도 있음)에서 파일명만 뽑아낸다.
// 파싱에 실패하면(헤더가 없거나 형식이 다르면) 스펙에 나온 기본 파일명으로 폴백한다.
function extractFilenameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      /* 디코딩 실패 시 아래 다른 패턴으로 계속 시도 */
    }
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(header);
  if (quotedMatch) return quotedMatch[1];

  const bareMatch = /filename=([^;]+)/i.exec(header);
  if (bareMatch) return bareMatch[1].trim();

  return fallback;
}

export async function downloadHighlightedScript(
  presentationId: number,
): Promise<DownloadedHighlightedScript> {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(
    `${RAW_FETCH_API_BASE_URL}/api/presentations/${presentationId}/download/highlighted`,
    {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!res.ok) {
    // 실패 응답은 스펙상 JSON(예: "존재하지 않는 발표 자료입니다")이라 그대로 파싱한다.
    let message = `다운로드에 실패했습니다. (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* 바디 없음 또는 JSON이 아님 */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const filename = extractFilenameFromContentDisposition(
    res.headers.get('content-disposition'),
    DEFAULT_HIGHLIGHTED_DOWNLOAD_FILENAME,
  );

  return { blob, filename };
}
