import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import { useScriptJobStore } from '../store/scriptJobStore';

export interface AiLoadingProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

const STEPS: LoadingStepInfo[] = [
  { label: '파일 수령' },
  { label: '텍스트 추출' },
  { label: '대본 생성', activeLabel: '대본 생성 중' },
  { label: '완료' },
];

// 서버가 세부 진행률(파일 수령/텍스트 추출 등)을 따로 내려주지 않기 때문에,
// 대기하는 동안 앞의 두 단계는 자연스럽게 넘어가는 것처럼 보여주고
// 실제 응답을 기다리는 동안은 '대본 생성' 단계에 머무르게 한다.
// (0 -> 1, 1 -> 2 로 넘어가는 시점, 단위 ms)
const STEP_ADVANCE_DELAYS = [500, 1300];
// 생성이 완료된 뒤 '완료' 단계를 잠깐 보여주고 자동으로 다음 화면으로 넘어가기까지의 대기 시간
const AUTO_NAVIGATE_DELAY = 700;

export const AiLoading: React.FC<AiLoadingProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const { status, result, error, presentationId, fetchResult } = useScriptJobStore();
  const [currentStep, setCurrentStep] = useState(1);

  const timerIdsRef = useRef<number[]>([]);
  const clearTimers = () => {
    timerIdsRef.current.forEach((id) => window.clearTimeout(id));
    timerIdsRef.current = [];
  };

  const handleNavigateNext = () => {
    if (!(status === 'success' && result !== null)) return; // 아직 결과가 없으면 이동하지 않음
    if (onClose) onClose();
    if (onNext) {
      onNext();
    } else {
      navigate('/script-edit');
    }
  };

  // 새로 생성 요청이 시작되면(status === 'running') 단계 애니메이션을 처음부터 재생한다.
  // AiSetPage에서 runCreate() 호출 직후(await 없이) 바로 이 페이지로 이동해오므로,
  // 이 페이지에 도착했을 때 이미 status가 'running'인 것이 정상 흐름이다.
  //
  // ⚠️ LoadingScreen의 currentStep은 1부터 시작하는 "단계 번호"다(steps[0] = 1번).
  // 그래서 시작하자마자 1단계를 바로 활성화하고, STEP_ADVANCE_DELAYS 시점마다
  // 2단계 → 3단계로 넘어가게 한다. (3단계 '대본 생성'에 머무른 채로 실제 응답을 기다림)
  useEffect(() => {
    if (!isOpen || status !== 'running') return;

    clearTimers();
    setCurrentStep(1);

    const advanceToStep = [2, 3];
    STEP_ADVANCE_DELAYS.forEach((delay, i) => {
      const id = window.setTimeout(() => setCurrentStep(advanceToStep[i]), delay);
      timerIdsRef.current.push(id);
    });

    return clearTimers;
  }, [isOpen, status]);

  // 생성이 성공하면 '완료' 단계로 넘긴 뒤, 잠깐 보여주고 자동으로 대본 편집 화면으로 이동한다.
  useEffect(() => {
    if (!isOpen || status !== 'success' || !result) return;

    clearTimers();
    setCurrentStep(STEPS.length); // 마지막(완료) 단계로 점프

    const id = window.setTimeout(() => {
      handleNavigateNext();
    }, AUTO_NAVIGATE_DELAY);
    timerIdsRef.current.push(id);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, status, result]);

  // 새로고침 등으로 이 페이지에 바로 진입했는데 진행 중인 요청도, 이미 받아온
  // 결과도 없다면(=추적할 job이 없다면) 다시 설정 페이지로 돌려보낸다.
  useEffect(() => {
    if (!isOpen) return;
    if (status === 'running' || status === 'success') return;
    if (result || presentationId) return;
    navigate('/ai-set', { replace: true });
  }, [isOpen, status, result, presentationId, navigate]);

  // 새로고침 등으로 presentationId는 남아있는데 result가 비어있는 경우(스토어가
  // 결과를 아직 못 받아온 상태)를 대비한 안전장치 — 있으면 한 번 더 조회를 시도한다.
  useEffect(() => {
    if (!isOpen) return;
    if (result || status === 'running') return;
    if (presentationId) {
      void fetchResult(presentationId);
    }
  }, [isOpen, presentationId, result, status, fetchResult]);

  useEffect(() => clearTimers, []);

  if (!isOpen) return null;

  if (status === 'error') {
    return (
      <LoadingScreen
        title="대본 생성에 실패했어요"
        description={error ?? '잠시 후 다시 시도해주세요.'}
        note="문제가 계속되면 파일을 다시 업로드해주세요."
        steps={STEPS}
        currentStep={currentStep}
        buttonLabel="다시 시도"
        onButtonClick={() => navigate('/ai-set')}
      />
    );
  }

  // 성공하면 자동으로 /script-edit으로 이동하기 때문에(위 useEffect), 수동으로
  // 눌러서 넘어가는 테스트용 버튼은 더 이상 필요 없어서 안 보이게 한다.
  return (
    <LoadingScreen
      title="AI가 대본을 생성하고 있어요"
      description="슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
      hideButton
    />
  );
};

export default AiLoading;
