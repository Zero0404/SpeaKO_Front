import { useCallback, useMemo, useState } from "react";
import {
  Download,
  Volume2,
  ChevronDown,
  Clock,
  Plus,
  Building2,
  MessageCircle,
  Eye,
} from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";

interface SlideItem {
  id: string;
  index: number;
  title: string;
  script: string;
}

type RegenMode = "full" | "partial";
type SpeakingStyle = "formal" | "casual";

const PRESENTATION_TIME_OPTIONS = ["3분", "5분", "7분", "10분", "15분"];

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
    className={`flex flex-1 flex-col gap-5 rounded-2xl
    p-5
    sm:p-6
    lg:p-8
    ${
      dashed
        ? "border-2 border-dashed border-[color:var(--color-brand-primary)]/50 bg-white"
        : "bg-white shadow-sm"
    }`}
  >
    <div className="flex items-center gap-2">
      <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
        {label}
      </p>
      <span
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-brand-light)]/50 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--color-brand-primary)]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(165,180,252,0.25), rgba(99,102,241,0.15))",
        }}
      >
        AI 생성
      </span>
    </div>

    <VoiceRecorder message="녹음 후 직접 들어보며 자연스러운지 확인해보세요." />

    <textarea
      value={script}
      onChange={(e) => onChange(e.target.value)}
      placeholder="생성된 AI 대본이 들어갑니다."
      className="min-h-[220px] lg:min-h-[160px] flex-1 resize-none rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-[color:var(--color-text-heading)] outline-none transition focus:border-[color:var(--color-brand-primary)]"
    />
  </div>
);


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
    style={active ? { backgroundColor: "#e0e7ff" } : undefined}
    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition ${
      active
        ? "border-[color:var(--color-brand-primary)] shadow-sm"
        : "border-gray-200 bg-white hover:border-gray-300"
    }`}
  >
    <span
      className={`flex size-12 items-center justify-center rounded-full ${
        active
          ? "bg-indigo-100 text-[color:var(--color-brand-primary)]"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {icon}
    </span>
    <span
      className={`text-base font-bold ${
        active ? "text-[color:var(--color-brand-primary)]" : "text-[color:var(--color-text-heading)]"
      }`}
    >
      {title}
    </span>
    <span
      className={`text-xs leading-snug ${
        active ? "text-[color:var(--color-text-body)]" : "text-gray-400"
      }`}
    >
      {description}
    </span>
  </button>
);


