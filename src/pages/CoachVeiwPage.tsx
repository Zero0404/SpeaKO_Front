import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Info,
  Download,
  Volume2,
  AudioLines,
  Ear,
  BarChart3,
  CheckCircle2,
  Timer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Minus,
  ChevronRight as ArrowIcon,
} from "lucide-react";
import ViewPageBackground from "../assets/background_gradiant.png";
import MainChip from "../components/MainChip";
import VoiceRecorder from "../components/VoiceRecorder";
import TaskChip from "../components/TaskChip";
import { useAuthStore } from "../store/authStore";
import type { EvaluationResult } from "../apis/feedback";
import type {
  CustomPresentationResult,
  PresentationScript,
  HighlightCategory,
} from "../apis/coach.api";

/* ────────────────────────────────────────────────────────────
   타입 정의
   ──────────────────────────────────────────────────────────── */

type HighlightType = "duration" | "liaison" | "mismatch";

interface ScriptSegment {
  id?: string;
  text: string;
  highlight?: HighlightType;
}

type ScriptParagraph = ScriptSegment[];

interface WordEntry {
  id: string;
  word: string;
  pronunciation: string;
  type: HighlightType;
  description: string;
}

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface PronunciationTip {
  icon: IconComponent;
  title: string;
  description: string;
}

// 대본 뷰어 / 단어 목록 패널과 우측 사이드바가 같은 세로 길이를 갖도록 부모(flex-1)의 h-full을 그대로 채운다.
// 단, 모바일/태블릿에서는 화면을 한 장에 억지로 욱여넣지 않고 내용만큼 자연스럽게 늘어난 뒤 페이지 자체가 스크롤되게 한다.
const PANEL_HEIGHT_CLASS = "h-auto xl:h-full";

const HIGHLIGHT_META: Record<
  HighlightType,
  {
    label: string;
    shortLabel: string;
    textClass: string;
    bgClass: string;
    shadow: string;
  }
> = {
  duration: {
    label: "장단음",
    shortLabel: "장단음",
    textClass: "text-pink-500",
    bgClass: "bg-pink-500/10",
    shadow: "shadow-[inset_0px_-2px_0px_0px_rgba(247,53,142,1)]",
  },
  liaison: {
    label: "연음",
    shortLabel: "연음",
    textClass: "text-blue-600",
    bgClass: "bg-blue-600/10",
    shadow: "shadow-[inset_0px_-2px_0px_0px_rgba(0,114,242,1)]",
  },
  mismatch: {
    label: "표기-발음 불일치",
    shortLabel: "표기 불일치",
    textClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    shadow: "shadow-[inset_0px_-2px_0px_0px_rgba(247,147,34,1)]",
  },
};

const MOCK_SCRIPT_PARAGRAPHS: ScriptParagraph[] = [
  [{ text: "...(하이라이팅이 적용된 대본이 들어갑니다)" }],
];

interface VoiceOption {
  id: string;
  name: string;
  style: string;
  gender: "남성" | "여성";
}

// ⚠️ 실제 TTS 재생(클로바보이스/Web Speech API)은 이 페이지에서 뺐다 — "AI 대본 듣기"는
// UI(목소리/속도 선택)만 남겨두고, 소리가 실제로 나오는 부분은 없앤 상태다. 목소리를
// 고르고 재생 버튼을 눌러도 소리는 나지 않는다.
const VOICE_OPTIONS: VoiceOption[] = [
  { id: "donghyun", name: "동현", style: "활기찬", gender: "남성" },
  { id: "daesung", name: "대성", style: "차분한", gender: "남성" },
  { id: "heri", name: "혜리", style: "활기찬", gender: "여성" },
  { id: "goeun", name: "고은", style: "차분한", gender: "여성" },
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.5, 2] as const;

const MOCK_WORD_ENTRIES: WordEntry[] = [
  {
    id: "hl-guseong",
    word: "구성",
    pronunciation: "[구ː성]",
    type: "duration",
    description: "장단음: 이 단어의 첫 음절은 길게 발음합니다.",
  },
  {
    id: "hl-teukjeong-1",
    word: "특정",
    pronunciation: "[특쩡]",
    type: "mismatch",
    description:
      "경음화: 받침 뒤에 오는 예사소리(ㄱ/ㄷ/ㅂ/ㅅ/ㅈ)가 된소리로 바뀌어 발음됩니다.",
  },
  {
    id: "hl-jogeum",
    word: "조금",
    pronunciation: "[조ː금]",
    type: "duration",
    description: "장단음: 이 단어의 첫 음절은 길게 발음합니다.",
  },
  {
    id: "hl-baeyeol",
    word: "배열",
    pronunciation: "[배ː열]",
    type: "duration",
    description: "장단음: 이 단어의 첫 음절은 길게 발음합니다.",
  },
  {
    id: "hl-teukjeong-2",
    word: "특정",
    pronunciation: "[특쩡]",
    type: "mismatch",
    description:
      "경음화: 받침 뒤에 오는 예사소리(ㄱ/ㄷ/ㅂ/ㅅ/ㅈ)가 된소리로 바뀌어 발음됩니다.",
  },
  {
    id: "hl-daseot",
    word: "다섯",
    pronunciation: "[다섣]",
    type: "liaison",
    description:
      "연음: 받침 'ㅅ'이 뒤따르는 음절의 초성으로 옮겨져 이어서 발음됩니다.",
  },
  {
    id: "hl-segye",
    word: "세계",
    pronunciation: "[세ː계]",
    type: "duration",
    description: "장단음: 이 단어의 첫 음절은 길게 발음합니다.",
  },
  {
    id: "hl-sago",
    word: "사고",
    pronunciation: "[사ː고]",
    type: "duration",
    description: "장단음: 이 단어의 첫 음절은 길게 발음합니다.",
  },
  {
    id: "hl-botong",
    word: "보통",
    pronunciation: "[보ː통]",
    type: "duration",
    description: "장단음: 이 단어의 첫 음절은 길게 발음합니다.",
  },
  {
    id: "hl-hakgyo",
    word: "학교",
    pronunciation: "[학꾜]",
    type: "mismatch",
    description:
      "경음화: 받침 'ㄱ' 뒤에 오는 예사소리 'ㄱ'이 된소리로 바뀌어 발음됩니다.",
  },
];

