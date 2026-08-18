import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Volume2,
  ChevronDown,
  Clock,
  Plus,
  Eye,
  FileText,
  ArrowLeft,
} from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";
import TaskChip from "../components/TaskChip";
import MainChip from "../components/MainChip";
import { useScriptJobStore } from "../store/scriptJobStore";
import { downloadScript } from "../apis/script.api";
import type { PresentationResult, ToneType } from "../apis/script.api";

interface SlideItem {
  id: string;
  slideId?: number;
  scriptId?: number;
  index: number;
  title: string;
  script: string;
  hasThumbnail: boolean;           
  thumbnailBase64?: string | null; 
}

type RegenMode = "full" | "partial";
type SpeakingStyle = ToneType | null;

const PRESENTATION_TIME_OPTIONS = ["5분", "10분", "15분"];


function buildSlidesFromResult(result: PresentationResult): SlideItem[] {
  if (!result?.slides || !Array.isArray(result.slides)) return [];

  // 1. slideOrder 기준으로 오름차순 정렬 (slideOrder가 같으면 version 내림차순)
  const sortedSlides = [...result.slides].sort((a, b) => {
    if (a.slideOrder !== b.slideOrder) {
      return a.slideOrder - b.slideOrder;
    }
    return b.version - a.version;
  });

  // 2. slideOrder 대신 고유한 slideId를 Map의 키로 사용하여 슬라이드가 덮어씌워지는 현상 방지
  const uniqueSlides = Array.from(
    new Map(sortedSlides.map((slide) => [slide.slideId, slide])).values()
  );

  return uniqueSlides.map((slide, index) => ({
    id: `slide-${slide.slideId}`,
    slideId: slide.slideId,
    scriptId: slide.scriptId ?? undefined,
    index: slide.slideOrder ?? index + 1, // slideOrder가 이상할 경우를 대비한 폴백
    title: slide.slideTitle ?? `${index + 1}번째 슬라이드`,
    script: slide.content ?? "",
    hasThumbnail: Boolean(slide.hasThumbnail),
    thumbnailBase64: slide.thumbnailBase64 ?? null,
  }));

}

// base64 문자열이 이미 data URI 형태("data:image/...")로 오는 경우와
// 순수 base64만 오는 경우를 둘 다 방어적으로 처리.
function resolveThumbnailSrc(base64?: string | null): string | null {
  if (!base64) return null;
  if (base64.startsWith("data:")) return base64;
  return `data:image/png;base64,${base64}`;
}