const ScriptEditPage = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [fullScript, setFullScript] = useState("");
  const [regenMode, setRegenMode] = useState<RegenMode>("full");
  const [presentationTime, setPresentationTime] = useState("5분");
  const [speakingStyle, setSpeakingStyle] = useState<SpeakingStyle>("formal");
  const [regenRequest, setRegenRequest] = useState("");

  const hasSlides = slides.length > 0;
  const selectedSlide = useMemo(
    () => slides.find((s) => s.id === selectedSlideId) ?? null,
    [slides, selectedSlideId]
  );

  // TODO: 백엔드 연동 시 실제 업로드 + 슬라이드/대본 파싱 API 호출로 교체
  const loadMockSlides = useCallback(() => {
    const mockSlides: SlideItem[] = Array.from({ length: 18 }, (_, i) => ({
      id: `slide-${i + 1}`,
      index: i + 1,
      title: "슬라이드 제목이 들어갑니다",
      script: "",
    }));
    setSlides(mockSlides);
    setSelectedSlideId(mockSlides[0].id);
  }, []);

  // 임시: 백엔드 연동 전, PPT 업로드/미업로드 화면을 바로 확인하기 위한 토글
  // 실제 업로드 API가 붙으면 이 버튼과 handleTogglePreview는 제거하면 됩니다.
  const handleTogglePreview = () => {
    if (hasSlides) {
      setSlides([]);
      setSelectedSlideId(null);
    } else {
      loadMockSlides();
    }
  };

  const updateSelectedScript = (value: string) => {
    if (!selectedSlideId) return;
    setSlides((prev) =>
      prev.map((s) => (s.id === selectedSlideId ? { ...s, script: value } : s))
    );
  };

  const handleAddSlide = () => {
    setSlides((prev) => {
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
    <div className="flex min-h-[calc(100vh-5rem)] w-full flex-col bg-slate-50 pt-20">
      {/* 상단 바 */}
      <div className="flex shrink-0 flex-col gap-4 border-b border-gray-100 bg-white px-4 py-4
        sm:px-6
        lg:flex-row
        lg:items-center
        lg:justify-between
        lg:px-8"
    >
        <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
          프로젝트명.pptx
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {/* 임시 버튼: PPT 업로드/미업로드 화면 미리보기 전환 */}
          <button
            type="button"
            onClick={handleTogglePreview}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            <Eye size={16} />
            {hasSlides ? "PPT X 화면 보기 (임시)" : "PPT O 화면 보기 (임시)"}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[color:var(--color-brand-light)]/15 px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-[color:var(--color-brand-primary)] transition hover:bg-[color:var(--color-brand-light)]/25"
          >
            <Volume2 size={18} />
            발표코칭
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[color:var(--color-brand-light)]/15 px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-[color:var(--color-brand-primary)] transition hover:bg-[color:var(--color-brand-light)]/25"
          >
            <Download size={18} />
            다운로드
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div
        className={`grid flex-1 gap-6 p-4
        lg:p-6
        ${
        hasSlides
        ? "grid-cols-1 xl:grid-cols-[280px_1fr_400px]"
        : "grid-cols-1 xl:grid-cols-[1fr_400px]"
        }`}
        >
        {/* 좌측: 슬라이드 리스트 */}
        {hasSlides && (
          <aside
            className="
            order-1
            flex
            max-h-[300px]
            flex-col
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm

            xl:order-none
            xl:max-h-none
            "
            >
            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {slides.map((slide) => {
                const isSelected = slide.id === selectedSlideId;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSelectedSlideId(slide.id)}
                    className={`flex w-full items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3 text-left transition ${
                      isSelected
                        ? "border-[color:var(--color-brand-primary)] bg-indigo-50/60"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-xs font-semibold text-[color:var(--color-text-body)]">
                      {String(slide.index).padStart(2, "0")}
                    </span>
                    <div className="h-12 w-20 shrink-0 rounded-md bg-gray-100" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[color:var(--color-text-heading)]">
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
            <button
              type="button"
              onClick={handleAddSlide}
              className="flex shrink-0 items-center justify-center gap-1.5 border-t border-gray-100 py-4 text-sm font-semibold text-[color:var(--color-brand-primary)] transition hover:bg-indigo-50/50"
            >
              <Plus size={16} />
              슬라이드 추가
            </button>
          </aside>
        )}

        {/* 중앙: 미리보기 + 대본 */}
        <section className="
        order-2
        flex
        min-w-0
        flex-col
        gap-6

        overflow-visible

        xl:order-none
        xl:overflow-y-auto
        "
        >
          {hasSlides ? (
            <>
              <div
                className="
                flex
                min-h-[220px]
                lg:min-h-[240px]
                flex-1
                items-center
                justify-center
                rounded-2xl
                bg-white
                shadow-sm
                "
                >
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
        <aside
        className="
        order-3
        flex
        flex-col
        gap-3

        overflow-visible

        rounded-2xl
        bg-white

        p-5
        sm:p-6
        lg:p-8

        shadow-sm

        xl:order-none
        xl:overflow-y-auto
        "
        >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StyleCard
                icon={<Building2 size={18} />}
                title="격식체"
                description="공식적이고 전문적인 어조의 발표"
                active={speakingStyle === "formal"}
                onClick={() => setSpeakingStyle("formal")}
              />
              <StyleCard
                icon={<MessageCircle size={18} />}
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
              className="min-h-[180px] lg:min-h-[140px] flex-1 resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none transition focus:border-[color:var(--color-brand-primary)]"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] py-3.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02]"
          >
            재생성
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ScriptEditPage;