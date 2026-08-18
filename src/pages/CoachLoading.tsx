import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import { getPresentationHighlights, type CustomPresentationResult } from '../apis/coach.api';

export interface CoachLoadingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

const STEPS: LoadingStepInfo[] = [
  { label: '대본 로드' },
  { label: '텍스트 분석', activeLabel: '텍스트 분석 중' },
  { label: '하이라이팅', activeLabel: '하이라이팅 중' },
  { label: '완료' },
];

interface CoachLoadingState {
  presentationId?: number;
  /** 하이라이팅 완료 후 이동할 경로. 안 주면 기존처럼 /coach-view로 간다. */
  nextPath?: string;
}

// "텍스트 분석 → 하이라이팅 → 완료" 각 스텝이 눈에 보이게 잠깐 머무는 시간.
// 실제 로딩과는 무관한 순수 연출용 딜레이.
const HIGHLIGHT_STEP_DELAY_MS = 450;

export const CoachLoadingModal: React.FC<CoachLoadingModalProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestState = location.state as CoachLoadingState | null;

  // 1: 대본 로드, 2: 텍스트 분석(실제 요청이 응답할 때까지 여기 머무른다), 3: 하이라이팅, 4: 완료
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // ⚠️ "한 번만 실행" 가드(hasStartedRef 같은 것)를 일부러 안 쓴다. React 18 개발 모드의
    // <StrictMode>는 effect를 "마운트 → 정리 → 재마운트" 순서로 한 번 더 시뮬레이션해서
    // 버그를 잡아내려고 하는데, 그 정리(cleanup) 시점에 cancelled를 true로 바꿔놓고
    // "한 번만 실행" 가드가 재마운트를 막아버리면, 이미 걸어둔 타이머가 나중에 실행돼도
    // cancelled 체크에 걸려서 그대로 멈춰버린다("텍스트 분석 중"에서 영영 안 넘어가던
    // 원인이 이거였다). 그 대신 매 effect 실행마다 독립적인 cancelled 변수 + cleanup만
    // 쓰면, StrictMode가 첫 번째 실행을 취소해도 재마운트된 두 번째 실행이 정상적으로
    // 처음부터 다시 돌면서 끝까지 진행된다.

    // 로딩(연출용 스텝 애니메이션)이 끝나면 자동으로 다음 화면으로 이동한다.
    // (onClose/onNext prop으로 오버라이드해서 쓰는 경우엔 그쪽을 우선한다.)
    const goNext = (result: CustomPresentationResult) => {
      if (onClose) onClose();
      if (onNext) {
        onNext();
        return;
      }
      navigate(requestState?.nextPath ?? '/coach-view', {
        state: { presentation: result },
      });
    };

    if (!requestState?.presentationId) {
      setError('하이라이팅을 적용할 대본 정보가 없어요. 이전 화면으로 돌아가 다시 시도해주세요.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      setCurrentStep(2); // 텍스트 분석 중 — 실제 요청이 응답할 때까지 계속 이 단계에 머무른다.
      try {
        const result = await getPresentationHighlights(requestState.presentationId!);
        if (cancelled) return;

        // ⚠️ 서버가 200 OK + success: true로 응답해도 scripts가 빈 배열로 올 때가 있다 —
        // 이건 에러가 아니라 "이 presentationId는 아직 하이라이팅 분석이 안 됐다"는 뜻이다
        // (지금까지 확인된 케이스: POST /custom으로 만든 대본은 정상 채워지는데, AI 대본
        // 생성(POST /api/presentations)으로 만든 대본은 하이라이팅 분석이 아직 안 붙어있음).
        // 이걸 그냥 통과시키면 CoachViewPage가 조용히 목데이터로 폴백해버려서 사용자가
        // "왜 내 대본이 아니지?" 하고 헷갈리게 되니, 여기서 명확한 에러로 끊어준다.
        if (!result.scripts || result.scripts.length === 0) {
          setError(
            '이 대본은 아직 하이라이팅 분석이 준비되지 않았어요. 잠시 후 다시 시도하거나, 다른 대본으로 시도해주세요.',
          );
          return;
        }

        setCurrentStep(3); // 하이라이팅
        setTimeout(() => {
          if (cancelled) return;
          setCurrentStep(4); // 완료
          setTimeout(() => {
            if (cancelled) return;
            goNext(result);
          }, HIGHLIGHT_STEP_DELAY_MS);
        }, HIGHLIGHT_STEP_DELAY_MS);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '하이라이팅 적용 중 오류가 발생했습니다.');
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
      title="발음 하이라이팅을 적용하고 있어요"
      description="생성된 대본에서 정확한 발음 가이드를 분석 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
    />
  );
};

export const CoachLoading = CoachLoadingModal;
export default CoachLoadingModal;