// 서버가 내려주는 category 문자열을 화면에서 쓰는 HighlightType(duration/liaison/mismatch)로
// 맞춰준다.
// ⚠️ 서버는 "장단음"을 "length"라는 이름으로 내려준다(우리 내부 타입명은 duration이지만
// 같은 개념 — "표기-발음 불일치"만 mismatch로 이름이 같다). 이 매핑을 놓치면 length
// 하이라이트가 전부 mismatch(표기 불일치, 주황색)로 잘못 표시된다.
// 이 세 가지 외의 값을 내려주는 경우(아직 정의 안 된 새 카테고리 등)에는 화면이 깨지지
// 않도록 일단 "mismatch"로 묶어서 보여준다.
const mapHighlightCategory = (category: HighlightCategory): HighlightType => {
  switch (category) {
    case "length":
      return "duration";
    case "liaison":
      return "liaison";
    case "mismatch":
      return "mismatch";
    default:
      return "mismatch";
  }
};

// PresentationScript(content 문자열 + positionStart/positionEnd 기준 highlights)를
// 화면이 실제로 렌더링하는 ScriptParagraph[]로 변환한다.
// - highlight 구간은 그대로 하이라이트 segment로 만들고, 그 사이사이는 일반 텍스트 segment로 채운다.
// - ⚠️ 원문 대본에는 문장마다 줄바꿈("\n")이 하나씩 들어있는 경우가 많은데, 이걸 그대로
//   문단 구분으로 쓰면 문장 하나가 곧 문단 하나가 돼버려서 줄이 다 짧게 끝나고 대본 뷰어
//   박스 폭을 아무리 넓혀도 줄이 채워지지 않는 것처럼 보인다. 그래서 실제 문단(큰 gap-5
//   간격) 구분은 빈 줄(연속된 줄바꿈, "\n\n" 이상)일 때만 한다.
//   ⚠️ 그렇다고 문장 사이의 단일 줄바꿈을 완전히 없애버리면(공백으로 치환) 반대로 원문에
//   \n\n이 아예 없는 대본에서는 전체가 줄바꿈 하나 없는 하나의 거대한 문단으로 뭉쳐버려서
//   너무 빽빽해 보인다. 그래서 단일 개행은 지우지 않고 그대로 text에 남겨뒀다가, 렌더링
//   단계에서 같은 문단 안의 "줄바꿈(<br/>)"으로 표시한다 — 문단 간격(gap-5)만큼 크게 벌어지진
//   않지만, 원문에 있던 문장 단위 줄바꿈은 화면에도 그대로 살아있게 된다.
const contentToParagraphs = (script: PresentationScript): ScriptParagraph[] => {
  const { content, highlights, scriptId } = script;
  const sortedHighlights = [...highlights].sort(
    (a, b) => a.positionStart - b.positionStart,
  );

  const flatSegments: ScriptSegment[] = [];
  let cursor = 0;
  for (const highlight of sortedHighlights) {
    if (highlight.positionStart > cursor) {
      flatSegments.push({ text: content.slice(cursor, highlight.positionStart) });
    }
    flatSegments.push({
      id: `hl-${scriptId}-${highlight.highlightId}`,
      text: content.slice(highlight.positionStart, highlight.positionEnd),
      highlight: mapHighlightCategory(highlight.category),
    });
    cursor = highlight.positionEnd;
  }
  if (cursor < content.length) {
    flatSegments.push({ text: content.slice(cursor) });
  }

  const paragraphs: ScriptParagraph[] = [[]];
  for (const segment of flatSegments) {
    if (segment.highlight) {
      paragraphs[paragraphs.length - 1].push(segment);
      continue;
    }
    // 빈 줄(연속된 개행)일 때만 새 문단을 시작한다. 문단 안에 남아있는 단일 개행은 지우지
    // 않고 그대로 둔다 — 렌더링할 때 <br/>로 표시해서 원문의 문장 단위 줄바꿈을 살린다.
    const chunks = segment.text.split(/\n{2,}/);
    chunks.forEach((chunk, idx) => {
      if (idx > 0) paragraphs.push([]);
      // 문단 앞뒤에 남은 단일 개행(예: 빈 줄 바로 앞/뒤)만 정리하고, 문단 내부의 개행은 유지한다.
      const trimmedChunk = chunk.replace(/^\n+/, "").replace(/\n+$/, "");
      if (trimmedChunk) paragraphs[paragraphs.length - 1].push({ text: trimmedChunk });
    });
  }
  return paragraphs.filter((paragraph) => paragraph.length > 0);
};

