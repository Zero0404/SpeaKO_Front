import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import { recordEvaluation, type EvaluationResult } from '../apis/feedback';

export interface FeedbackLoadingProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

const STEPS: LoadingStepInfo[] = [
  { label: '파일 수령' },
  { label: '음성 분석', activeLabel: '음성 분석 중' },
  { label: '피드백 생성', activeLabel: '피드백 생성 중' },
  { label: '완료' },
];

// 실제 요청(recordEvaluation)이 끝난 뒤에도 "피드백 생성 → 완료" 두 스텝이 눈에 보이게
// 잠깐 머무는 시간. 실제 로딩과는 무관한 순수 연출용 딜레이라 짧게만 준다.
const RESULT_STEP_DELAY_MS = 450;

/**
 * ⚠️ 이전 버전은 이 페이지가 실제로 아무 일도 하지 않았습니다 — 호출하는 쪽
 * (FeedbackFileUploadPage)이 recordEvaluation()을 먼저 끝내놓고 결과만 던져주면,
 * 이 페이지는 정해진 시간(2000ms → 800ms)만큼 타이머를 돌리다가 무조건 다음 화면으로
 * 넘어가는 "가짜 로딩"이었습니다. 그래서 실제 요청이 오래 걸려도 화면엔 항상 똑같은
 * 시간만 표시되고, 정작 로딩 도중 실패해도 이 페이지에서는 알 방법이 없었습니다.
 *
 * 지금은 반대로, 호출하는 쪽은 요청에 필요한 값(userId/scriptId/file)만 넘기고
 * recordEvaluation()은 이 페이지가 직접 호출합니다. 그래야 화면의 로딩 상태가
 * 실제 네트워크 요청과 맞물려서 움직이고, 실패도 이 페이지에서 바로 처리할 수 있습니다.
 */
interface FeedbackLoadingState {
  userId: number;
  scriptId: number;
  file: File;
  /** 평가가 끝난 뒤 이동할 경로. 안 주면 기존처럼 /feedback-result로 간다. */
  nextPath?: string;
}

export const FeedbackLoading: React.FC<FeedbackLoadingProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestState = location.state as FeedbackLoadingState | null;

  // 1: 파일 수령, 2: 음성 분석(실제 요청이 나가 있는 동안 여기 머무른다), 3: 피드백 생성, 4: 완료
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    if (hasStartedRef.current) return;

    if (!requestState?.file || !requestState?.userId || !requestState?.scriptId) {
      setError('평가에 필요한 정보가 없어요. 이전 화면으로 돌아가 다시 시도해주세요.');
      return;
    }

    hasStartedRef.current = true;
    let cancelled = false;

    const run = async () => {
      setCurrentStep(2); // 음성 분석 중 — 실제 요청이 응답할 때까지 계속 이 단계에 머무른다.
      try {
        const result: EvaluationResult = await recordEvaluation({
          userId: requestState.userId,
          scriptId: requestState.scriptId,
          file: requestState.file,
        });
        if (cancelled) return;

        setCurrentStep(3); // 피드백 생성
        setTimeout(() => {
          if (cancelled) return;
          setCurrentStep(4); // 완료
          setTimeout(() => {
            if (cancelled) return;
            if (onClose) onClose();
            if (onNext) {
              onNext();
              return;
            }
            navigate(requestState.nextPath ?? '/feedback-result', {
              state: { evaluationResult: result, file: requestState.file },
            });
          }, RESULT_STEP_DELAY_MS);
        }, RESULT_STEP_DELAY_MS);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '평가 중 오류가 발생했습니다.');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg bg-[color:var(--color-brand-primary)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--color-brand-primary)] transition hover:bg-[color:var(--color-brand-primary)]/20"
        >
          이전 화면으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <LoadingScreen
      title="발표 피드백을 생성하고 있어요"
      description="발표 음성 및 대본을 분석하여 피드백 보고서를 작성하는 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 10분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
    />
  );
};

export default FeedbackLoading;
