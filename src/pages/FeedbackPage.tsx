import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 에셋 및 컴포넌트 불러오기
import bgSvg from '../assets/select-page-background.png';
import MainChip from '../components/MainChip';
import type { EvaluationResult, EvaluationWordDetail } from '../apis/feedback';
import type {
  CustomPresentationResult,
  PresentationScript,
  HighlightCategory,
} from '../apis/coach.api';

interface FeedbackResultState {
  evaluationResult?: EvaluationResult;
  file?: File;
  presentation?: CustomPresentationResult;
  entry?: 'file' | 'realtime';
}

// API 연동 전 || 이 페이지에 바로 진입해서 테스트할 때 보여줄 목데이터
const MOCK_RECOGNIZED_TEXT = `안녕하세요, 여러분!\n오늘 저희는 특별한 주제로 여러분께 소개해드리고자 이 자리에 섰습니다.\n지금부터 보여드릴 내용은 다소 난해하게 느껴질 수도 있지만, 흥미로운 점들이 많이 담겨 있으니 끝까지 함께 해주시길 바랍니다.\n\n먼저 첫 번째 슬라이드를 통해 기본적인 구성 요소를 알아보도록 하겠습니다.\n여기에는 다양한 기호와 문자들이 조합되어 있는데요, 이는 저희 주제에서 자주 등장하는 심벌들입니다. 이 심벌들은 각각의 의미를 가지고 있으며, 앞으로의 설명에서도 반복해서 등장할 것 입니다.\n특정 기호나 숫자들은 특정한 개념이나 방향을 나타고 있습니다.\n\n다음 두 번째 슬라이드로 넘어가면, 조금 더 복잡한 형태의 패턴이 나타나고 있습니다.\n이 패턴들은 단순한 배열 이상의 의미를 가지며, 서로 다른 요소들이 어떻게 연결되고 상호작용하는지 보여줍니다.\n이러한 패턴을 이해함으로써, 전체적인 구조와 원리를 파악하는데 큰 도움이 될 것 입니다.\n\n...(하이라이팅이 적용된 대본이 들어갑니다)`;
const getScoreFeedback = (value: number) => {
  if (value >= 95) {
    return {
      title: '완벽해요! 🎉',
      detail: '발음이 아주 정확하고 자연스러워요.\n지금처럼만 유지하면 돼요!',
    };
  }
  if (value >= 85) {
    return {
      title: '훌륭해요! 👏',
      detail:
        '전반적으로 안정적인 발표예요.\n장단음에 대한 부분만 좀 더 연습하면 더 완벽한 발표를 할 수 있을 것 같아요!',
    };
  }
  if (value >= 75) {
    return {
      title: '좋아요! 😊',
      detail: '전달력이 꽤 좋은 편이에요.\n하이라이트된 몇몇 단어들만 다듬으면 훨씬 더 자연스러워질 거예요.',
    };
  }
  if (value >= 65) {
    return {
      title: '조금씩 나아지고 있어요 💪',
      detail: '기본기는 잡혀 있어요.\n하이라이트된 단어들 위주로 반복 연습하면 점수가 눈에 띄게 오를 거예요.',
    };
  }
  if (value >= 50) {
    return {
      title: '기초부터 차근차근이요 🙂',
      detail: '발음이 아직 불안정한 부분이 있어요.\n녹음을 다시 들어보면서 하이라이트된 단어부터 천천히 교정해보세요.',
    };
  }
  return {
    title: '연습이 더 필요해요 🌱',
    detail: '지금은 발음보다 문장을 또박또박 끝까지 읽는 데 집중해보세요.\n짧은 문장부터 천천히 반복 연습하면 금방 좋아질 거예요.',
  };
};

