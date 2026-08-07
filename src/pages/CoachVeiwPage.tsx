import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Download,
  Volume2,
  AudioLines,
  Ear,
  BarChart3,
  CheckCircle2,
  ChevronRight as ArrowIcon,
} from "lucide-react";
import ViewPageBackground from "../assets/background_gradiant.png";
import MainChip from "../components/MainChip";
import VoiceRecorder from "../components/VoiceRecorder";
import TaskChip from "../components/TaskChip";

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

const scriptParagraphs: ScriptParagraph[] = [
  [{ text: "안녕하세요, 여러분!" }],
  [
    {
      text: "오늘 저희는 특별한 주제로 여러분께 소개드리고자 이 자리에 섰습니다.",
    },
  ],
  [
    {
      text: "지금부터 보여드릴 내용은 다소 난해하게 느껴질 수도 있지만, 흥미로운 점들이 많이 담겨 있으니 끝까지 함께 해주시길 바랍니다.",
    },
  ],
  [
    { text: "먼저 첫 번째 슬라이드를 통해 기본적인 " },
    { id: "hl-guseong", text: "구성", highlight: "duration" },
    { text: " 요소를 알아보도록 하겠습니다." },
  ],
  [
    {
      text: "여기에는 다양한 기호와 문자들이 조합되어 있는데요, 이는 저희 주제에서 자주 등장하는 심벌들입니다. 이 심벌들은 각각의 의미를 가지고 있으며, 앞으로의 설명에서도 반복해서 등장할 것 입니다.",
    },
  ],
  [
    { id: "hl-teukjeong-1", text: "특정", highlight: "mismatch" },
    { text: " 기호나 숫자들은 특정한 개념이나 방향을 나타내고 있습니다." },
  ],
  [
    { text: "다음 두 번째 슬라이드로 넘어가면, " },
    { id: "hl-jogeum", text: "조금", highlight: "duration" },
    { text: " 더 복잡한 형태의 패턴이 나타나고 있습니다." },
  ],
  [
    { text: "이 패턴들은 단순한 " },
    { id: "hl-baeyeol", text: "배열", highlight: "duration" },
    {
      text: " 이상의 의미를 가지며, 서로 다른 요소들이 어떻게 연결되고 상호작용하는지 보여줍니다.",
    },
  ],
  [
    { text: "특히 " },
    { id: "hl-hakgyo", text: "학교", highlight: "mismatch" },
    { text: "에서는 " },
    { id: "hl-daseot", text: "다섯", highlight: "liaison" },
    { text: " 가지 규칙을 " },
    { id: "hl-teukjeong-2", text: "특정", highlight: "mismatch" },
    { text: " 순서로 지켜야 합니다." },
  ],
  [
    {
      text: "이러한 패턴을 이해함으로써, 전체적인 구조와 원리를 파악하는데 큰 도움이 될 것 입니다.",
    },
  ],
  [
    { text: "이 " },
    { id: "hl-segye", text: "세계", highlight: "duration" },
    { text: "에서 벌어지는 " },
    { id: "hl-sago", text: "사고", highlight: "duration" },
    { text: "는 " },
    { id: "hl-botong", text: "보통", highlight: "duration" },
    { text: " 예상보다 빠르게 확산됩니다." },
  ],
  [{ text: "...(하이라이팅이 적용된 대본이 들어갑니다)" }],
];