// 여러 script(슬라이드)에 걸친 highlights를 전부 모아 단어 목록 카드용 WordEntry[]로 만든다.
const contentToWordEntries = (scripts: PresentationScript[]): WordEntry[] =>
  scripts.flatMap((script) =>
    script.highlights.map((highlight) => ({
      id: `hl-${script.scriptId}-${highlight.highlightId}`,
      word: highlight.word,
      pronunciation: highlight.standardPronunciation,
      type: mapHighlightCategory(highlight.category),
      description: highlight.ruleDesc,
    })),
  );

// 대본 뷰어 안의 하이라이트 단어에 마우스를 올리면 보여줄 툴팁을 위해
// segment.id -> WordEntry 로 바로 찾을 수 있게 맵으로 만들어둔다.
const buildWordEntryById = (entries: WordEntry[]) =>
  new Map(entries.map((entry) => [entry.id, entry]));

// 단어 목록 카드에는 같은 단어(예: "특정")가 대본에 여러 번 나와도 한 번만 보여준다.
// (대본 뷰어 쪽 하이라이트는 각 등장 위치마다 그대로 다 표시되고, 여기서만 목록용으로 중복 제거)
const buildUniqueWordEntries = (entries: WordEntry[]): WordEntry[] => {
  const seenWords = new Set<string>();
  const result: WordEntry[] = [];
  for (const entry of entries) {
    if (seenWords.has(entry.word)) continue;
    seenWords.add(entry.word);
    result.push(entry);
  }
  return result;
};

// 같은 단어(예: "특정")가 대본에 여러 번 등장할 때, 그 등장 위치들의 segment.id를
// "실제 대본에 나오는 순서" 그대로 모아둔다. (entries 배열 순서는 대본 순서와 다를 수 있어서
// paragraphs를 직접 훑어서 만든다.) 툴팁의 좌우 화살표 이동과, 단어 목록 클릭 시
// "맨 위(가장 먼저 나오는) 위치로 이동"에 사용한다.
const buildOccurrenceIdsByWord = (paragraphs: ScriptParagraph[]): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const paragraph of paragraphs) {
    for (const segment of paragraph) {
      if (segment.highlight && segment.id) {
        const list = map.get(segment.text) ?? [];
        list.push(segment.id);
        map.set(segment.text, list);
      }
    }
  }
  return map;
};

const buildHighlightSummary = (
  entries: WordEntry[],
): { type: HighlightType; count: number }[] =>
  (["duration", "liaison", "mismatch"] as HighlightType[]).map((type) => ({
    type,
    count: entries.filter((w) => w.type === type).length,
  }));

const pronunciationTips: PronunciationTip[] = [
  {
    icon: AudioLines,
    title: "명백한 자음 발음",
    description: "'ㄷ,ㅈ,ㅅ' 계열의 자음을 더 또렷하게 발음해보세요.",
  },
  {
    icon: Ear,
    title: "끝소리 주의",
    description: "단어의 끝소리를 자연스럽게 마무리해보세요.",
  },
  {
    icon: BarChart3,
    title: "강세와 억양",
    description: "중요한 키워드에 강세를 주면 더 전달력이 높아져요.",
  },
  {
    icon: Timer,
    title: "천천히 강조하기",
    description: "핵심 문장 앞에서는 속도를 늦춰 또박또박 전달해보세요.",
  },
];

/* ────────────────────────────────────────────────────────────
   서브 컴포넌트
   ──────────────────────────────────────────────────────────── */

