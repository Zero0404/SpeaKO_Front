import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import type { EvaluationResult } from '../apis/feedback';

export interface FeedbackLoadingProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

const STEPS: LoadingStepInfo[] = [
  { label: '파일 수령' },
  { label: '음성 분석' },
  { label: '피드백 생성', activeLabel: '피드백 생성 중' },
  { label: '완료' },
];

// '완료' 단계가 된 뒤, 버튼을 안 눌러도 자동으로 결과 화면으로 넘어가기까지 대기하는 시간.
// 0으로 하면 '완료' 표시가 눈에 보이지도 않고 바로 넘어가버려서, 완료됐다는 걸
// 잠깐이라도 보여주기 위해 약간의 딜레이를 둡니다.
const AUTO_NAVIGATE_DELAY_MS = 800;

export const FeedbackLoading: React.FC<FeedbackLoadingProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<number>(3); // 3: 진행 중, 4: 완료

  const uploadedFile = location.state?.file as File | undefined;
  const evaluationResult = location.state?.evaluationResult as EvaluationResult | undefined;

  const handleNavigateNext = useCallback(() => {
    if (onClose) onClose();
    if (onNext) {
      onNext();
    } else {
  
      navigate('/feedback-result', { state: { evaluationResult, file: uploadedFile } });
    }
  }, [onClose, onNext, navigate, evaluationResult, uploadedFile]);

  
  useEffect(() => {
    if (!isOpen) return;

    const timerStep4 = setTimeout(() => {
      setCurrentStep(4);
    }, 2000);

    return () => {
      clearTimeout(timerStep4);
    };
  }, [isOpen]);


  useEffect(() => {
    if (!isOpen || currentStep !== 4) return;

    const timerNavigate = setTimeout(() => {
      handleNavigateNext();
    }, AUTO_NAVIGATE_DELAY_MS);

    return () => {
      clearTimeout(timerNavigate);
    };
  }, [isOpen, currentStep, handleNavigateNext]);

  if (!isOpen) return null;

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