/* ────────────────────────────────────────────────────────────
   "원본 텍스트" 박스 — CoachViewPage의 대본 뷰어와 동일한 방식(장단음/연음/표기-발음
   불일치 하이라이팅)으로 원본 대본을 보여준다.
   ⚠️ CoachViewPage.tsx에 있는 같은 이름의 로직을 그대로 가져다 쓰지 않고 이 파일 안에
   따로 복제해뒀습니다(ScoreDonut과 동일한 이유 — 이 프로젝트에서는 페이지마다 필요한
   만큼만 독립적으로 복제해서 쓰는 방식을 써왔습니다). 다만 이 페이지에서는 클릭 시
   TTS 재생이나 툴팁 이동 같은 인터랙션이 필요 없어서, 그 부분은 뺀 "보여주기 전용"
   버전입니다.
   ──────────────────────────────────────────────────────────── */

type HighlightType = 'duration' | 'liaison' | 'mismatch';

interface ReferenceSegment {
  text: string;
  highlight?: HighlightType;
}

type ReferenceParagraph = ReferenceSegment[];

const REFERENCE_HIGHLIGHT_META: Record<HighlightType, { textClass: string; bgClass: string; shadow: string }> = {
  duration: {
    textClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10',
    shadow: 'shadow-[inset_0px_-2px_0px_0px_rgba(247,53,142,1)]',
  },
  liaison: {
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-600/10',
    shadow: 'shadow-[inset_0px_-2px_0px_0px_rgba(0,114,242,1)]',
  },
  mismatch: {
    textClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
    shadow: 'shadow-[inset_0px_-2px_0px_0px_rgba(247,147,34,1)]',
  },
};

// 서버가 내려주는 category 문자열(CoachViewPage.tsx의 mapHighlightCategory와 동일 매핑) —
// "length"는 화면 표시명은 "장단음"이지만 내부 타입명은 duration을 쓴다.
const mapHighlightCategory = (category: HighlightCategory): HighlightType => {
  switch (category) {
    case 'length':
      return 'duration';
    case 'liaison':
      return 'liaison';
    case 'mismatch':
      return 'mismatch';
    default:
      return 'mismatch';
  }
};

// 원본 대본에는 문장마다 단일 개행("\n")만 있고 진짜 문단 구분("\n\n" 이상)은 없다.
// CoachViewPage의 contentToParagraphs와 동일한 절충안(문장은 공백으로 이어붙여 폭에 맞게
// 자연스럽게 줄바꿈되게 하되, 2문장마다 새 문단을 열어 숨 쉴 틈을 준다)을 그대로 적용한다.
const SENTENCES_PER_GROUP = 2;

const buildReferenceParagraphs = (script: PresentationScript): ReferenceParagraph[] => {
  const { content, highlights, scriptId } = script;
  const sortedHighlights = [...highlights].sort((a, b) => a.positionStart - b.positionStart);

  const flatSegments: ReferenceSegment[] = [];
  let cursor = 0;
  for (const highlight of sortedHighlights) {
    if (highlight.positionStart > cursor) {
      flatSegments.push({ text: content.slice(cursor, highlight.positionStart) });
    }
    flatSegments.push({
      text: content.slice(highlight.positionStart, highlight.positionEnd),
      highlight: mapHighlightCategory(highlight.category),
    });
    cursor = highlight.positionEnd;
  }
  if (cursor < content.length) {
    flatSegments.push({ text: content.slice(cursor) });
  }

  const paragraphs: ReferenceParagraph[] = [[]];
  let sentencesInCurrentGroup = 0;

  const appendPlainText = (text: string) => {
    if (!text) return;
    const current = paragraphs[paragraphs.length - 1];
    const last = current[current.length - 1];
    if (last && !last.highlight) {
      last.text += (last.text ? ' ' : '') + text;
    } else {
      current.push({ text });
    }
  };

  for (const segment of flatSegments) {
    if (segment.highlight) {
      paragraphs[paragraphs.length - 1].push(segment);
      continue;
    }

    const blocks = segment.text.split(/\n{2,}/);
    blocks.forEach((block, blockIdx) => {
      if (blockIdx > 0) {
        paragraphs.push([]);
        sentencesInCurrentGroup = 0;
      }

      const sentences = block.split('\n');
      sentences.forEach((sentence, sIdx) => {
        if (sIdx > 0) {
          sentencesInCurrentGroup += 1;
          if (sentencesInCurrentGroup >= SENTENCES_PER_GROUP) {
            paragraphs.push([]);
            sentencesInCurrentGroup = 0;
          }
        }
        appendPlainText(sentence.trim());
      });
    });
  }

  // ⚠️ scriptId는 지금 당장은 쓰이지 않지만, 나중에 세그먼트별 key가 필요해지면 바로
  // 붙일 수 있도록 파라미터에서 구조분해만 해뒀다(미사용 변수 경고 방지용 참조).
  void scriptId;

  return paragraphs.filter((paragraph) => paragraph.length > 0);
};

