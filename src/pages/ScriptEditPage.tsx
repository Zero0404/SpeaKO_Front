import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Volume2,
  ChevronDown,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";
import TaskChip from "../components/TaskChip";
import MainChip from "../components/MainChip";
import { useScriptJobStore } from "../store/scriptJobStore";

interface SlideItem {
  id: string;
  index: number;
  title: string;
  script: string;
}

type RegenMode = "full" | "partial";
type SpeakingStyle = "formal" | "casual";

const PRESENTATION_TIME_OPTIONS = ["5분", "10분", "15분", "20분", "30분"];

const ScriptPanel = ({
  label,
  script,
  onChange,
  dashed = false,
}: {
  label: string;
  script: string;
  onChange: (value: string) => void;
  dashed?: boolean;
}) => (
  <div
    className={`flex flex-1 flex-col gap-3 rounded-2xl
    p-4
    sm:p-5
    lg:p-6
    ${
      dashed
        ? "border-2 border-dashed border-[color:var(--color-brand-primary)]/50 bg-white"
        : "bg-white shadow-sm"
    }`}
  >
    <div className="flex items-center gap-1">
      <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
        {label}
      </p>
      <MainChip
        text="AI 생성"
        className="
        scale-50
        sm:scale-[0.65]
        lg:scale-75
        "
      />
    </div>

    <div className="mb-[2px] h-[34px] w-full overflow-hidden sm:h-[42px] xl:h-[50px]">
      <div className="w-[166.6667%] origin-top-left scale-[0.6] sm:w-[133.3333%] sm:scale-75 xl:w-[111.1111%] xl:scale-90">
        <VoiceRecorder message="녹음 후 직접 들어보며 자연스러운지 확인해보세요." />
      </div>
    </div>

    <textarea
      value={script}
      onChange={(e) => onChange(e.target.value)}
      placeholder="생성된 AI 대본이 들어갑니다."
      className="min-h-[200px] lg:min-h-0 flex-1 resize-none rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-[color:var(--color-text-heading)] outline-none transition focus:border-[color:var(--color-brand-primary)] sm:min-h-[160px]"
    />
  </div>
);

/* ────────────────────────────────────────────────────────────
   서브 컴포넌트: 발표 스타일 카드
   ──────────────────────────────────────────────────────────── */

