import { useState } from "react";
import { FileText, Download, ChevronRight } from "lucide-react";
import MainChip from "../components/MainChip";
import VoiceRecorder from "../components/VoiceRecorder";
import TaskChip from "../components/TaskChip";

/* ────────────────────────────────────────────────────────────
   타입 정의
   ──────────────────────────────────────────────────────────── */

type HighlightType = "duration" | "liaison" | "mismatch";

interface ScriptSegment {
  text: string;
  highlight?: HighlightType;
}

type ScriptParagraph = ScriptSegment[];

const HIGHLIGHT_META: Record<
  HighlightType,
  { label: string; textClass: string; bgClass: string; shadow: string }
> = {
  duration: {
    label: "장단음",
    textClass: "text-pink-500",
    bgClass: "bg-pink-500/10",
    shadow: "shadow-[inset_0px_-2px_0px_0px_rgba(247,53,142,1)]",
  },
  liaison: {
    label: "연음",
    textClass: "text-blue-600",
    bgClass: "bg-blue-600/10",
    shadow: "shadow-[inset_0px_-2px_0px_0px_rgba(0,114,242,1)]",
  },
  mismatch: {
    label: "표기-발음 불일치",
    textClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    shadow: "shadow-[inset_0px_-2px_0px_0px_rgba(247,147,34,1)]",
  },
};

/* ────────────────────────────────────────────────────────────
   더미 데이터 (실제로는 업로드된 대본 + 분석 결과로 대체)
   ──────────────────────────────────────────────────────────── */

const scriptParagraphs: ScriptParagraph[] = [
  [{ text: "안녕하세요, 여러분!" }],
  [{ text: "오늘 저희는 특별한 주제로 여러분께 소개드리고자 이 자리에 섰습니다." }],
  [
    {
      text: "지금부터 보여드릴 내용은 다소 난해하게 느껴질 수도 있지만, 흥미로운 점들이 많이 담겨 있으니 끝까지 함께 해주시길 바랍니다.",
    },
  ],
  [
    { text: "먼저 첫 번째 슬라이드를 통해 기본적인 " },
    { text: "구성", highlight: "duration" },
    { text: " 요소를 알아보도록 하겠습니다." },
  ],
  [
    {
      text: "여기에는 다양한 기호와 문자들이 조합되어 있는데요, 이는 저희 주제에서 자주 등장하는 심벌들입니다. 이 심벌들은 각각의 의미를 가지고 있으며, 앞으로의 설명에서도 반복해서 등장할 것 입니다.",
    },
  ],
  [
    { text: "특정", highlight: "mismatch" },
    { text: " 기호나 숫자들은 특정한 개념이나 방향을 나타내고 있습니다." },
  ],
  [
    { text: "다음 두 번째 슬라이드로 넘어가면, " },
    { text: "조금", highlight: "duration" },
    { text: " 더 복잡한 형태의 패턴이 나타나고 있습니다." },
  ],
  [
    { text: "이 패턴들은 단순한 " },
    { text: "배열", highlight: "duration" },
    { text: " 이상의 의미를 가지며, 서로 다른 요소들이 어떻게 연결되고 상호작용하는지 보여줍니다." },
  ],
  [
    {
      text: "이러한 패턴을 이해함으로써, 전체적인 구조와 원리를 파악하는데 큰 도움이 될 것 입니다.",
    },
  ],
  [{ text: "...(하이라이팅이 적용된 대본이 들어갑니다)" }],
];

const highlightSummary: { type: HighlightType; count: number }[] = [
  { type: "duration", count: 6 },
  { type: "liaison", count: 1 },
  { type: "mismatch", count: 3 },
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
  children,
}: {
  type: HighlightType;
  children: React.ReactNode;
}) => {
  const meta = HIGHLIGHT_META[type];
  return (
    <span
      className={`rounded-sm px-1 font-semibold ${meta.bgClass} ${meta.textClass} ${meta.shadow}`}
    >
      {children}
    </span>
  );
};

/* ────────────────────────────────────────────────────────────
   메인 페이지
   ──────────────────────────────────────────────────────────── */

type TabKey = "viewer" | "words";

const CoachViewPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("viewer");

  // TaskChip에 주입할 역할(동작)들 - 실제 로직은 추후 연결
  const handleCheckScript = () => {
    // TODO: 원본 대본 확인 모달/페이지 열기
  };

  const handleDownload = () => {
    // TODO: 분석 결과 리포트 다운로드
  };

  const handleRecordingComplete = (audioBlob: Blob, durationSeconds: number) => {
    // TODO: 녹음된 오디오를 발음 분석 API로 전송
    console.log("recording complete", audioBlob, durationSeconds);
  };

  return (
    <div className="min-h-screen w-full bg-[color:var(--color-white)] px-6 py-8 lg:px-12 lg:py-10">
      {/* 하이라이트 범례 타이틀 바 */}
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
          <TaskChip icon={FileText} label="대본 확인" onClick={handleCheckScript} />
          <TaskChip icon={Download} label="다운로드" onClick={handleDownload} />
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="relative mt-6 flex gap-2 border-b border-slate-500/25">
        <button
          type="button"
          onClick={() => setActiveTab("viewer")}
          className={`px-4 py-3 text-xl leading-5 font-['Pretendard'] transition ${
            activeTab === "viewer"
              ? "font-semibold text-[color:var(--color-brand-primary)]"
              : "font-medium text-[color:var(--color-text-body)]"
          }`}
        >
          대본 뷰어
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("words")}
          className={`px-4 py-3 text-xl leading-5 font-['Pretendard'] transition ${
            activeTab === "words"
              ? "font-semibold text-[color:var(--color-brand-primary)]"
              : "font-medium text-[color:var(--color-text-body)]"
          }`}
        >
          단어 목록
        </button>
        {/* 활성 탭 밑줄 */}
        <span
          className={`absolute -bottom-px h-0.5 w-36 bg-[color:var(--color-brand-primary)] transition-transform duration-300 ${
            activeTab === "words" ? "translate-x-[144px]" : "translate-x-0"
          }`}
        />
      </div>

      {/* 본문 영역 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {activeTab === "viewer" ? (
          <>
            {/* 왼쪽: 대본 뷰어 */}
            <section className="flex flex-col gap-3 rounded-[20px] bg-[color:var(--color-white)] px-6 py-7">
              <div className="flex items-center gap-3 pl-1">
                <h3 className="text-lg font-bold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)]">
                  전체 대본_하이라이트 적용
                </h3>
                <div className="-my-2">
                  <MainChip text="AI 생성" scale={0.55} className="whitespace-nowrap" />
                </div>
              </div>

              {/* 음성 녹음 안내 바 */}
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />

              {/* 대본 본문 */}
              <div className="max-h-[560px] flex-1 overflow-y-auto rounded-xl bg-[color:var(--color-white)] p-6 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
                <div className="flex flex-col gap-5 text-base font-semibold font-['Pretendard'] leading-8 text-[color:var(--color-text-heading)]">
                  {scriptParagraphs.map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.map((segment, sIdx) =>
                        segment.highlight ? (
                          <HighlightSpan key={sIdx} type={segment.highlight}>
                            {segment.text}
                          </HighlightSpan>
                        ) : (
                          <span key={sIdx}>{segment.text}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            {/* 오른쪽: 점수 + 요약 */}
            <aside className="flex flex-col gap-6">
              {/* 발음 종합 점수 - 추후 다른 담당자가 구현 예정, 자리만 확보 */}
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

                {/* TODO: 발음 종합 점수 위젯 (다른 담당자 작업 영역) */}
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-500/25 text-sm font-medium text-[color:var(--color-text-body)]">
                  점수 위젯 준비 중
                </div>
              </div>

              {/* 하이라이트 요약 */}
              <div className="flex flex-col gap-6 rounded-[20px] bg-[color:var(--color-white)] px-6 py-10 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
                <h3 className="pl-1 text-xl font-bold font-['Pretendard'] leading-5 text-[color:var(--color-text-heading)]">
                  하이라이트 요약
                </h3>
                <div className="flex flex-col gap-4">
                  {highlightSummary.map(({ type, count }) => {
                    const meta = HIGHLIGHT_META[type];
                    return (
                      <div
                        key={type}
                        className="flex h-11 items-center justify-between rounded-lg px-4 py-2 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${meta.bgClass.replace(
                              "/10",
                              ""
                            )}`}
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </>
        ) : (
          <section className="col-span-full flex h-64 items-center justify-center rounded-[20px] bg-[color:var(--color-white)] text-sm font-medium text-[color:var(--color-text-body)] shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20">
            단어 목록 탭은 준비 중입니다.
          </section>
        )}
      </div>
    </div>
  );
};

export default CoachViewPage;