/* ────────────────────────────────────────────────────────────
   "인식 텍스트" 박스 — STT로 인식된 텍스트 중, wordsDetail(evaluationResult)에 기록된
   틀린 구간(recognized_span)을 빨간 글씨로 표시한다.
   ──────────────────────────────────────────────────────────── */

interface RecognizedSegment {
  text: string;
  isError: boolean;
}

// ⚠️ wordsDetail은 "틀린 단어만" 담겨서 오는 게 아니라, 인식된 단어 전체를 하나씩 다
// 담아서 온다(맞은 단어도 포함). 실제 응답을 보면 한 단어당 항목이 하나씩 있고,
// error_type이 "None"(정상 발음)인 것과 "Mispronunciation"(발음 오류)인 것이 섞여있다.
// 예전 코드는 이 구분 없이 wordsDetail에 있는 모든 단어를 다 "틀린 부분"으로 칠해버려서,
// 점수가 높아도 인식 텍스트가 거의 다 빨갛게 보이는 문제가 있었다. error_type이
// "None"인 항목은 제외하고, 실제로 오류로 표시된 항목만 빨간 글씨로 표시하도록 고쳤다.
const NO_ERROR_TYPE = 'none';

const buildRecognizedSegments = (
  text: string,
  wordsDetail: EvaluationWordDetail[],
): RecognizedSegment[] => {
  const spans = wordsDetail
    .filter((word) => (word.error_type ?? '').trim().toLowerCase() !== NO_ERROR_TYPE)
    .map((word) => word.recognized_span)
    .filter(
      (span): span is [number, number] =>
        Array.isArray(span) && span.length === 2 && span[0] < span[1],
    )
    .sort((a, b) => a[0] - b[0]);

  if (spans.length === 0) {
    return text ? [{ text, isError: false }] : [];
  }

  // 겹치는 구간이 올 수도 있어 하나로 합쳐준다.
  const merged: [number, number][] = [];
  for (const [start, end] of spans) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const segments: RecognizedSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    const s = Math.max(start, 0);
    const e = Math.min(end, text.length);
    if (s > cursor) segments.push({ text: text.slice(cursor, s), isError: false });
    if (e > s) segments.push({ text: text.slice(s, e), isError: true });
    cursor = Math.max(cursor, e);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), isError: false });

  return segments;
};


interface PracticeTip {
  key: string;
  title: string;
  description: string;
}

interface WeakWord {
  word: string;
  accuracy_score: number;
  error_type: string;
}

interface DeductionFactor {
  key: string;
  label: string;
  count: number;
  ratio_percent: number | null;
  severity?: string;
  message?: string;
}

interface FeedbackDetailPayload {
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  practice_tips?: PracticeTip[];
  weak_words?: WeakWord[];
  deductions?: {
    factors?: DeductionFactor[];
    scores?: {
      accuracy?: number;
      fluency?: number;
      completeness?: number;
      pronunciation_score?: number;
    };
  };
}