const wordEntries: WordEntry[] = [
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

// 대본 뷰어 안의 하이라이트 단어에 마우스를 올리면 보여줄 툴팁을 위해
// segment.id -> WordEntry 로 바로 찾을 수 있게 맵으로 만들어둔다.
const wordEntryById = new Map(wordEntries.map((entry) => [entry.id, entry]));

// 단어 목록 카드에는 같은 단어(예: "특정")가 대본에 여러 번 나와도 한 번만 보여준다.
// (대본 뷰어 쪽 하이라이트는 각 등장 위치마다 그대로 다 표시되고, 여기서만 목록용으로 중복 제거)
const uniqueWordEntries: WordEntry[] = (() => {
  const seenWords = new Set<string>();
  const result: WordEntry[] = [];
  for (const entry of wordEntries) {
    if (seenWords.has(entry.word)) continue;
    seenWords.add(entry.word);
    result.push(entry);
  }
  return result;
})();

const highlightSummary: { type: HighlightType; count: number }[] = (
  ["duration", "liaison", "mismatch"] as HighlightType[]
).map((type) => ({
  type,
  count: wordEntries.filter((w) => w.type === type).length,
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
];

// 점수 구간별로 보여줄 한줄 메시지 + 상세 피드백 (실제로는 평가 API 응답으로 교체될 자리)
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
  children,
}: {
  type: HighlightType;
  isFocused?: boolean;
  onClick?: () => void;
  /** 마우스오버 시 보여줄 단어 + 발음 툴팁. 없으면 툴팁 미표시 */
  tooltip?: { word: string; pronunciation: string };
  children: React.ReactNode;
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const meta = HIGHLIGHT_META[type];
  // 포커스(단어 목록에서 넘어왔을 때) 시 배경만 살짝 진하게 + 딸깍 튀어오르는 스케일 효과.
  const focusedBgClass = meta.bgClass.replace("/10", "/30");

  const showTooltip = Boolean(tooltip) && (isHovered || Boolean(isFocused));

  // 대본 박스는 overflow-y-auto라서 툴팁을 그 안에 absolute로 띄우면 화면 가장자리(특히 왼쪽)에
  // 붙은 단어는 잘려서 안 보인다. document.body로 포탈해서 fixed 좌표로 띄우고,
  // 뷰포트 안쪽으로 clamp해서 절대 잘리지 않게 한다.
  useEffect(() => {
    if (!showTooltip || !spanRef.current) {
      setTooltipPos(null);
      return;
    }

    const HALF_TOOLTIP_WIDTH = 90; // 툴팁 최대 예상 너비의 절반 (여유 포함)
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
    // capture: true로 등록해야 중첩된 스크롤 컨테이너(대본 박스)의 스크롤도 감지된다.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip]);

  return (
    <span
      ref={spanRef}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block rounded-sm px-1 font-semibold leading-5 outline-none transition-[transform,background-color] duration-300 ease-out ${
        isFocused ? focusedBgClass : meta.bgClass
      } ${meta.textClass} ${meta.shadow} ${onClick ? "cursor-pointer" : ""} ${
        isFocused ? "scale-110" : "scale-100"
      }`}
    >
      {children}

      {showTooltip &&
        tooltipPos &&
        createPortal(
          <span
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full"
            style={{ top: tooltipPos.top - 8, left: tooltipPos.left }}
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[color:var(--color-white)] px-3 py-2 shadow-[0px_4px_16px_0px_rgba(30,41,59,0.15)] outline outline-1 outline-offset-[-1px] outline-slate-500/10">
              <span className="text-sm font-bold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)]">
                {tooltip!.word}
              </span>
              <ArrowIcon size={12} className="text-[color:var(--color-text-body)]" />
              <span className={`text-sm font-bold font-['Pretendard'] leading-4 ${meta.textClass}`}>
                {tooltip!.pronunciation}
              </span>
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
        isFocused
          ? "bg-slate-100 ring-2 ring-[color:var(--color-brand-primary)] ring-offset-2"
          : "bg-[color:var(--color-white)]"
      }`}
    >
      <TypeBadge type={entry.type} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
            {entry.word}
          </span>
          <ArrowIcon
            size={16}
            className="text-[color:var(--color-text-body)]"
          />
          <span
            className={`text-lg font-bold font-['Pretendard'] leading-5 ${meta.textClass}`}
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

/**
 * 발음 종합 점수 도넛 차트.
 * mount(또는 score 변경) 시 0%에서 목표 점수까지 시계방향으로 채워지는 애니메이션.
 */
const ScoreDonut = ({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // 0으로 리셋한 다음 프레임에 목표 점수로 올려야 transition이 실제로 재생된다.
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
      {/* 배경 트랙 */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-slate-500/15"
        strokeWidth={STROKE}
      />
      {/* 진행률 - 12시 방향에서 시작해서 시계방향으로 채워짐 */}
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

  // FeedbackLoading 페이지에서 평가를 마치고 돌아올 때 navigate(..., { state: { score } })로 점수를 넘겨준다.
  // 그 state가 있으면 처음부터 "done" 상태로 보여주고, 없으면 아직 평가 전(idle)이다.
  // evalStatus/score는 마운트 시 location.state로 한 번 정해지고 그 이후로는 값을 바꾸지 않으므로
  // (다시 바뀌려면 페이지가 새로 마운트돼야 함) setter는 필요 없다 — 남겨두면 "선언했지만 사용 안 함" 빌드 에러가 난다.
  const scoreFromLoadingPage = (location.state as { score?: number } | null)?.score;
  const [evalStatus] = useState<"idle" | "done">(
    typeof scoreFromLoadingPage === "number" ? "done" : "idle",
  );
  const [score] = useState<number | null>(scoreFromLoadingPage ?? null);

  const handleCheckScript = () => {};
  const handleDownload = () => {};

  // "파일로 평가받기" — 파일 업로드로 평가받는 플로우로 이동
  const handleFileEvaluation = () => {
    navigate("/feedback-fileupload");
  };

  // "실시간 평가받기" — 기존 FeedbackLoading 페이지로 이동해서 로딩을 보여주고,
  // 평가가 끝나면 FeedbackLoading이 이 페이지로 다시 navigate(..., { state: { score } })해서 돌아온다.
  const handleRealtimeEvaluation = () => {
    navigate("/feedback-loading");
  };

  // 사이드바의 "상세 분석 보기" — 상세 피드백 페이지로 이동
  const handleViewDetailedAnalysis = () => {
    navigate("/feedback");
  };

  const handleRecordingComplete = (
    audioBlob: Blob,
    durationSeconds: number,
  ) => {
    console.log("recording complete", audioBlob, durationSeconds);
  };

  const focusHighlight = (id: string, targetTab: TabKey) => {
    setActiveTab(targetTab);
    setFocusedId(id);
    if (clearFocusTimer.current) clearTimeout(clearFocusTimer.current);
    clearFocusTimer.current = setTimeout(() => setFocusedId(null), 2000);
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

      <div className="flex flex-col gap-4">
        <h3 className="pl-1 text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
          하이라이트 요약
        </h3>
        <div className="flex flex-col gap-2">
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
                className="flex h-9 items-center justify-between rounded-lg px-3 py-1.5 text-left shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${meta.bgClass.replace("/10", "")}`}
                  />
                  <span
                    className={`text-base font-bold font-['Pretendard'] leading-4 ${meta.textClass}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <span className="text-base font-semibold font-['Pretendard'] leading-6 text-[color:var(--color-text-heading)]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="pl-1 text-lg font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
          발음 팁
        </h3>
        <div className="flex flex-col gap-2.5">
          {pronunciationTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div key={tip.title} className="flex items-start gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-primary)]/10 text-[color:var(--color-brand-primary)]">
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
        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)] py-3.5 text-m font-bold font-['Pretendard'] text-[color:var(--color-white)] transition hover:opacity-90"
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
      {/* 단어 목록 탭 진입 시 카드가 왼쪽에서 순차적으로 튀어 들어오는 stagger 애니메이션 */}
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
          <TaskChip
            icon={FileText}
            label="대본 확인"
            onClick={handleCheckScript}
          />
          <TaskChip icon={Download} label="다운로드" onClick={handleDownload} />
        </div>
      </div>

      <div className="relative mt-6 flex border-b border-slate-500/25">
        {[
          { id: "viewer", label: "대본 뷰어" },
          { id: "words", label: "단어 목록" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabKey)}
            className={`relative px-4 py-3 text-lg transition-colors duration-300 sm:px-6 sm:text-xl ${activeTab === tab.id ? "font-semibold text-[color:var(--color-brand-primary)]" : "font-medium text-[color:var(--color-text-body)]"}`}
          >
            {tab.label}
          </button>
        ))}
        <span
          className={`absolute -bottom-px h-0.5 bg-[color:var(--color-brand-primary)] transition-all duration-300 ease-out ${activeTab === "viewer" ? "left-0 w-[124px]" : "left-[124px] w-[124px]"}`}
        />
      </div>

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1fr_440px]">
        {activeTab === "viewer" ? (
          <section
            className={`flex ${PANEL_HEIGHT_CLASS} min-h-0 flex-col gap-3 rounded-[20px] bg-[color:var(--color-white)] px-4 py-5 sm:px-6 sm:py-7`}
          >
            <div className="flex items-center gap-1 pl-1">
              <h3 className="text-base font-bold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)] sm:text-lg">
                전체 대본_하이라이트 적용
              </h3>
              <div className="-my-2">
                <MainChip
                  text="AI 생성"
                  scale={0.7}
                  className="whitespace-nowrap"
                />
              </div>
            </div>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-[color:var(--color-white)] p-4 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 sm:p-6">
              <div className="flex flex-col gap-5 text-base font-semibold font-['Pretendard'] leading-8 text-[color:var(--color-text-heading)]">
                {scriptParagraphs.map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.map((segment, sIdx) =>
                      segment.highlight && segment.id ? (
                        <span key={sIdx} id={`script-${segment.id}`}>
                          <HighlightSpan
                            type={segment.highlight}
                            isFocused={focusedId === segment.id}
                            onClick={() =>
                              focusHighlight(segment.id as string, "words")
                            }
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
                      ) : (
                        <span key={sIdx}>{segment.text}</span>
                      ),
                    )}
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
                className={`rounded-full px-5 py-2.5 text-base font-semibold font-['Pretendard'] leading-4 transition ${wordFilter === "all" ? "bg-[color:var(--color-brand-primary)] text-[color:var(--color-white)]" : "bg-[color:var(--color-white)] text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"}`}
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
                      className={`rounded-full px-5 py-2.5 text-base font-semibold font-['Pretendard'] leading-4 transition ${wordFilter === type ? "bg-[color:var(--color-brand-primary)] text-[color:var(--color-white)]" : "bg-[color:var(--color-white)] text-[color:var(--color-text-heading)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"}`}
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
                  filteredWordEntries.map((entry, idx) => (
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
                        isFocused={focusedId === entry.id}
                        onClick={() => focusHighlight(entry.id, "viewer")}
                      />
                    </div>
                  ))
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
