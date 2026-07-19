import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Play, Pause, Square, RotateCcw, RotateCw } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   상수 / 유틸
   ──────────────────────────────────────────────────────────── */

const NUM_BARS = 56; // 화면에 그릴 파형 바 개수 (고정)
const SAMPLE_INTERVAL_MS = 100; // 녹음 중 파형 샘플링 주기
const SKIP_SECONDS = 5; // 되감기 / 앞으로 이동 초

/** mm:ss 포맷 (재생/녹음 후 화면용) */
const formatTime = (totalSeconds: number) => {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** mm:ss.centisecond 포맷 (녹음 중 경과시간용) */
const formatElapsed = (totalSeconds: number) => {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const cs = Math.floor((safe * 100) % 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(
    2,
    "0"
  )}`;
};

/** 임의 길이의 진폭 배열을 targetLength 개의 바로 리샘플링 */
const resampleWaveform = (data: number[], targetLength: number): number[] => {
  if (data.length === 0) return new Array(targetLength).fill(0.12);
  if (data.length === targetLength) return data;
  const ratio = data.length / targetLength;
  return Array.from({ length: targetLength }, (_, i) => {
    const idx = Math.min(Math.floor(i * ratio), data.length - 1);
    return data[idx];
  });
};

type RecorderPhase = "idle" | "requesting" | "recording" | "recorded";

/* ────────────────────────────────────────────────────────────
   서브 컴포넌트: 파형
   ──────────────────────────────────────────────────────────── */

const Waveform = ({
  bars,
  progressRatio,
}: {
  bars: number[];
  /** 0~1, 재생 진행률. null이면 전부 "미재생" 색으로 표시 */
  progressRatio: number | null;
}) => {
  const playedCount =
    progressRatio === null ? 0 : Math.round(progressRatio * bars.length);

  return (
    <div className="flex h-8 flex-1 items-center gap-[3px] overflow-hidden">
      {bars.map((value, i) => {
        const isPlayed = progressRatio !== null && i < playedCount;
        return (
          <span
            key={i}
            className={`w-[3px] shrink-0 rounded-full transition-colors ${
              isPlayed ? "bg-slate-300" : "bg-[color:var(--color-brand-primary)]"
            }`}
            style={{ height: `${12 + value * 88}%` }}
          />
        );
      })}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   메인 컴포넌트
   ──────────────────────────────────────────────────────────── */

interface VoiceRecorderProps {
  /** idle 상태에서 보여줄 안내 문구 */
  message?: string;
  /** 녹음이 끝났을 때 결과 오디오를 상위로 전달 (분석 API 호출 등에 사용) */
  onRecordingComplete?: (audioBlob: Blob, durationSeconds: number) => void;
  className?: string;
}

const VoiceRecorder = ({
  message = "실시간으로 발표를 녹음하고 음성 피드백을 받아보세요.",
  onRecordingComplete,
  className = "",
}: VoiceRecorderProps) => {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 녹음 중 경과시간(초)
  const [recordedDuration, setRecordedDuration] = useState(0); // 녹음 완료 후 총 길이(초)
  const [currentTime, setCurrentTime] = useState(0); // 재생 위치(초)
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveBars, setLiveBars] = useState<number[]>([]);
  const [finalBars, setFinalBars] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sampleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef(0);
  const pausedAtRef = useRef(0);
  const historyRef = useRef<number[]>([]);

  const cleanupRecordingResources = useCallback(() => {
    if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    sampleTimerRef.current = null;
    elapsedTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [cleanupRecordingResources]);

  /* ── 녹음 시작 ───────────────────────────────────────────── */
  const startRecording = useCallback(async () => {
    setError(null);
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      historyRef.current = [];
      setLiveBars([]);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        const finalDuration = (Date.now() - recordStartRef.current) / 1000;
        setRecordedDuration(finalDuration);
        setFinalBars(resampleWaveform(historyRef.current, NUM_BARS));
        setCurrentTime(0);
        setIsPlaying(false);
        setPhase("recorded");
        cleanupRecordingResources();
        onRecordingComplete?.(blob, finalDuration);
      };

      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      pausedAtRef.current = 0;
      recorder.start();
      setIsRecordingPaused(false);
      setElapsed(0);
      setPhase("recording");

      elapsedTimerRef.current = setInterval(() => {
        setElapsed((Date.now() - recordStartRef.current) / 1000);
      }, 50);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      sampleTimerRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg =
          dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length / 255;
        historyRef.current = [...historyRef.current, avg];
        setLiveBars((prev) => {
          const next = [...prev, avg];
          return next.length > NUM_BARS ? next.slice(-NUM_BARS) : next;
        });
      }, SAMPLE_INTERVAL_MS);
    } catch (err) {
      console.error(err);
      setError("마이크 접근 권한이 필요합니다.");
      setPhase("idle");
      cleanupRecordingResources();
    }
  }, [cleanupRecordingResources, onRecordingComplete]);

  /* ── 녹음 일시정지 / 재개 ────────────────────────────────── */
  const toggleRecordingPause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    const analyser = analyserRef.current;
    if (!recorder) return;

    if (!isRecordingPaused) {
      recorder.pause();
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);
      pausedAtRef.current = Date.now();
      setIsRecordingPaused(true);
    } else {
      recorder.resume();
      const pausedDuration = Date.now() - pausedAtRef.current;
      recordStartRef.current += pausedDuration;
      elapsedTimerRef.current = setInterval(() => {
        setElapsed((Date.now() - recordStartRef.current) / 1000);
      }, 50);
      if (analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        sampleTimerRef.current = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const avg =
            dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length / 255;
          historyRef.current = [...historyRef.current, avg];
          setLiveBars((prev) => {
            const next = [...prev, avg];
            return next.length > NUM_BARS ? next.slice(-NUM_BARS) : next;
          });
        }, SAMPLE_INTERVAL_MS);
      }
      setIsRecordingPaused(false);
    }
  }, [isRecordingPaused]);

  /* ── 녹음 종료 ───────────────────────────────────────────── */
  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  /* ── 다시 녹음 (초기화) ──────────────────────────────────── */
  const resetRecording = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setCurrentTime(0);
    setIsPlaying(false);
    setFinalBars([]);
    setLiveBars([]);
    setElapsed(0);
    setPhase("idle");
  }, []);

  /* ── 재생 컨트롤 ─────────────────────────────────────────── */
  const togglePlay = useCallback(() => {
    const audioEl = audioElRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      audioEl.play().catch(() => setError("오디오를 재생할 수 없습니다."));
    }
  }, [isPlaying]);

  const skip = useCallback(
    (seconds: number) => {
      const audioEl = audioElRef.current;
      if (!audioEl) return;
      const next = Math.min(
        Math.max(audioEl.currentTime + seconds, 0),
        recordedDuration || audioEl.duration || 0
      );
      audioEl.currentTime = next;
      setCurrentTime(next);
    },
    [recordedDuration]
  );

  const hasStartedPlaying = currentTime > 0.05 || isPlaying;
  const progressRatio =
    phase === "recorded" && recordedDuration > 0
      ? Math.min(currentTime / recordedDuration, 1)
      : null;

  /* ────────────────────────────────────────────────────────
     렌더링
     ──────────────────────────────────────────────────────── */

  const containerClass = `flex h-14 items-center gap-3 rounded-xl bg-[color:var(--color-white)] px-5 shadow-[0px_0px_12px_0px_rgba(120,165,250,0.10)] outline outline-[0.5px] outline-offset-[-0.5px] outline-slate-500/20 ${className}`;

  // 1) idle: 클릭하면 바로 녹음 시작
  if (phase === "idle" || phase === "requesting") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={startRecording}
          disabled={phase === "requesting"}
          className={`${containerClass} cursor-pointer text-left transition hover:shadow-[0px_0px_16px_0px_rgba(120,165,250,0.18)] disabled:cursor-wait`}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)]">
            <Mic size={18} className="text-[color:var(--color-white)]" />
          </div>
          <p className="text-base font-semibold font-['Pretendard'] leading-4 text-[color:var(--color-text-heading)]">
            {phase === "requesting" ? "마이크 준비 중..." : message}
          </p>
        </button>
        {error && <p className="pl-1 text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }

  // 2) recording: 일시정지 / 정지 / 경과시간 / 실시간 파형
  if (phase === "recording") {
    return (
      <div className={containerClass}>
        <button
          type="button"
          onClick={toggleRecordingPause}
          aria-label={isRecordingPaused ? "녹음 재개" : "녹음 일시정지"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-primary)] text-[color:var(--color-white)] transition hover:opacity-90"
        >
          {isRecordingPaused ? (
            <Play size={16} fill="currentColor" />
          ) : (
            <Pause size={16} fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={stopRecording}
          aria-label="녹음 종료"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[color:var(--color-white)] transition hover:opacity-90"
        >
          <Square size={14} fill="currentColor" />
        </button>
        <span className="flex shrink-0 items-center gap-1.5 text-base font-bold font-['Pretendard'] text-[color:var(--color-text-heading)]">
          {!isRecordingPaused && <span className="size-1.5 rounded-full bg-red-500" />}
          {formatElapsed(elapsed)}
        </span>
        <Waveform
          bars={liveBars.length ? liveBars : new Array(NUM_BARS).fill(0.12)}
          progressRatio={null}
        />
      </div>
    );
  }

  // 3) recorded: 재생 준비됨 / 재생 중 / 재생 일시정지
  return (
    <div className={containerClass}>
      <audio
        ref={audioElRef}
        src={audioUrlRef.current ?? undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {hasStartedPlaying && (
        <button
          type="button"
          onClick={() => skip(-SKIP_SECONDS)}
          aria-label={`${SKIP_SECONDS}초 되감기`}
          className="flex size-6 shrink-0 items-center justify-center text-[color:var(--color-text-body)] transition hover:text-[color:var(--color-brand-primary)]"
        >
          <RotateCcw size={18} />
        </button>
      )}

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "일시정지" : "재생"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-primary)] text-[color:var(--color-white)] transition hover:opacity-90"
      >
        {isPlaying ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {hasStartedPlaying ? (
        <button
          type="button"
          onClick={() => skip(SKIP_SECONDS)}
          aria-label={`${SKIP_SECONDS}초 앞으로`}
          className="flex size-6 shrink-0 items-center justify-center text-[color:var(--color-text-body)] transition hover:text-[color:var(--color-brand-primary)]"
        >
          <RotateCw size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={resetRecording}
          aria-label="다시 녹음"
          className="flex size-6 shrink-0 items-center justify-center text-[color:var(--color-text-body)] transition hover:text-[color:var(--color-brand-primary)]"
        >
          <RotateCcw size={18} />
        </button>
      )}

      <span className="shrink-0 text-base font-['Pretendard'] leading-4">
        <span className="font-bold text-[color:var(--color-text-heading)]">
          {formatTime(currentTime)}
        </span>
        <span className="font-medium text-[color:var(--color-text-body)]"> / {formatTime(recordedDuration)}</span>
      </span>

      <Waveform
        bars={finalBars.length ? finalBars : new Array(NUM_BARS).fill(0.12)}
        progressRatio={progressRatio}
      />
    </div>
  );
};

export default VoiceRecorder;