const LegendBadge = ({ type }: { type: HighlightType }) => {
  const meta = HIGHLIGHT_META[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-base font-bold font-['Pretendard'] leading-4 ${meta.bgClass} ${meta.textClass} ${meta.shadow}`}
    >
      {meta.label}
    </span>
  );
};

const HighlightSpan = ({
  type,
  isFocused,
  onClick,
  tooltip,
  prevId,
  nextId,
  onNavigate,
  children,
}: {
  type: HighlightType;
  isFocused?: boolean;
  onClick?: () => void;
  tooltip?: { word: string; pronunciation: string };
  prevId?: string;
  nextId?: string;
  onNavigate?: (id: string) => void;
  children: React.ReactNode;
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meta = HIGHLIGHT_META[type];

  const openTooltip = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };
  const scheduleCloseTooltip = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const showTooltip = Boolean(tooltip) && (isOpen || Boolean(isFocused));

  useEffect(() => {
    if (!showTooltip || !spanRef.current) {
      setTooltipPos(null);
      return;
    }

    const HALF_TOOLTIP_WIDTH = 100;
    const EDGE_MARGIN = 8;

    const updatePosition = () => {
      const rect = spanRef.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const clampedX = Math.min(
        Math.max(centerX, HALF_TOOLTIP_WIDTH + EDGE_MARGIN),
        window.innerWidth - HALF_TOOLTIP_WIDTH - EDGE_MARGIN,
      );
      setTooltipPos({ top: rect.top, left: clampedX });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip]);

  const goToOccurrence = (id?: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(false);
    onNavigate?.(id);
  };

  return (
    <span
      ref={spanRef}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onMouseEnter={openTooltip}
      onMouseLeave={scheduleCloseTooltip}
      className={`relative inline-block rounded-sm px-1 font-semibold leading-5 outline-none ${meta.bgClass} ${meta.textClass} ${meta.shadow} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {children}

      {showTooltip &&
        tooltipPos &&
        createPortal(
          <span
            className="fixed z-50 -translate-x-1/2 -translate-y-full"
            style={{ top: tooltipPos.top - 10, left: tooltipPos.left }}
          >
            <span
              onMouseEnter={openTooltip}
              onMouseLeave={scheduleCloseTooltip}
              className="flex h-12 items-center gap-3 whitespace-nowrap rounded-xl bg-[color:var(--color-white)] px-3 shadow-[0px_6px_20px_0px_rgba(30,41,59,0.18)] outline outline-1 outline-offset-[-1px] outline-slate-500/10"
            >
              <button
                type="button"
                aria-label="같은 단어의 이전 위치로 이동"
                disabled={!prevId}
                onClick={goToOccurrence(prevId)}
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition ${
                  prevId
                    ? `${meta.textClass} hover:opacity-60`
                    : "cursor-default text-slate-300"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className={`text-lg font-bold font-['Pretendard'] leading-4 ${meta.textClass}`}>
                {tooltip!.pronunciation}
              </span>
              <button
                type="button"
                aria-label="같은 단어의 다음 위치로 이동"
                disabled={!nextId}
                onClick={goToOccurrence(nextId)}
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition ${
                  nextId
                    ? `${meta.textClass} hover:opacity-60`
                    : "cursor-default text-slate-300"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </span>
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
          </span>,
          document.body,
        )}
    </span>
  );
};

const TypeBadge = ({ type }: { type: HighlightType }) => {
  const meta = HIGHLIGHT_META[type];
  return (
    <span
      className={`flex w-20 shrink-0 items-center justify-center rounded-lg py-3 text-sm font-bold font-['Pretendard'] leading-4 sm:w-24 sm:text-base ${meta.bgClass} ${meta.textClass} ${meta.shadow}`}
    >
      {meta.shortLabel}
    </span>
  );
};

const WordListCard = ({
  entry,
  isFocused,
  onClick,
}: {
  entry: WordEntry;
  isFocused: boolean;
  onClick: () => void;
}) => {
  const meta = HIGHLIGHT_META[entry.type];
  return (
    <button
      type="button"
      id={`word-${entry.id}`}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition-colors sm:gap-4 sm:px-6 sm:py-4 ${
        isFocused ? "bg-slate-100" : "bg-[color:var(--color-white)]"
      }`}
    >
      <TypeBadge type={entry.type} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="break-keep [overflow-wrap:anywhere] text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
            {entry.word}
          </span>
          <ArrowIcon
            size={16}
            className="shrink-0 text-[color:var(--color-text-body)]"
          />
          <span
            className={`break-keep [overflow-wrap:anywhere] text-lg font-bold font-['Pretendard'] leading-5 ${meta.textClass}`}
          >
            {entry.pronunciation}
          </span>
        </div>
        <p className="text-sm font-medium font-['Pretendard'] leading-5 text-[color:var(--color-text-body)]">
          {entry.description}
        </p>
      </div>
    </button>
  );
};

const getScoreFeedback = (value: number) => {
  if (value >= 90) {
    return {
      message: "완벽해요! 🎉",
      detail: "발음이 아주 정확하고 자연스러워요.\n지금처럼만 유지하면 돼요!",
    };
  }
  if (value >= 75) {
    return {
      message: "훌륭해요! 👏",
      detail:
        "전반적으로 안정적인 발표에요.\n장단음에 대한 부분만 좀 더 연습하면\n더 완벽한 발표를 할 수 있을 것 같아요!",
    };
  }
  if (value >= 50) {
    return {
      message: "좋아요, 조금만 더! 💪",
      detail: "기본기는 탄탄해요.\n하이라이트된 단어들 위주로 반복 연습해보세요.",
    };
  }
  return {
    message: "연습이 더 필요해요 🙂",
    detail: "하이라이트된 단어들을 천천히 다시 들어보면서\n발음을 교정해보세요.",
  };
};

/**
 * 발음 종합 점수 도넛 차트.
 * mount(또는 score 변경) 시 0%에서 목표 점수까지 시계방향으로 채워지는 애니메이션.
 */
const ScoreDonut = ({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setAnimatedScore(0);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimatedScore(score));
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const SIZE = 112;
  const STROKE = 9;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedScore / 100);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
      <defs>
        <linearGradient id="scoreDonutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-brand-light)" />
          <stop offset="100%" stopColor="var(--color-brand-primary)" />
        </linearGradient>
      </defs>
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-slate-500/15"
        strokeWidth={STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke="url(#scoreDonutGradient)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </svg>
  );
};

/**
 * "AI 대본 듣기"의 목소리 선택 드롭다운. (UI만 — 선택해도 실제 재생되는 소리는 없다.)
 * 커스텀 드롭다운이라 바깥을 클릭하면 닫히도록 별도 처리한다.
 */
const VoiceSelectDropdown = ({
  voices,
  selectedId,
  onSelect,
}: {
  voices: VoiceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = voices.find((voice) => voice.id === selectedId) ?? voices[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[color:var(--color-white)] px-3 py-2 text-sm font-semibold font-['Pretendard'] text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition hover:bg-slate-50"
      >
        <AudioLines size={16} className="shrink-0 text-[color:var(--color-brand-primary)]" />
        {selected.name} · {selected.style}
        <ChevronDown
          size={16}
          className={`shrink-0 text-[color:var(--color-text-body)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden rounded-xl bg-[color:var(--color-white)] py-1.5 shadow-[0px_6px_20px_0px_rgba(30,41,59,0.18)] outline outline-1 outline-offset-[-1px] outline-slate-500/10">
          {voices.map((voice) => {
            const isSelected = voice.id === selectedId;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => {
                  onSelect(voice.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-['Pretendard'] transition ${
                  isSelected ? "bg-[color:var(--color-brand-primary)]/5" : "hover:bg-slate-50"
                }`}
              >
                <AudioLines size={16} className="shrink-0 text-[color:var(--color-brand-primary)]" />
                <span className="flex-1 font-semibold text-[color:var(--color-text-heading)]">
                  {voice.name} · {voice.style}
                </span>
                {isSelected ? (
                  <Check size={16} className="shrink-0 text-[color:var(--color-brand-primary)]" />
                ) : (
                  <span className="shrink-0 text-xs font-medium text-[color:var(--color-text-body)]">
                    {voice.gender}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * "AI 대본 듣기"의 배속 조절 스테퍼. SPEED_OPTIONS 배열 안에서만 +/- 로 이동한다. (UI만.)
 */
const SpeedStepper = ({
  speed,
  onChange,
}: {
  speed: number;
  onChange: (value: number) => void;
}) => {
  const index = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number]);
  const canDecrease = index > 0;
  const canIncrease = index >= 0 && index < SPEED_OPTIONS.length - 1;

  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm font-medium font-['Pretendard'] text-[color:var(--color-text-body)]">
        느리게
      </span>
      <button
        type="button"
        disabled={!canDecrease}
        onClick={() => canDecrease && onChange(SPEED_OPTIONS[index - 1])}
        aria-label="재생 속도 느리게"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 shrink-0 text-center text-sm font-bold font-['Pretendard'] text-[color:var(--color-text-heading)]">
        {speed}
      </span>
      <button
        type="button"
        disabled={!canIncrease}
        onClick={() => canIncrease && onChange(SPEED_OPTIONS[index + 1])}
        aria-label="재생 속도 빠르게"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
      <span className="whitespace-nowrap text-sm font-medium font-['Pretendard'] text-[color:var(--color-text-body)]">
        빠르게
      </span>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   메인 페이지
   ──────────────────────────────────────────────────────────── */

type TabKey = "viewer" | "words";
type WordFilter = "all" | HighlightType;

const CoachViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("viewer");
  const [wordFilter, setWordFilter] = useState<WordFilter>("all");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const clearFocusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tabButtonRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    viewer: null,
    words: null,
  });
  const [tabUnderline, setTabUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateUnderline = () => {
      const el = tabButtonRefs.current[activeTab];
      if (!el) return;
      setTabUnderline({ left: el.offsetLeft, width: el.offsetWidth });
    };
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeTab]);

  const [presentationData, setPresentationData] = useState<CustomPresentationResult | null>(
    null,
  );

  // 실시간 평가는 이 페이지 안에서 로딩하지 않고 /feedback-loading으로 이동해서
  // 실제 평가 요청을 진행한 뒤, 끝나면 evaluationResult를 들고 이 페이지로 되돌아온다.
  const [evalStatus, setEvalStatus] = useState<"idle" | "done" | "error">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluatedFile, setEvaluatedFile] = useState<File | null>(null);
  const lastRecordingRef = useRef<{ blob: Blob; durationSeconds: number } | null>(null);

  // ── AI 대본 듣기 UI 상태 (실제 소리 재생 로직은 없음 — 선택 상태만 들고 있는다) ──
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[2].id);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    const state = location.state as
      | {
          evaluationResult?: EvaluationResult;
          file?: File;
          presentation?: CustomPresentationResult;
        }
      | null
      | undefined;

    if (state?.presentation) {
      setPresentationData(state.presentation);
    }

    if (state?.evaluationResult) {
      setEvaluationResult(state.evaluationResult);
      setEvaluatedFile(state.file ?? null);
      setScore(state.evaluationResult.totalScore);
      setEvalStatus("done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { scriptParagraphs, wordEntries: derivedWordEntries } = useMemo(() => {
    if (presentationData?.scripts && presentationData.scripts.length > 0) {
      const sortedScripts = [...presentationData.scripts].sort(
        (a, b) => a.slideId - b.slideId,
      );
      return {
        scriptParagraphs: sortedScripts.flatMap((script) => contentToParagraphs(script)),
        wordEntries: contentToWordEntries(sortedScripts),
      };
    }
    return { scriptParagraphs: MOCK_SCRIPT_PARAGRAPHS, wordEntries: MOCK_WORD_ENTRIES };
  }, [presentationData]);

  const wordEntryById = useMemo(() => buildWordEntryById(derivedWordEntries), [derivedWordEntries]);
  const uniqueWordEntries = useMemo(
    () => buildUniqueWordEntries(derivedWordEntries),
    [derivedWordEntries],
  );
  const occurrenceIdsByWord = useMemo(
    () => buildOccurrenceIdsByWord(scriptParagraphs),
    [scriptParagraphs],
  );
  const highlightSummary = useMemo(
    () => buildHighlightSummary(derivedWordEntries),
    [derivedWordEntries],
  );

  // ⚠️ 다운로드는 다른 팀원이 맡은 부분이라 여기서는 손대지 않는다.
  const handleDownload = () => {};

  // "파일로 평가받기"는 이 페이지에 로드된 실제 대본을 기준으로 비교 평가해야 해서,
  // scriptId를 들고 FeedbackFileUploadPage로 넘겨준다. (presentationData가 없는 경우
  // — 목데이터로 대체된 상태 — 에는 임시 하드코딩 151로 폴백한다.)
  const handleFileEvaluation = () => {
    const scriptId = presentationData?.scripts[0]?.scriptId ?? 151;
    navigate("/feedback-fileupload", { state: { scriptId } });
  };

  // "실시간 평가받기"를 누르면 이 페이지 안에서 로딩을 보여주지 않고, 실제 평가 요청을
  // /feedback-loading 페이지로 넘겨서 진행한다. 로딩이 끝나면 그 페이지가 evaluationResult를
  // 들고 nextPath("/coach-view")로 다시 이 페이지에 돌아온다 (위쪽 useEffect가 받아서 채운다).
  const handleRealtimeEvaluation = () => {
    const recording = lastRecordingRef.current;
    if (!recording) {
      setEvalStatus("error");
      setEvalError("먼저 대본을 녹음한 뒤 평가를 요청해주세요.");
      return;
    }

    const userId = useAuthStore.getState().user?.userId;
    if (!userId) {
      setEvalStatus("error");
      setEvalError("로그인이 필요합니다. 다시 로그인한 뒤 시도해주세요.");
      return;
    }

    setEvalError(null);

    const file = new File(
      [recording.blob],
      "realtime-recording.webm",
      { type: recording.blob.type || "audio/webm" },
    );

    // presentationData가 있으면(실제 업로드/생성된 대본으로 들어온 경우) 그 대본의 진짜
    // scriptId를 쓴다. 여러 슬라이드(scripts)가 있을 수 있는데, 지금 화면은 한 화면에
    // 다 이어붙여 보여주고 있어서 일단 첫 번째 scriptId를 쓴다. presentationData가 없는
    // 경우(직접 URL 진입 등)에는 FeedbackFileUploadPage와 동일한 임시 하드코딩(151)으로 폴백한다.
    const scriptId = presentationData?.scripts[0]?.scriptId ?? 151;

    // presentation도 같이 실어 보내서, 평가가 끝나고 이 페이지로 되돌아왔을 때 대본이
    // 목데이터로 리셋되지 않게 한다. (FeedbackLoading이 그대로 되돌려준다.)
    navigate("/feedback-loading", {
      state: {
        userId,
        scriptId,
        file,
        nextPath: "/coach-view",
        presentation: presentationData,
      },
    });
  };

  const handleViewDetailedAnalysis = () => {
    navigate("/feedback-result", {
      state: { evaluationResult, file: evaluatedFile ?? undefined },
    });
  };

  const handleRecordingComplete = (
    audioBlob: Blob,
    durationSeconds: number,
  ) => {
    lastRecordingRef.current = { blob: audioBlob, durationSeconds };
    setEvalStatus("idle");
    setEvalError(null);
    setScore(null);
    setEvaluationResult(null);
    setEvaluatedFile(null);
  };

  const focusHighlight = (id: string, targetTab: TabKey) => {
    setActiveTab(targetTab);
    setFocusedId(id);
    if (clearFocusTimer.current) clearTimeout(clearFocusTimer.current);
    clearFocusTimer.current = setTimeout(() => setFocusedId(null), 2000);
  };

  // 단어 목록 카드 / 대본 뷰어의 하이라이트 단어를 클릭하면 포커스만 이동한다.
  // ⚠️ 예전에는 여기서 speakWord(word)로 실제 소리를 재생했지만, 지금은 "AI 대본 듣기"의
  // 실제 재생 로직 자체를 뺐기 때문에 포커스 이동만 남아있다.
  const handleHighlightClick = (id: string, targetTab: TabKey) => {
    focusHighlight(id, targetTab);
  };

  useEffect(() => {
    if (!focusedId) return;
    const targetId =
      activeTab === "viewer" ? `script-${focusedId}` : `word-${focusedId}`;
    const raf = requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [activeTab, focusedId]);

  useEffect(() => {
    return () => {
      if (clearFocusTimer.current) clearTimeout(clearFocusTimer.current);
    };
  }, []);

  const filteredWordEntries =
    wordFilter === "all"
      ? uniqueWordEntries
      : uniqueWordEntries.filter((w) => w.type === wordFilter);

  const summarySidebar = (
    <aside
      className={`flex ${PANEL_HEIGHT_CLASS} min-h-0 flex-col gap-4 overflow-y-auto rounded-[20px] bg-[color:var(--color-white)] px-4 py-5 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 sm:px-6 sm:py-6`}
    >
      {evalStatus !== "idle" && (
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
              발음 종합 점수
            </h3>
            {evalStatus === "done" && (
              <button
                type="button"
                onClick={handleViewDetailedAnalysis}
                className="flex items-center gap-1 text-sm font-medium font-['Pretendard'] text-[color:var(--color-brand-primary)] transition hover:opacity-80"
              >
                상세 분석 보기
                <ArrowIcon size={16} />
              </button>
            )}
          </div>

          {evalStatus === "error" && evalError && (
            <p className="pl-1 text-sm font-medium font-['Pretendard'] text-red-500">{evalError}</p>
          )}

          {evalStatus === "done" && score !== null && (
            <div className="flex flex-col items-center gap-2 py-2 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
              <div className="relative flex shrink-0 items-center justify-center">
                <ScoreDonut score={score} />
                <div className="absolute flex flex-col items-center">
                  <span className="text-center">
                    <span className="text-2xl font-semibold font-['Pretendard'] text-[color:var(--color-brand-primary)]">
                      {score}
                    </span>
                    <span className="text-lg font-semibold font-['Pretendard'] text-[color:var(--color-brand-primary)]">
                      점
                    </span>
                  </span>
                  <span className="text-xs font-medium font-['Pretendard'] text-[color:var(--color-text-body)]">
                    /100
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-lg font-semibold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
                  {getScoreFeedback(score).message}
                </p>
                <p className="whitespace-pre-line text-sm font-medium font-['Pretendard'] leading-6 text-[color:var(--color-text-body)]">
                  {getScoreFeedback(score).detail}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 하이라이트 요약 — 색상 배지(라벨) + 개수를 카드 안에 세로로 쌓은 3열 그리드 */}
      <div className="flex flex-col gap-4">
        <h3 className="pl-1 text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
          하이라이트 요약
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {highlightSummary.map(({ type, count }) => {
            const meta = HIGHLIGHT_META[type];
            return (
              <button
                type="button"
                key={type}
                onClick={() => {
                  setActiveTab("words");
                  setWordFilter(type);
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[color:var(--color-white)] px-2 py-3 text-center shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition hover:bg-slate-50"
              >
                <span
                  className={`inline-flex items-center justify-center rounded-sm px-2 py-1 text-xs font-bold font-['Pretendard'] leading-4 sm:text-sm ${meta.bgClass} ${meta.textClass} ${meta.shadow}`}
                >
                  {meta.shortLabel}
                </span>
                <span className="text-xl font-bold font-['Pretendard'] leading-6 text-[color:var(--color-text-heading)]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 발표 팁 — 팁마다 다른 색의 둥근 사각 아이콘 박스 */}
      <div className="flex flex-col gap-4">
        <h3 className="pl-1 text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
          발표 팁
        </h3>
        <div className="flex flex-col gap-2.5">
          {pronunciationTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div key={tip.title} className="flex items-start gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-brand-primary)]/10 text-[color:var(--color-brand-primary)]">
                  <Icon size={16} />
                </div>
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-sm font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
                    {tip.title}
                  </span>
                  <span className="text-sm font-medium font-['Pretendard'] leading-5 text-[color:var(--color-text-body)]">
                    {tip.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleRealtimeEvaluation}
        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)] py-2.5 text-sm font-bold font-['Pretendard'] text-[color:var(--color-white)] transition hover:opacity-90"
      >
        <CheckCircle2 size={18} />
        실시간 평가받기
      </button>
    </aside>
  );

  return (
    <div
      className="flex min-h-screen w-full flex-col overflow-visible px-4 py-6 sm:px-6 sm:py-8 xl:h-screen xl:overflow-hidden xl:px-12 xl:py-10"
      style={{
        backgroundImage: `url(${ViewPageBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <style>{`
        @keyframes wordCardSlideIn {
          from {
            opacity: 0;
            transform: translateX(-28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div className="mt-16 flex flex-col gap-4 rounded-xl bg-[color:var(--color-white)] px-4 py-3 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 sm:px-6 sm:py-2 sm:flex-row sm:items-center sm:justify-between md:mt-20">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <h2 className="text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)] sm:text-xl">
            하이라이트 범례
          </h2>
          <div className="hidden h-5 w-0 outline outline-1 outline-offset-[-0.5px] outline-slate-500/20 sm:block" />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LegendBadge type="duration" />
            <LegendBadge type="liaison" />
            <LegendBadge type="mismatch" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <TaskChip
            icon={Volume2}
            label="파일로 평가받기"
            onClick={handleFileEvaluation}
          />
          <TaskChip icon={Download} label="다운로드" onClick={handleDownload} />
        </div>
      </div>

      <div className="relative mt-6 flex border-b border-slate-500/25">
        {(
          [
            { id: "viewer", label: "대본 뷰어" },
            { id: "words", label: "단어 목록" },
          ] as { id: TabKey; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabButtonRefs.current[tab.id] = el;
            }}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-lg transition-colors duration-300 sm:px-6 sm:text-xl ${activeTab === tab.id ? "font-semibold text-[color:var(--color-brand-primary)]" : "font-medium text-[color:var(--color-text-body)]"}`}
          >
            {tab.label}
          </button>
        ))}
        <span
          className="absolute -bottom-px h-0.5 bg-[color:var(--color-brand-primary)] transition-all duration-300 ease-out"
          style={{ left: tabUnderline.left, width: tabUnderline.width }}
        />
      </div>

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1fr_440px]">
        {activeTab === "viewer" ? (
          <section
            className={`flex ${PANEL_HEIGHT_CLASS} min-h-0 flex-col gap-3 rounded-[20px] bg-[color:var(--color-white)] px-4 py-5 sm:px-6 sm:py-7`}
          >
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 pl-1">
              <h3 className="break-keep text-base font-bold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)] sm:text-lg">
                전체 대본_하이라이트 적용
              </h3>
              <div className="shrink-0 -my-2">
                <MainChip
                  text="AI 생성"
                  scale={0.7}
                  className="whitespace-nowrap"
                />
              </div>
            </div>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />

            {/* AI 대본 듣기 — UI만 남아있고, 실제 소리 재생 로직은 없다 */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-[color:var(--color-white)] px-4 py-3 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 sm:px-5">
              <div className="flex items-center gap-1.5">
                <AudioLines size={18} className="shrink-0 text-[color:var(--color-brand-primary)]" />
                <span className="whitespace-nowrap text-base font-bold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)]">
                  AI 대본 듣기
                </span>
                <Info size={14} className="shrink-0 text-[color:var(--color-text-body)]" />
                <span className="hidden whitespace-nowrap text-xs font-medium font-['Pretendard'] text-[color:var(--color-text-body)] md:inline">
                  하이라이팅을 클릭하면 설정된 옵션으로 들을 수 있어요
                </span>
              </div>

              <div className="hidden h-5 w-px bg-slate-500/20 sm:block" />

              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm font-medium font-['Pretendard'] text-[color:var(--color-text-heading)]">
                  목소리
                </span>
                <VoiceSelectDropdown
                  voices={VOICE_OPTIONS}
                  selectedId={selectedVoiceId}
                  onSelect={setSelectedVoiceId}
                />
              </div>

              <div className="hidden h-5 w-px bg-slate-500/20 sm:block" />

              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm font-medium font-['Pretendard'] text-[color:var(--color-text-heading)]">
                  속도
                </span>
                <SpeedStepper speed={playbackSpeed} onChange={setPlaybackSpeed} />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-[color:var(--color-white)] p-4 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 sm:p-6">

              <div className="flex max-w-7xl flex-col gap-5 text-base font-semibold font-['Pretendard'] leading-8 text-[color:var(--color-text-heading)]">
                {scriptParagraphs.map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.map((segment, sIdx) => {
                      if (!(segment.highlight && segment.id)) {
                        // 문단 내부에 남아있는 단일 개행("\n")을 <br/>로 바꿔서, 원문에
                        // 있던 문장 단위 줄바꿈이 화면에도 그대로 보이게 한다.
                        const lines = segment.text.split("\n");
                        return (
                          <span key={sIdx}>
                            {lines.map((line, lIdx) => (
                              <Fragment key={lIdx}>
                                {lIdx > 0 && <br />}
                                {line}
                              </Fragment>
                            ))}
                          </span>
                        );
                      }
                      const occIds = occurrenceIdsByWord.get(segment.text) ?? [];
                      const occIndex = occIds.indexOf(segment.id);
                      const prevId = occIndex > 0 ? occIds[occIndex - 1] : undefined;
                      const nextId =
                        occIndex >= 0 && occIndex < occIds.length - 1
                          ? occIds[occIndex + 1]
                          : undefined;
                      return (
                        <span key={sIdx} id={`script-${segment.id}`}>
                          <HighlightSpan
                            type={segment.highlight}
                            isFocused={focusedId === segment.id}
                            prevId={prevId}
                            nextId={nextId}
                            onNavigate={(id) => focusHighlight(id, "viewer")}
                            tooltip={
                              wordEntryById.get(segment.id)
                                ? {
                                    word: wordEntryById.get(segment.id)!.word,
                                    pronunciation: wordEntryById.get(segment.id)!
                                      .pronunciation,
                                  }
                                : undefined
                            }
                          >
                            {segment.text}
                          </HighlightSpan>
                        </span>
                      );
                    })}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section
            className={`flex ${PANEL_HEIGHT_CLASS} min-h-0 flex-col gap-4 rounded-[20px] bg-[color:var(--color-white)] px-4 py-5 sm:px-6 sm:py-7`}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setWordFilter("all")}
                className={`rounded-full px-5 py-2.5 text-base font-semibold font-['Pretendard'] leading-4 transition ${wordFilter === "all" ? "bg-gradient-to-r from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)] text-[color:var(--color-white)]" : "bg-[color:var(--color-white)] text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"}`}
              >
                전체
              </button>
              {(["duration", "liaison", "mismatch"] as HighlightType[]).map(
                (type) => {
                  const meta = HIGHLIGHT_META[type];
                  const count =
                    highlightSummary.find((s) => s.type === type)?.count ?? 0;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWordFilter(type)}
                      className={`rounded-full px-5 py-2.5 text-base font-semibold font-['Pretendard'] leading-4 transition ${wordFilter === type ? "bg-gradient-to-r from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)] text-[color:var(--color-white)]" : "bg-[color:var(--color-white)] text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"}`}
                    >
                      {meta.shortLabel} ({count})
                    </button>

                  );
                },
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-4">
                {filteredWordEntries.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-2xl bg-[color:var(--color-white)] text-sm font-medium text-[color:var(--color-text-body)] shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
                    해당하는 단어가 없습니다.
                  </div>
                ) : (
                  filteredWordEntries.map((entry, idx) => {
                    const topOccurrenceId = occurrenceIdsByWord.get(entry.word)?.[0] ?? entry.id;
                    return (
                      <div
                        key={`${entry.id}-${idx}`}
                        style={{
                          animation:
                            "wordCardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                          animationDelay: `${idx * 100}ms`,
                        }}
                      >
                        <WordListCard
                          entry={entry}
                          isFocused={focusedId === topOccurrenceId}
                          onClick={() => handleHighlightClick(topOccurrenceId, "viewer")}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {summarySidebar}
      </div>
    </div>
  );
};

export default CoachViewPage;
