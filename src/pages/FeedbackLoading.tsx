import React, { useEffect, useState } from 'react';
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
 * 지금은 반대로, 호출하는 쪽은 요청에 필요한 값(userId/presentationId/file)만 넘기고
 * recordEvaluation()은 이 페이지가 직접 호출합니다. 그래야 화면의 로딩 상태가
 * 실제 네트워크 요청과 맞물려서 움직이고, 실패도 이 페이지에서 바로 처리할 수 있습니다.
 *
 * ⚠️ scriptId → presentationId로 필드명이 바뀌었습니다. POST /api/evaluations/record의
 * 실제 스펙에는 scriptId라는 필드가 없고, "이미 등록된 발표 자료"를 가리킬 땐
 * presentationId를 보내야 합니다(예전엔 scriptId를 보내고 있어서 "presentationId, 대본
 * 파일, 혹은 텍스트 중 하나는 반드시 제공되어야 합니다" 에러가 났었습니다).
 */
interface FeedbackLoadingState {
  userId: number;
  presentationId: number;
  file: File;
  /** 평가가 끝난 뒤 이동할 경로. 안 주면 기존처럼 /feedback-result로 간다. */
  nextPath?: string;
  /**
   * CoachViewPage에서 넘어온 경우, 그 페이지가 들고 있던 실제 대본(presentation) 데이터를
   * 그대로 실어서 보낸다. 이 페이지는 그 값의 실제 타입(CustomPresentationResult)을 알
   * 필요가 없어서(다른 흐름에서는 아예 안 옴) unknown으로 받아뒀다가, 평가가 끝나면 손대지
   * 않고 그대로 다음 페이지에 돌려준다. 이게 없으면 CoachViewPage가 "실시간 평가받기" →
   * 로딩 → 복귀 과정에서 대본 데이터를 잃어버리고 다시 목데이터로 돌아가 버린다.
   */
  presentation?: unknown;
  /**
   * 이 평가가 "파일로 평가받기"로 시작됐는지, "실시간 평가받기"로 시작됐는지. 이 페이지는
   * 이 값을 쓰지 않고 그대로 다음 페이지에 넘겨준다 — FeedbackPage의 "다시 테스트" 버튼이
   * 이 값으로 어느 화면으로 돌아갈지(파일 재업로드 화면 vs CoachViewPage) 판단한다.
   */
  entry?: 'file' | 'realtime';
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

  useEffect(() => {
    if (!isOpen) return;

    if (!requestState?.file || !requestState?.userId || !requestState?.presentationId) {
      setError('평가에 필요한 정보가 없어요. 이전 화면으로 돌아가 다시 시도해주세요.');
      return;
    }

    // ⚠️ "한 번만 실행" 가드(hasStartedRef 같은 것)를 일부러 안 쓴다. React 18 개발 모드의
    // <StrictMode>는 effect를 "마운트 → 정리 → 재마운트" 순서로 한 번 더 시뮬레이션하는데,
    // 정리(cleanup) 시점에 cancelled를 true로 바꿔놓고 "한 번만 실행" 가드가 재마운트를
    // 막아버리면, 이미 진행 중이던 요청이 나중에 끝나도 cancelled 체크에 걸려서 화면이
    // "음성 분석 중"에서 멈춘 채로 다시는 안 넘어간다(CoachLoading에서 실제로 겪은 버그와
    // 동일한 패턴). 그 대신 매 effect 실행마다 독립적인 cancelled 변수 + cleanup만 쓰면,
    // StrictMode가 첫 번째 실행을 취소해도 재마운트된 두 번째 실행이 처음부터 다시 돌면서
    // 정상적으로 끝까지 진행된다.
    //
    // ⚠️ 다만 cancelled는 "응답을 받은 뒤 화면에 반영할지"만 걸러줄 뿐, 이미 나간 네트워크
    // 요청 자체를 취소하진 않는다. 그래서 StrictMode가 첫 번째 마운트를 정리하는 순간에도
    // recordEvaluation() 요청은 이미 서버로 가고 있었고, 재마운트된 두 번째 실행이 또
    // 한 번 요청을 보내서 백엔드 로그에 POST /api/evaluations/record가 실제로 2번
    // 찍혔다(백엔드 쪽에서 확인). AbortController를 같이 써서, cleanup 시점에 첫 번째
    // 요청 자체를 중간에 끊어버리도록 고쳤다. cancelled 체크가 이미 catch보다 앞서
    // 걸려있어서, abort로 인한 에러가 나도 화면에 에러가 뜨진 않는다(그대로 무시됨).
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      setCurrentStep(2); // 음성 분석 중 — 실제 요청이 응답할 때까지 계속 이 단계에 머무른다.
      try {
        const result: EvaluationResult = await recordEvaluation({
          userId: requestState.userId,
          presentationId: requestState.presentationId,
          file: requestState.file,
          signal: controller.signal,
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
              state: {
                evaluationResult: result,
                file: requestState.file,
                presentation: requestState.presentation,
                entry: requestState.entry,
              },
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
      controller.abort();
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