const ScriptPanel = ({
  label,
  script,
  onChange,
  dashed = false,
  readOnly = false,
}: {
  label: string;
  script: string;
  onChange: (value: string) => void;
  dashed?: boolean;
  readOnly?: boolean;
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
      <div
        className="
        origin-left
        scale-50
        sm:scale-[0.65]
        lg:scale-75
        "
      >
        <MainChip text="AI 생성" />
      </div>
    </div>

    <div className="mb-[2px] h-[34px] w-full overflow-hidden sm:h-[42px] xl:h-[50px]">
      <div
        className="
        w-[166.6667%] origin-top-left scale-[0.6]
        sm:w-[133.3333%] sm:scale-75
        xl:w-[111.1111%] xl:scale-90
        [&_p]:min-w-0 [&_p]:flex-1 [&_p]:truncate
        "
      >
        <VoiceRecorder message="녹음 후 직접 들어보며 자연스러운지 확인해보세요." />
      </div>
    </div>

    <textarea
      value={script}
      onChange={(e) => {
        if (readOnly) return;
        onChange(e.target.value);
      }}
      readOnly={readOnly}
      placeholder="생성된 AI 대본이 들어갑니다."
      className={`min-h-[200px] lg:min-h-0 flex-1 resize-none rounded-xl border p-4 text-sm leading-relaxed outline-none transition sm:min-h-[160px] ${
        readOnly
          ? "cursor-default border-gray-200 bg-gray-50 text-[color:var(--color-text-heading)]"
          : "border-gray-200 text-[color:var(--color-text-heading)] focus:border-[color:var(--color-brand-primary)]"
      }`}
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
    style={active ? undefined : { border: "1px solid rgba(128, 136, 146, 1)" }}
    className={`flex h-auto min-h-[110px] w-full flex-col items-center justify-center rounded-[16px] p-3 text-center transition-all sm:min-h-[130px] ${
      active
        ? "border border-[#5b6cfb] bg-[#EEF2FF] shadow-[0_0_16px_2px_rgba(91,108,251,0.18)]"
        : "bg-white hover:border-slate-400"
    }`}
  >
    <span
      className="mb-3 flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11"
      style={{ backgroundColor: "rgba(159, 160, 253, 0.25)" }}
    >
      <span style={{ color: "rgba(91, 108, 251, 1)" }}>{icon}</span>
    </span>
    <span
      className={`mb-1 text-sm font-bold ${
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

  const {
    result,
    hasSourceFile,
    topic,
    status,
    error,
    presentationId,
    regenerate,
    fullScript: fullScriptResult,
    fullScriptStatus,
    fullScriptError,
    fetchFullScript,
  } = useScriptJobStore();

  const hasRealData = result !== null;
  const isRegenerating = status === "running";
  const regenerateFailed = status === "error" && Boolean(error);

  // 파일을 넣고 대본을 생성한 케이스(PPT O)인지 여부. false면 부분 재생성 불가.
  const canUsePartialRegen = hasSourceFile;

  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [fallbackFullScript, setFallbackFullScript] = useState("");

  const [regenMode, setRegenMode] = useState<RegenMode>("full");
  const [presentationTime, setPresentationTime] = useState("5분");
  const [speakingStyle, setSpeakingStyle] = useState<SpeakingStyle>(null);
  const [regenRequest, setRegenRequest] = useState("");

  // "대본확인" → 전체 대본(PPT X 화면) 보기 모드
  const [fullScriptView, setFullScriptView] = useState(false);
  const [combinedScriptText, setCombinedScriptText] = useState("");

  // "다운로드" 버튼 → GET /download/script (텍스트 파일 스트림)
  const [isDownloadingScript, setIsDownloadingScript] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // 이전/다음(undo·redo)용 히스토리. 리렌더를 유발하지 않는 ref로 들고 있다가
  // 변경이 필요할 때만 bump()로 강제 리렌더한다.
  // - fullHistoryRef: 파일 있는 케이스(PPT O)의 슬라이드 배열 스냅샷 히스토리
  // - fullScriptHistoryRef: 파일 없는 케이스(PPT X)의 전체 대본(string) 스냅샷 히스토리
  const fullHistoryRef = useRef<SlideItem[][]>([]);
  const fullHistoryIndexRef = useRef<number>(-1);
  const fullScriptHistoryRef = useRef<string[]>([]);
  const fullScriptHistoryIndexRef = useRef<number>(-1);
  const slideHistoryRef = useRef<Record<string, string[]>>({});
  const slideHistoryIndexRef = useRef<Record<string, number>>({});
  const [, setHistoryTick] = useState(0);
  const bump = () => setHistoryTick((n) => n + 1);

  useEffect(() => {
    if (!result) return;

    const nextSlides = buildSlidesFromResult(result);
    setSlides(nextSlides);

    setSelectedSlideId((prev) => {
      if (prev && nextSlides.some((slide) => slide.id === prev)) {
        return prev;
      }
      return nextSlides[0]?.id ?? null;
    });

    setPresentationTime(`${result.duration}분`);

    if (!hasSourceFile) {
      setFallbackFullScript(nextSlides.map((slide) => slide.script).join("\n\n"));
    }
  }, [result, hasSourceFile]);

  useEffect(() => {
    if (fullScriptResult) {
      setCombinedScriptText(fullScriptResult.combinedScript ?? "");
    }
  }, [fullScriptResult]);

  // 파일 없이 업로드된 경우(PPT X)에는 부분 재생성이 불가능하므로,
  // 혹시 이전에 partial로 선택돼 있던 상태라면 full로 되돌린다.
  useEffect(() => {
    if (!canUsePartialRegen && regenMode === "partial") {
      setRegenMode("full");
    }
  }, [canUsePartialRegen, regenMode]);

  const hasSlides = slides.length > 0;
  // 실제 슬라이드별 화면(PPT O)인지 — 파일이 있을 때만 슬라이드 리스트/미리보기를 보여준다.
  // 파일이 없는 케이스(PPT X)는 slides 배열이 채워져 있어도 항상 전체 대본 화면으로 취급한다.
  const showSlideMode = hasSourceFile && hasSlides && !fullScriptView;
  // PPT O 상태에서 "대본확인"을 눌러 전체 대본만 읽는 화면 — 이 상태에서는
  // 편집 도구를 아예 없애고, 대본 내용도 읽기 전용으로 고정한다.
  // 파일 없는 케이스(PPT X)는 애초에 fullScriptView라는 별도 조회 API를 쓰지 않고
  // 처음부터 직접 편집 가능한 전체 대본 화면이므로 읽기 전용으로 만들지 않는다.
  const isFullScriptReadOnly = hasSourceFile && fullScriptView;
  // 우측 편집 도구 패널을 보여줄지 여부
  const showEditTools = !isFullScriptReadOnly;

  const selectedSlide = useMemo(
    () => slides.find((s) => s.id === selectedSlideId) ?? null,
    [slides, selectedSlideId]
  );

  const loadMockSlides = useCallback(() => {
    const mock: SlideItem[] = Array.from({ length: 18 }, (_, i) => ({
      id: `slide-${i + 1}`,
      index: i + 1,
      title: "슬라이드 제목이 들어갑니다",
      script: "",
      hasThumbnail: false,
      thumbnailBase64: null,
    }));
    setSlides([]);
    setSelectedSlideId(mock[0].id);
  }, []);

  const handleTogglePreview = () => {
    if (hasRealData) return;
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
        hasThumbnail: false,
        thumbnailBase64: null,
      };
      return [...prev, next];
    });
  };

  const handleRegenerate = async () => {
    if (regenMode === "partial" && (!canUsePartialRegen || !selectedSlide?.scriptId)) {
      return;
    }
    // 파일 있는 케이스(PPT O)는 slides가 비어있으면 재생성할 게 없다.
    // 파일 없는 케이스(PPT X)는 slides가 아니라 fallbackFullScript가 소스이므로 이 조건에서 제외한다.
    if (regenMode === "full" && hasSourceFile && slides.length === 0) {
      return;
    }

    const currentScript =
      regenMode === "partial"
        ? selectedSlide?.script ?? ""
        : hasSourceFile
          ? [...slides]
              .sort((a, b) => a.index - b.index)
              .map((slide) => slide.script)
              .join("\n\n")
          : fallbackFullScript; // 파일 없는 케이스는 사용자가 직접 수정한 전체 대본을 그대로 보낸다.

    if (!currentScript.trim()) {
      return;
    }

    const mode = regenMode;
    const targetSlideId = selectedSlideId;

    // 재생성 시도 전, 아직 히스토리가 없다면 "현재 상태"를 베이스라인(0번)으로 기록
    if (mode === "full") {
      if (hasSourceFile) {
        if (fullHistoryRef.current.length === 0) {
          fullHistoryRef.current = [slides];
          fullHistoryIndexRef.current = 0;
        }
      } else {
        if (fullScriptHistoryRef.current.length === 0) {
          fullScriptHistoryRef.current = [fallbackFullScript];
          fullScriptHistoryIndexRef.current = 0;
        }
      }
    } else if (mode === "partial" && targetSlideId) {
      if (!slideHistoryRef.current[targetSlideId]) {
        slideHistoryRef.current = {
          ...slideHistoryRef.current,
          [targetSlideId]: [selectedSlide?.script ?? ""],
        };
        slideHistoryIndexRef.current = {
          ...slideHistoryIndexRef.current,
          [targetSlideId]: 0,
        };
      }
    }

    await regenerate({
      scriptId: mode === "partial" ? selectedSlide?.scriptId : undefined,
      duration:
        mode === "full" ? parseInt(presentationTime.replace("분", ""), 10) : undefined,
      tone: speakingStyle ?? undefined,
      extraRequirement: regenRequest.trim() || undefined,
      currentScript,
    });

    const freshState = useScriptJobStore.getState();
    if (freshState.status !== "success" || !freshState.result) {
      bump();
      return;
    }

    const newSlides = buildSlidesFromResult(freshState.result);

    if (mode === "full") {
      if (hasSourceFile) {
        const truncated = fullHistoryRef.current.slice(0, fullHistoryIndexRef.current + 1);
        fullHistoryRef.current = [...truncated, newSlides];
        fullHistoryIndexRef.current = fullHistoryRef.current.length - 1;
      } else {
        const newFullScript = newSlides.map((s) => s.script).join("\n\n");
        const truncated = fullScriptHistoryRef.current.slice(
          0,
          fullScriptHistoryIndexRef.current + 1
        );
        fullScriptHistoryRef.current = [...truncated, newFullScript];
        fullScriptHistoryIndexRef.current = fullScriptHistoryRef.current.length - 1;
        setFallbackFullScript(newFullScript);
      }
    } else if (mode === "partial" && targetSlideId) {
      const updated = newSlides.find((s) => s.id === targetSlideId);
      const newContent = updated?.script ?? "";
      const idx = slideHistoryIndexRef.current[targetSlideId] ?? 0;
      const arr = slideHistoryRef.current[targetSlideId] ?? [];
      const truncated = arr.slice(0, idx + 1);
      const nextArr = [...truncated, newContent];
      slideHistoryRef.current = { ...slideHistoryRef.current, [targetSlideId]: nextArr };
      slideHistoryIndexRef.current = {
        ...slideHistoryIndexRef.current,
        [targetSlideId]: nextArr.length - 1,
      };
    }

    bump();
  };

  const canGoPrev =
    !isRegenerating &&
    (regenMode === "full"
      ? hasSourceFile
        ? fullHistoryIndexRef.current > 0
        : fullScriptHistoryIndexRef.current > 0
      : Boolean(selectedSlideId) &&
        (slideHistoryIndexRef.current[selectedSlideId as string] ?? 0) > 0);

  const canGoNext =
    !isRegenerating &&
    (regenMode === "full"
      ? hasSourceFile
        ? fullHistoryIndexRef.current >= 0 &&
          fullHistoryIndexRef.current < fullHistoryRef.current.length - 1
        : fullScriptHistoryIndexRef.current >= 0 &&
          fullScriptHistoryIndexRef.current < fullScriptHistoryRef.current.length - 1
      : Boolean(selectedSlideId) &&
        (slideHistoryIndexRef.current[selectedSlideId as string] ?? 0) <
          (slideHistoryRef.current[selectedSlideId as string]?.length ?? 0) - 1);

  const handlePrev = () => {
    if (regenMode === "full") {
      if (hasSourceFile) {
        if (fullHistoryIndexRef.current <= 0) return;
        fullHistoryIndexRef.current -= 1;
        const target = fullHistoryRef.current[fullHistoryIndexRef.current];
        setSlides(target);

        // 재생성으로 slideId(=id)가 바뀌었을 수 있어서, 현재 선택된 슬라이드가
        // target 배열에 없으면 같은 순서(index)의 슬라이드로 재매칭한다.
        setSelectedSlideId((prevId) => {
          if (prevId && target.some((s) => s.id === prevId)) return prevId;
          const currentOrder = selectedSlide?.index;
          const matched =
            currentOrder !== undefined
              ? target.find((s) => s.index === currentOrder)
              : undefined;
          return matched?.id ?? target[0]?.id ?? null;
        });
      } else {
        if (fullScriptHistoryIndexRef.current <= 0) return;
        fullScriptHistoryIndexRef.current -= 1;
        setFallbackFullScript(
          fullScriptHistoryRef.current[fullScriptHistoryIndexRef.current] ?? ""
        );
      }
    } else {
      if (!selectedSlideId) return;
      const idx = slideHistoryIndexRef.current[selectedSlideId] ?? 0;
      if (idx <= 0) return;
      const newIdx = idx - 1;
      slideHistoryIndexRef.current = {
        ...slideHistoryIndexRef.current,
        [selectedSlideId]: newIdx,
      };
      const content = slideHistoryRef.current[selectedSlideId]?.[newIdx] ?? "";
      setSlides((prev) =>
        prev.map((s) => (s.id === selectedSlideId ? { ...s, script: content } : s))
      );
    }
    bump();
  };

  const handleNext = () => {
    if (regenMode === "full") {
      if (hasSourceFile) {
        const arr = fullHistoryRef.current;
        if (fullHistoryIndexRef.current >= arr.length - 1) return;
        fullHistoryIndexRef.current += 1;
        const target = arr[fullHistoryIndexRef.current];
        setSlides(target);

        setSelectedSlideId((prevId) => {
          if (prevId && target.some((s) => s.id === prevId)) return prevId;
          const currentOrder = selectedSlide?.index;
          const matched =
            currentOrder !== undefined
              ? target.find((s) => s.index === currentOrder)
              : undefined;
          return matched?.id ?? target[0]?.id ?? null;
        });
      } else {
        const arr = fullScriptHistoryRef.current;
        if (fullScriptHistoryIndexRef.current >= arr.length - 1) return;
        fullScriptHistoryIndexRef.current += 1;
        setFallbackFullScript(arr[fullScriptHistoryIndexRef.current] ?? "");
      }
    } else {
      if (!selectedSlideId) return;
      const arr = slideHistoryRef.current[selectedSlideId] ?? [];
      const idx = slideHistoryIndexRef.current[selectedSlideId] ?? 0;
      if (idx >= arr.length - 1) return;
      const newIdx = idx + 1;
      slideHistoryIndexRef.current = {
        ...slideHistoryIndexRef.current,
        [selectedSlideId]: newIdx,
      };
      const content = arr[newIdx] ?? "";
      setSlides((prev) =>
        prev.map((s) => (s.id === selectedSlideId ? { ...s, script: content } : s))
      );
    }
    bump();
  };

  const handleViewFullScript = async () => {
    if (!presentationId) return;
    if (fullScriptStatus === "loading") return;
    await fetchFullScript(presentationId);
    const state = useScriptJobStore.getState();
    if (state.fullScriptStatus === "success") {
      setFullScriptView(true);
    }
  };

  // 크롬/엣지 등 File System Access API를 지원하는 브라우저에서
  // 네이티브 "다른 이름으로 저장" 팝업을 띄우기 위한 최소 타입.
  // (사파리/파이어폭스는 이 API 자체가 없어서 런타임에서만 분기한다)
  type SaveFilePickerFn = (options?: {
    suggestedName?: string;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;

  const handleDownloadScript = async () => {
    if (!presentationId) return;
    if (isDownloadingScript) return;

    setIsDownloadingScript(true);
    setDownloadError(null);

    try {
      const { blob, filename } = await downloadScript(presentationId);

      const showSaveFilePicker = (window as unknown as { showSaveFilePicker?: SaveFilePickerFn })
        .showSaveFilePicker;

      if (typeof showSaveFilePicker === "function") {
        try {
          const handle = await showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "텍스트 파일",
                accept: { "text/plain": [".txt"] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        } catch (pickerErr) {
          // 사용자가 저장 팝업에서 "취소"를 누른 경우는 에러가 아니라 그냥 중단으로 처리한다.
          if (pickerErr instanceof DOMException && pickerErr.name === "AbortError") {
            return;
          }
          // 그 외(예: 브라우저 정책상 실패)는 아래 기존 다운로드 방식으로 폴백한다.
        }
      }

      // 네이티브 저장 팝업을 지원하지 않는 브라우저(사파리/파이어폭스 등)는
      // 기존처럼 임시 링크를 눌러서 브라우저 기본 다운로드 폴더로 받는다.
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "대본 다운로드에 실패했습니다."
      );
    } finally {
      setIsDownloadingScript(false);
    }
  };

  const canRegenerate =
    !isRegenerating &&
    (regenMode === "full" || (canUsePartialRegen && Boolean(selectedSlide?.scriptId)));

  return (
    <div className="flex w-full flex-col bg-slate-50 pt-24 sm:pt-28 lg:pt-32 lg:h-screen">
      {/* 상단 바 */}
      <div className="flex shrink-0 flex-col gap-2 border-b border-gray-100 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3 lg:px-8">
        <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
          {topic}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
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

          {showSlideMode ? (
            <TaskChip
              icon={FileText}
              label={fullScriptStatus === "loading" ? "조회 중..." : "대본확인"}
              onClick={handleViewFullScript}
            />
          ) : (
            <>
              {hasSourceFile && hasSlides && fullScriptView && (
                <TaskChip
                  icon={ArrowLeft}
                  label="슬라이드 화면으로"
                  onClick={() => setFullScriptView(false)}
                />
              )}
              <TaskChip
                icon={Volume2}
                label="발표코칭"
                onClick={() => navigate("/coach-loading")}
              />
              <TaskChip
                icon={Download}
                label={isDownloadingScript ? "다운로드 중..." : "다운로드"}
                onClick={handleDownloadScript}
              />
            </>
          )}
        </div>
      </div>

      {showSlideMode && fullScriptStatus === "error" && fullScriptError && (
        <p className="px-4 pt-2 text-xs font-medium text-red-500 sm:px-6 lg:px-8">
          {fullScriptError}
        </p>
      )}

      {downloadError && (
        <p className="px-4 pt-2 text-xs font-medium text-red-500 sm:px-6 lg:px-8">
          {downloadError}
        </p>
      )}

      {/* 본문 */}
      <div
        className={`flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4 lg:grid lg:min-h-[560px] lg:gap-4 lg:overflow-hidden lg:p-4 xl:gap-6 xl:p-6 ${
          showSlideMode
            ? "lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[360px_1fr_360px] 2xl:grid-cols-[400px_1fr_400px]"
            : isFullScriptReadOnly
              ? "lg:grid-cols-1"
              : "lg:grid-cols-[1fr_minmax(280px,24%)] xl:grid-cols-[1fr_minmax(320px,22%)]"
        }`}
      >
        {/* 좌측: 슬라이드 리스트 — 파일이 있는 케이스(PPT O)에서만 노출 */}
        {showSlideMode && (
          <aside className="flex max-h-64 sm:max-h-80 flex-col overflow-hidden rounded-2xl bg-white shadow-sm lg:max-h-none lg:h-full">
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {slides.map((slide) => {
                const isSelected = slide.id === selectedSlideId;
                const thumbSrc = resolveThumbnailSrc(slide.thumbnailBase64);
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
                    <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:h-[52px] sm:w-[92px]">
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={`슬라이드 ${slide.index} 썸네일`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                          미리보기 없음
                        </div>
                      )}
                    </div>
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
          {showSlideMode ? (
            <>
              <div className="flex min-h-[180px] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm sm:min-h-[220px] lg:min-h-[240px]">
                {selectedSlide && resolveThumbnailSrc(selectedSlide.thumbnailBase64) ? (
                  <img
                    src={resolveThumbnailSrc(selectedSlide.thumbnailBase64)!}
                    alt={`슬라이드 ${selectedSlide.index} 미리보기`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="text-sm text-[color:var(--color-text-body)]">
                    {selectedSlide ? "이 슬라이드는 미리보기 이미지가 없습니다." : "슬라이드 미리보기"}
                  </p>
                )}
              </div>
              <ScriptPanel
                label="해당 슬라이드 대본"
                script={selectedSlide?.script ?? ""}
                onChange={updateSelectedScript}
              />
            </>
          ) : isFullScriptReadOnly ? (
            <ScriptPanel
              label="전체 대본"
              script={combinedScriptText}
              onChange={setCombinedScriptText}
              readOnly
            />
          ) : (
            <ScriptPanel
              label="전체 대본"
              script={fallbackFullScript}
              onChange={setFallbackFullScript}
              dashed={!hasRealData}
            />
          )}
        </section>

        {/* 우측: 편집 도구 — "대본확인"으로 들어온 읽기 전용 전체 대본 화면에서는 렌더링하지 않는다 */}
        {showEditTools && (
          <aside className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:overflow-y-auto lg:p-6 2xl:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--color-text-heading)]">
                편집 도구
              </p>
              <div className="flex items-center gap-3 text-xs font-medium text-[color:var(--color-text-body)]">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className="disabled:cursor-not-allowed disabled:opacity-40 hover:text-[color:var(--color-brand-primary)]"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="disabled:cursor-not-allowed disabled:opacity-40 hover:text-[color:var(--color-brand-primary)]"
                >
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
              {/* 파일 없이 업로드한 경우(PPT X)에는 부분 재생성 자체를 제공하지 않는다 */}
              {canUsePartialRegen && (
                <button
                  type="button"
                  onClick={() => setRegenMode("partial")}
                  style={{
                    transition: "var(--transition-hover)",
                    backgroundImage:
                      regenMode === "partial" ? "var(--gradient-brand-active)" : "none",
                    backgroundColor:
                      regenMode === "partial" ? "transparent" : "var(--color-inactive-bg)",
                  }}
                  className={`flex-1 rounded-lg py-2.5 ${
                    regenMode === "partial"
                      ? "text-white shadow-md"
                      : "text-[color:var(--color-text-body)]"
                  }`}
                >
                  부분 재생성
                </button>
              )}
            </div>
            {regenMode === "partial" && !selectedSlide && hasSlides && (
              <p className="text-xs text-red-500">재생성할 슬라이드를 먼저 선택해주세요.</p>
            )}

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

            {regenerateFailed && (
              <p className="text-xs font-medium text-red-500">{error}</p>
            )}

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={!canRegenerate}
              style={{
                backgroundImage: "var(--gradient-brand-active)",
                opacity: canRegenerate ? 1 : 0.5,
              }}
              className="w-full rounded-xl py-2.5 sm:py-3 lg:py-3.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRegenerating ? "재생성 중..." : "재생성"}
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ScriptEditPage;