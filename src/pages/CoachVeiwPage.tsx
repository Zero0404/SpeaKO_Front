import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Download,
  ChevronRight,
  ChevronRight as ArrowIcon,
} from "lucide-react";
import ViewPageBackground from "../assets/background_gradiant.svg";
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

const highlightSummary: { type: HighlightType; count: number }[] = (
  ["duration", "liaison", "mismatch"] as HighlightType[]
).map((type) => ({
  type,
  count: wordEntries.filter((w) => w.type === type).length,
}));

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
  children,
}: {
  type: HighlightType;
  isFocused?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  const meta = HIGHLIGHT_META[type];
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={`rounded-sm px-1 font-semibold transition-shadow ${meta.bgClass} ${meta.textClass} ${meta.shadow} ${onClick ? "cursor-pointer" : ""} ${isFocused ? "ring-2 ring-offset-2 ring-current" : ""}`}
    >
      {children}
    </span>
  );
};

const TypeBadge = ({ type }: { type: HighlightType }) => {
  const meta = HIGHLIGHT_META[type];
  return (
    <span
      className={`flex w-24 shrink-0 items-center justify-center rounded-lg py-2 text-base font-bold font-['Pretendard'] leading-4 ${meta.bgClass} ${meta.textClass}`}
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
      className={`flex w-full items-start gap-4 rounded-2xl bg-[color:var(--color-white)] px-6 py-4 text-left shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition ${isFocused ? "ring-2 ring-[color:var(--color-brand-primary)] ring-offset-2" : ""}`}
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

/* ────────────────────────────────────────────────────────────
   메인 페이지
   ──────────────────────────────────────────────────────────── */

type TabKey = "viewer" | "words";
type WordFilter = "all" | HighlightType;

const CoachViewPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("viewer");
  const [wordFilter, setWordFilter] = useState<WordFilter>("all");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const clearFocusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCheckScript = () => {};
  const handleDownload = () => {};
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
      ? wordEntries
      : wordEntries.filter((w) => w.type === wordFilter);

  return (
    <div
      className="min-h-screen w-full px-6 py-8 lg:px-12 lg:py-10"
      style={{
        backgroundImage: `url(${ViewPageBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col gap-4 rounded-xl bg-[color:var(--color-white)] px-6 py-4 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-5">
          <h2 className="text-xl font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
            하이라이트 범례
          </h2>
          <div className="hidden h-5 w-0 outline outline-1 outline-offset-[-0.5px] outline-slate-500/20 sm:block" />
          <div className="flex flex-wrap items-center gap-3">
            <LegendBadge type="duration" />
            <LegendBadge type="liaison" />
            <LegendBadge type="mismatch" />
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            className={`relative px-6 py-3 text-xl transition-colors duration-300 ${activeTab === tab.id ? "font-semibold text-[color:var(--color-brand-primary)]" : "font-medium text-[color:var(--color-text-body)]"}`}
          >
            {tab.label}
          </button>
        ))}
        <span
          className={`absolute -bottom-px h-0.5 bg-[color:var(--color-brand-primary)] transition-all duration-300 ease-out ${activeTab === "viewer" ? "left-0 w-[124px]" : "left-[124px] w-[124px]"}`}
        />
      </div>

      {activeTab === "viewer" ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="flex flex-col gap-3 rounded-[20px] bg-[color:var(--color-white)] px-6 py-7">
            <div className="flex items-center gap-1 pl-1">
              <h3 className="text-lg font-bold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)]">
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
            <div className="max-h-[560px] flex-1 overflow-y-auto rounded-xl bg-[color:var(--color-white)] p-6 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
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
          <aside className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 rounded-[20px] bg-[color:var(--color-white)] px-6 py-10 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
              <div className="flex items-center justify-between pl-1">
                <h3 className="text-xl font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
                  발음 종합 점수
                </h3>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-base font-medium font-['Pretendard'] leading-4 text-[color:var(--color-brand-primary)]"
                >
                  상세 분석 보기
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-500/25 text-sm font-medium text-[color:var(--color-text-body)]">
                점수 위젯 준비 중
              </div>
            </div>
            <div className="flex flex-col gap-6 rounded-[20px] bg-[color:var(--color-white)] px-6 py-10 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
              <h3 className="pl-1 text-xl font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
                하이라이트 요약
              </h3>
              <div className="flex flex-col gap-4">
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
                      className="flex h-11 items-center justify-between rounded-lg px-4 py-2 text-left shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 transition hover:bg-slate-50"
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
          </aside>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
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
          <div className="flex flex-col gap-4">
            {filteredWordEntries.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-2xl bg-[color:var(--color-white)] text-sm font-medium text-[color:var(--color-text-body)] shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
                해당하는 단어가 없습니다.
              </div>
            ) : (
              filteredWordEntries.map((entry, idx) => (
                <WordListCard
                  key={`${entry.id}-${idx}`}
                  entry={entry}
                  isFocused={focusedId === entry.id}
                  onClick={() => focusHighlight(entry.id, "viewer")}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachViewPage;