const StyleCard = ({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={active ? undefined : { border: "1px solid rgba(128, 136, 146, 1)" }}
    className={`flex h-auto min-h-[110px] w-full flex-col items-center justify-center gap-2 rounded-[16px] p-3 text-center transition-all sm:min-h-[130px] ${
      active
        ? "border border-[#5b6cfb] bg-[#EEF2FF] shadow-sm"
        : "bg-white hover:border-slate-400"
    }`}
  >
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(159, 160, 253, 0.25)" }}
    >
      <span style={{ color: "rgba(91, 108, 251, 1)" }}>{icon}</span>
    </span>
    <span
      className={`text-sm font-bold ${
        active ? "text-[#4338CA]" : "text-slate-800"
      }`}
    >
      {title}
    </span>
    <span className="text-center text-[11px] font-normal leading-tight text-slate-500">
      {description}
    </span>
  </button>
);

/* ────────────────────────────────────────────────────────────
   메인 페이지
   ──────────────────────────────────────────────────────────── */

const ScriptEditPage = () => {
  const navigate = useNavigate();

  const { result, hasSourceFile, sourceFileName, status } = useScriptJobStore();
  const hasRealData = status === "success" && result !== null;

  // 실데이터가 없을 때만 쓰는 임시 모의 데이터 (기존 "PPT O/X 화면 보기 (임시)" 토글용)
  const [mockSlides, setMockSlides] = useState<SlideItem[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [fullScript, setFullScript] = useState("");

  const [regenMode, setRegenMode] = useState<RegenMode>("full");
  const [presentationTime, setPresentationTime] = useState("5분");
  const [speakingStyle, setSpeakingStyle] = useState<SpeakingStyle>("formal");
  const [regenRequest, setRegenRequest] = useState("");

  // 실데이터가 들어오면 슬라이드 목록 또는 전체 대본 상태를 채움
  useEffect(() => {
    if (!hasRealData || !result) return;

    if (hasSourceFile) {
      const realSlides: SlideItem[] = result.slides.map((s) => ({
        id: `slide-${s.page}`,
        index: s.page,
        title: "슬라이드 제목이 들어갑니다", // 서버가 제목을 따로 안 줘서 임시 유지
        script: s.text,
      }));
      setMockSlides(realSlides);
      setSelectedSlideId(realSlides[0]?.id ?? null);
    } else {
      setFullScript(result.slides[0]?.text ?? "");
    }
  }, [hasRealData, result, hasSourceFile]);

  const hasSlides = hasRealData ? hasSourceFile : mockSlides.length > 0;
  const slides = mockSlides;

  const selectedSlide = useMemo(
    () => slides.find((s) => s.id === selectedSlideId) ?? null,
    [slides, selectedSlideId]
  );

  // TODO: 백엔드 연동 시 실제 업로드 + 슬라이드/대본 파싱 API 호출로 교체
  const loadMockSlides = useCallback(() => {
    const mock: SlideItem[] = Array.from({ length: 18 }, (_, i) => ({
      id: `slide-${i + 1}`,
      index: i + 1,
      title: "슬라이드 제목이 들어갑니다",
      script: "",
    }));
    setMockSlides(mock);
    setSelectedSlideId(mock[0].id);
  }, []);

  // 임시: 백엔드 연동 전, PPT 업로드/미업로드 화면을 바로 확인하기 위한 토글
  // 실데이터가 있으면 동작하지 않도록 막아둠
  const handleTogglePreview = () => {
    if (hasRealData) return;
    if (hasSlides) {
      setMockSlides([]);
      setSelectedSlideId(null);
    } else {
      loadMockSlides();
    }
  };

  const updateSelectedScript = (value: string) => {
    if (!selectedSlideId) return;
    setMockSlides((prev) =>
      prev.map((s) => (s.id === selectedSlideId ? { ...s, script: value } : s))
    );
  };

  const handleAddSlide = () => {
    setMockSlides((prev) => {
      const next: SlideItem = {
        id: `slide-${Date.now()}`,
        index: prev.length + 1,
        title: "슬라이드 제목이 들어갑니다",
        script: "",
      };
      return [...prev, next];
    });
  };

  return (
    <div className="flex w-full flex-col bg-slate-50 pt-14 sm:pt-16 lg:pt-28 lg:h-screen">
      {/* 상단 바 */}
      <div className="flex shrink-0 flex-col gap-2 border-b border-gray-100 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3 lg:px-8">
        <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
          {hasRealData && sourceFileName ? sourceFileName : "프로젝트명.pptx"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {!hasRealData && (
            <button
              type="button"
              onClick={handleTogglePreview}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 sm:px-4 sm:text-sm"
            >
              <Eye size={16} />
              {hasSlides ? "PPT X 화면 보기 (임시)" : "PPT O 화면 보기 (임시)"}
            </button>
          )}
          <TaskChip
            icon={Volume2}
            label="발표코칭"
            onClick={() => navigate("/coach-loading")}
            className="scale-90 origin-right"
          />
          <TaskChip icon={Download} label="다운로드" className="scale-90 origin-right" />
        </div>
      </div>

      {/* 본문 */}
      <div
        className={`flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4 lg:grid lg:min-h-[560px] lg:gap-4 lg:overflow-hidden lg:p-4 xl:gap-6 xl:p-6 ${
          hasSlides
            ? "lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[360px_1fr_360px] 2xl:grid-cols-[400px_1fr_400px]"
            : "lg:grid-cols-[1fr_minmax(280px,24%)] xl:grid-cols-[1fr_minmax(320px,22%)]"
        }`}
      >
        {/* 좌측: 슬라이드 리스트 */}
        {hasSlides && (
          <aside className="flex max-h-64 sm:max-h-80 flex-col overflow-hidden rounded-2xl bg-white shadow-sm lg:max-h-none lg:h-full">
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {slides.map((slide) => {
                const isSelected = slide.id === selectedSlideId;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSelectedSlideId(slide.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[color:var(--color-brand-primary)] bg-indigo-50/60"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-xs font-semibold text-[color:var(--color-text-body)]">
                      {String(slide.index).padStart(2, "0")}
                    </span>
                    <div className="h-12 w-20 shrink-0 rounded-md bg-gray-100 sm:h-[52px] sm:w-[92px]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[color:var(--color-text-heading)]">
                        {slide.title}
                      </p>
                      <p className="text-xs text-[color:var(--color-text-body)]">
                        {String(slide.index).padStart(2, "0")}/{slides.length}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {!hasRealData && (
              <button
                type="button"
                onClick={handleAddSlide}
                className="flex shrink-0 items-center justify-center gap-1.5 border-t border-gray-100 py-4 text-sm font-semibold text-[color:var(--color-brand-primary)] transition hover:bg-indigo-50/50"
              >
                <Plus size={16} />
                슬라이드 추가
              </button>
            )}
          </aside>
        )}

        {/* 중앙: 미리보기 + 대본 */}
        <section className="flex min-w-0 flex-col gap-4 lg:overflow-y-auto">
          {hasSlides ? (
            <>
              <div className="flex min-h-[180px] flex-1 items-center justify-center rounded-2xl bg-white shadow-sm sm:min-h-[220px] lg:min-h-[240px]">
                <p className="text-sm text-[color:var(--color-text-body)]">
                  슬라이드 미리보기
                </p>
              </div>
              <ScriptPanel
                label="해당 슬라이드 대본"
                script={selectedSlide?.script ?? ""}
                onChange={updateSelectedScript}
              />
            </>
          ) : (
            <ScriptPanel
              label="전체 대본"
              script={fullScript}
              onChange={setFullScript}
              dashed
            />
          )}
        </section>

        {/* 우측: 편집 도구 */}
        <aside className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:overflow-y-auto lg:p-6 2xl:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
              편집 도구
            </p>
            <div className="flex items-center gap-3 text-xs font-medium text-[color:var(--color-text-body)]">
              <button type="button" className="hover:text-[color:var(--color-brand-primary)]">
                이전
              </button>
              <button type="button" className="hover:text-[color:var(--color-brand-primary)]">
                다음
              </button>
            </div>
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setRegenMode("full")}
              style={{
                transition: "var(--transition-hover)",
                backgroundImage: regenMode === "full" ? "var(--gradient-brand-active)" : "none",
                backgroundColor: regenMode === "full" ? "transparent" : "var(--color-inactive-bg)",
              }}
              className={`flex-1 rounded-lg py-2.5 ${
                regenMode === "full"
                  ? "text-white shadow-md"
                  : "text-[color:var(--color-text-body)]"
              }`}
            >
              전체 재생성
            </button>
            <button
              type="button"
              onClick={() => setRegenMode("partial")}
              style={{
                transition: "var(--transition-hover)",
                backgroundImage: regenMode === "partial" ? "var(--gradient-brand-active)" : "none",
                backgroundColor: regenMode === "partial" ? "transparent" : "var(--color-inactive-bg)",
              }}
              className={`flex-1 rounded-lg py-2.5 ${
                regenMode === "partial"
                  ? "text-white shadow-md"
                  : "text-[color:var(--color-text-body)]"
              }`}
            >
              부분 재생성
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[color:var(--color-text-heading)]">
              발표 시간
            </label>
            <div className="relative">
              <Clock
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-body)]"
              />
              <select
                value={presentationTime}
                onChange={(e) => setPresentationTime(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-[color:var(--color-brand-primary)]"
              >
                {PRESENTATION_TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-body)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[color:var(--color-text-heading)]">
              발표 스타일
            </label>
            <div className="grid grid-cols-2 gap-3">
              <StyleCard
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z" />
                  </svg>
                }
                title="격식체"
                description="공식적이고 전문적인 어조의 발표"
                active={speakingStyle === "formal"}
                onClick={() => setSpeakingStyle("formal")}
              />
              <StyleCard
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                  </svg>
                }
                title="편안한 말투"
                description="친근하고 자연스러운 대화체 발표"
                active={speakingStyle === "casual"}
                onClick={() => setSpeakingStyle("casual")}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-semibold text-[color:var(--color-text-heading)]">
              재생성 요구사항 (자유 입력)
            </label>
            <textarea
              value={regenRequest}
              onChange={(e) => setRegenRequest(e.target.value)}
              placeholder="예) 더 간결하게 / 인사말 빼고 바로 주제로 / 더 격식있게 등"
              className="min-h-[120px] flex-1 resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none transition focus:border-[color:var(--color-brand-primary)] sm:min-h-[140px]"
            />
          </div>

          <button
            type="button"
            style={{ backgroundImage: "var(--gradient-brand-active)" }}
            className="w-full rounded-xl py-2.5 sm:py-3 lg:py-3.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02]"
          >
            재생성
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ScriptEditPage;