// feedbackDetail 문자열을 구조화된 객체로 파싱해본다. JSON이 아니거나(=순수 서술형
// 문자열), 파싱은 되지만 우리가 기대하는 모양이 전혀 아니면(summary/strengths/... 중
// 아무것도 없으면) null을 돌려줘서 호출부가 기존 방식(그냥 문단으로 표시)으로 폴백하게 한다.
const parseFeedbackDetail = (raw: string | null): FeedbackDetailPayload | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null; // JSON 객체가 아니면 파싱 시도조차 안 한다.
  try {
    const parsed = JSON.parse(trimmed) as FeedbackDetailPayload;
    const hasKnownField =
      parsed.summary ||
      parsed.strengths?.length ||
      parsed.improvements?.length ||
      parsed.practice_tips?.length ||
      parsed.weak_words?.length ||
      parsed.deductions;
    return hasKnownField ? parsed : null;
  } catch {
    return null;
  }
};

const SEVERITY_META: Record<string, { textClass: string; bgClass: string }> = {
  high: { textClass: 'text-red-500', bgClass: 'bg-red-50' },
  medium: { textClass: 'text-amber-500', bgClass: 'bg-amber-50' },
  low: { textClass: 'text-slate-500', bgClass: 'bg-slate-100' },
};

const FeedbackDetailView = ({ payload }: { payload: FeedbackDetailPayload }) => {
  const scores = payload.deductions?.scores;
  const scoreEntries: { label: string; value: number }[] = [
    { label: '정확도', value: scores?.accuracy ?? -1 },
    { label: '유창성', value: scores?.fluency ?? -1 },
    { label: '완성도', value: scores?.completeness ?? -1 },
    { label: '발음 점수', value: scores?.pronunciation_score ?? -1 },
  ].filter((entry) => entry.value >= 0);

  return (
    <div className="flex flex-col gap-6">
      {payload.summary && (
        <p className="text-[14px] text-[#27272A] leading-relaxed whitespace-pre-line">
          {payload.summary}
        </p>
      )}

      {scoreEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {scoreEntries.map((entry) => (
            <div
              key={entry.label}
              className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 shadow-sm outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"
            >
              <span className="text-xs font-medium text-[#64748B]">{entry.label}</span>
              <span className="text-xl font-bold text-[#27272A]">{entry.value}점</span>
            </div>
          ))}
        </div>
      )}

      {(payload.strengths?.length || payload.improvements?.length) ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {payload.strengths && payload.strengths.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-emerald-50 p-4">
              <h4 className="text-sm font-bold text-emerald-700">잘한 점</h4>
              <ul className="flex flex-col gap-1.5">
                {payload.strengths.map((item, idx) => (
                  <li key={idx} className="text-[13px] leading-relaxed text-emerald-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {payload.improvements && payload.improvements.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-amber-50 p-4">
              <h4 className="text-sm font-bold text-amber-700">개선할 점</h4>
              <ul className="flex flex-col gap-1.5">
                {payload.improvements.map((item, idx) => (
                  <li key={idx} className="text-[13px] leading-relaxed text-amber-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {payload.practice_tips && payload.practice_tips.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-[#27272A]">연습 팁</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {payload.practice_tips.map((tip) => (
              <div
                key={tip.key}
                className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 shadow-sm outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"
              >
                <span className="text-[13px] font-bold text-[#27272A]">{tip.title}</span>
                <span className="text-[13px] leading-relaxed text-[#64748B]">{tip.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {payload.weak_words && payload.weak_words.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-[#27272A]">특히 연습이 필요한 단어</h4>
          <div className="flex flex-wrap gap-2">
            {payload.weak_words.map((w, idx) => (
              <span
                key={`${w.word}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[13px] font-semibold text-red-500"
              >
                {w.word}
                <span className="text-red-400">{w.accuracy_score}점</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {payload.deductions?.factors && payload.deductions.factors.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-[#27272A]">감점 요인</h4>
          <div className="flex flex-col gap-2">
            {payload.deductions.factors.map((factor) => {
              const meta = SEVERITY_META[factor.severity ?? 'low'] ?? SEVERITY_META.low;
              return (
                <div
                  key={factor.key}
                  className={`flex items-start gap-2 rounded-xl px-4 py-3 text-[13px] leading-relaxed ${meta.bgClass} ${meta.textClass}`}
                >
                  <span className="font-bold">{factor.label}</span>
                  <span className="flex-1">{factor.message ?? `${factor.count}회`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 발음 종합 점수 도넛 차트.
 * CoachViewPage의 ScoreDonut과 동일한 방식(SVG stroke-dashoffset 애니메이션)을 사용해
 * 앱 전체에서 점수 도넛의 두께/애니메이션이 일관되게 보이도록 맞췄습니다.
 * mount 시 0%에서 목표 점수까지 시계방향으로 자연스럽게 채워집니다.
 */
const ScoreDonut = ({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // 0으로 리셋한 다음 프레임에 목표 점수로 올려야 transition이 실제로 재생됩니다.
    setAnimatedScore(0);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimatedScore(score));
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const SIZE = 158;
  const STROKE = 14;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedScore / 100);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
      <defs>
        <linearGradient id="feedbackScoreDonutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={STROKE} />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke="url(#feedbackScoreDonutGradient)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
    </svg>
  );
};

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resultState = (location.state as FeedbackResultState | null) ?? null;
  const evaluationResult = resultState?.evaluationResult ?? null;
  const presentation = resultState?.presentation ?? null;

  // 실제 서버 응답이 있으면 그 값을, 없으면(예: 이 페이지로 직접 진입해서 테스트하는 경우)
  // 목데이터를 사용합니다. 실제 값과 목데이터를 섞어서 "가짜인데 진짜처럼" 보여주지
  // 않도록, 원본 텍스트처럼 서버가 아예 안 주는 필드는 목데이터일 때만 채웁니다.
  const overallScore = evaluationResult?.totalScore ?? 87;
  const recognizedText = evaluationResult?.recognizedText ?? MOCK_RECOGNIZED_TEXT;
  const feedbackDetail = evaluationResult?.feedbackDetail ?? null;
  const audioFileName = evaluationResult?.audioFileName ?? resultState?.file?.name ?? null;

  // 좌측 "원본 텍스트" — presentation(CoachViewPage가 들고 있던 실제 대본+하이라이트)이
  // 있으면 CoachViewPage와 동일한 하이라이팅을 적용해서 보여주고, 없으면(예: presentation을
  // 안 넘겨받은 흐름으로 들어온 경우) 하이라이팅 없이 원문 텍스트만 보여준다.
  const referenceParagraphs = useMemo<ReferenceParagraph[]>(() => {
    const scripts = presentation?.scripts;
    if (scripts && scripts.length > 0) {
      const sortedScripts = [...scripts].sort((a, b) => a.slideId - b.slideId);
      return sortedScripts.flatMap((script) => buildReferenceParagraphs(script));
    }
    const fallbackText = evaluationResult?.referenceText ?? MOCK_RECOGNIZED_TEXT;
    return fallbackText
      .split(/\n{2,}/)
      .map((block) => [{ text: block.replace(/\n/g, ' ').trim() }])
      .filter((paragraph) => paragraph[0]?.text);
  }, [presentation, evaluationResult?.referenceText]);

  // 우측 "인식 텍스트" — wordsDetail의 recognized_span 구간을 빨간 글씨로 표시한다.
  const recognizedSegments = useMemo<RecognizedSegment[]>(
    () => buildRecognizedSegments(recognizedText, evaluationResult?.wordsDetail ?? []),
    [recognizedText, evaluationResult?.wordsDetail],
  );

  // "상세 피드백" — feedbackDetail이 JSON 문자열(summary/strengths/... 구조)로 오면
  // 파싱해서 구조화된 카드로 보여주고, 파싱이 안 되면(순수 서술형 문자열이면) null이 되어
  // 아래 렌더링에서 기존처럼 그냥 문단으로 표시한다.
  const feedbackDetailPayload = useMemo(() => parseFeedbackDetail(feedbackDetail), [feedbackDetail]);

  const scoreFeedback = getScoreFeedback(overallScore);

  const handleRetest = () => {
    if (resultState?.entry === 'file') {
      // presentationId가 없으면(예: presentation을 못 받은 아주 예전 진입 경로) 파일 업로드
      // 화면이 "평가할 대본 정보가 없어요" 에러를 보여주고 CoachView로 돌아가라고 안내한다.
      navigate('/feedback-fileupload', {
        state: { presentationId: presentation?.presentationId, presentation },
      });
      return;
    }
    navigate('/coach-view', { state: { presentation } });
  };

  return (
    <div
      className="relative w-screen min-h-screen bg-cover bg-center overflow-y-auto"
      style={{
        backgroundImage: `url(${bgSvg})`,
        fontFamily: 'Pretendard, sans-serif',
      }}>
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-[50px] py-[120px] flex flex-col gap-6 box-border">

        {/* ================= 1. Title Bar ================= */}
        <div
          className="w-full bg-white/90 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-between box-border"
          style={{
            height: '66px',
            borderRadius: '11.36px',
            paddingTop: '10px',
            paddingRight: '10px',
            paddingBottom: '10px',
            paddingLeft: '25px',
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-bold text-[#27272A]">최종 평가 결과</h2>
            {audioFileName && (
              <span className="text-xs font-medium text-[#94A3B8] truncate max-w-[220px]">{audioFileName}</span>
            )}
          </div>
          <button
            onClick={handleRetest}
            className="flex items-center gap-2 text-[#6366f1] px-4 py-2 rounded-[8px] text-sm font-semibold transition-all cursor-pointer border border-indigo-100 shadow-sm"
            style={{
              backgroundColor: 'rgba(91, 108, 251, 0.1)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 테스트
          </button>
        </div>

        {/* ================= 2. Score Box ================= */}
        <div
          className="w-full bg-white/90 backdrop-blur-md shadow-md border border-white/80 flex flex-col justify-between box-border"
          style={{
            minHeight: '288px',
            borderRadius: '20px',
            paddingTop: '40px',
            paddingRight: '25px',
            paddingBottom: '40px',
            paddingLeft: '25px',
            gap: '24px',
          }}
        >
              <div className="flex items-center gap-2 my-2">
                <h2 className="text-[20px] font-bold text-[#27272A]">평가 결과</h2>
                <MainChip
                  text="AI 생성"
                  scale={0.7}
                  className="whitespace-nowrap"
                />
              </div>

          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">
            <div
              className="relative flex-shrink-0 flex items-center justify-center"
              style={{ width: '158px', height: '158px' }}
            >
              <ScoreDonut score={overallScore} />

              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div
                  className="flex flex-col items-center justify-center box-border"
                  style={{
                    width: '57.68px',
                    height: '60.68px',
                    gap: '3.68px',
                  }}
                >
                  <span className="text-[30px] font-semibold text-[#6366f1] leading-[100%] tracking-[-0.02em] text-center whitespace-nowrap">
                    {overallScore}점
                  </span>
                  <span className="text-[18px] font-medium text-gray-400 leading-[100%] tracking-normal text-center whitespace-nowrap">
                    /100
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1.5 text-center md:text-left">
              <h4 className="text-[20px] font-bold text-[#27272A]">
                총점 {overallScore}점 - {scoreFeedback.title}
              </h4>
              <p className="text-[14px] text-[#64748B] leading-relaxed whitespace-pre-line">
                {scoreFeedback.detail}
              </p>
              {!evaluationResult && (
                <p className="text-[12px] text-amber-500 font-medium mt-1">
                  ⚠️ 실제 평가 결과 없이 목데이터로 보고 있는 화면입니다. (평가 플로우를 거쳐 들어오면 실제 점수가 표시됩니다.)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= 3. 원본 텍스트 / 인식 텍스트 (좌우 비교) ================= */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ---- 원본 텍스트 (CoachViewPage와 동일한 하이라이팅 적용) ---- */}
          <div
            className="w-full bg-white/95 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
            style={{
              height: '700px',
              borderRadius: '20px',
              paddingTop: '30px',
              paddingRight: '25px',
              paddingBottom: '30px',
              paddingLeft: '25px',
              gap: '12px',
            }}
          >
            <h3 className="text-[18px] font-bold text-[#27272A] shrink-0">
              원본 텍스트
            </h3>

            <div
              className="w-full bg-white box-border overflow-y-auto"
              style={{
                height: '622px',
                borderRadius: '12px',
                borderWidth: '0.5px',
                borderStyle: 'solid',
                borderColor: '#cbd5e1',
                padding: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {referenceParagraphs.map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="text-[16px] font-semibold text-[#27272A] leading-[200%] tracking-[-0.025em] select-text"
                >
                  {paragraph.map((segment, sIdx) => {
                    if (!segment.highlight) {
                      return <span key={sIdx}>{segment.text}</span>;
                    }
                    const meta = REFERENCE_HIGHLIGHT_META[segment.highlight];
                    return (
                      <span
                        key={sIdx}
                        className={`inline-block rounded-sm px-1 font-bold ${meta.bgClass} ${meta.textClass} ${meta.shadow}`}
                      >
                        {segment.text}
                      </span>
                    );
                  })}
                </p>
              ))}
            </div>
          </div>

          {/* ---- 인식 텍스트 (실제 인식된 발화, 틀린 부분은 빨간 글씨) ---- */}
          <div
            className="w-full bg-white/95 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
            style={{
              height: '700px',
              borderRadius: '20px',
              paddingTop: '30px',
              paddingRight: '25px',
              paddingBottom: '30px',
              paddingLeft: '25px',
              gap: '12px',
            }}
          >
            <h3 className="text-[18px] font-bold text-[#27272A] shrink-0">
              인식 텍스트
            </h3>

            <div
              className="w-full bg-white box-border overflow-y-auto"
              style={{
                height: '622px',
                borderRadius: '12px',
                borderWidth: '0.5px',
                borderStyle: 'solid',
                borderColor: '#cbd5e1',
                padding: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div className="text-[16px] font-semibold text-[#27272A] leading-[200%] tracking-[-0.025em] whitespace-pre-line select-text">
                {recognizedSegments.map((segment, idx) =>
                  segment.isError ? (
                    <span key={idx} className="font-bold text-red-500">
                      {segment.text}
                    </span>
                  ) : (
                    <span key={idx}>{segment.text}</span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. Feedback Box (상세 피드백, 서술형) ================= */}
        <div
          className="w-full bg-white/90 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
          style={{
            borderRadius: '20px',
            paddingTop: '40px',
            paddingRight: '25px',
            paddingBottom: '40px',
            paddingLeft: '25px',
            gap: '24px',
          }}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] font-bold text-[#27272A]">상세 피드백</h3>
            <MainChip
              text="AI 피드백"
              scale={0.7}
              className="whitespace-nowrap"
            />
          </div>

          {feedbackDetailPayload ? (
            <FeedbackDetailView payload={feedbackDetailPayload} />
          ) : feedbackDetail ? (
            // JSON 파싱이 안 된 경우 — 순수 서술형 문자열로 온 경우에 대비한 폴백.
            <p className="text-[14px] text-[#27272A] leading-relaxed whitespace-pre-line">{feedbackDetail}</p>
          ) : (
            <p className="text-[13px] text-[#94A3B8]">
              {evaluationResult
                ? '아직 서버가 상세 피드백 문구(feedbackDetail)를 내려주지 않았어요.'
                : '실제 평가를 진행하면 이 영역에 서술형 상세 피드백이 표시됩니다.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
