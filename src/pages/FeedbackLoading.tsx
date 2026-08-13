import React, { useEffect, useState } from 'react';
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

  // 실제 평가는 FeedbackFileUploadPage에서 이미 끝난 상태로 이 화면에 들어오기 때문에,
  // 여기서는 (순수 연출용으로) 2초 뒤 3단계 -> 4단계 완료로 전환합니다.
  useEffect(() => {
    if (!isOpen) return;

    const timerStep4 = setTimeout(() => {
      setCurrentStep(4);
    }, 2000);

    return () => {
      clearTimeout(timerStep4);
    };
  }, [isOpen]);

  const handleNavigateNext = () => {
    if (onClose) onClose();
    if (onNext) {
      onNext();
    } else {
      // ⚠️ 이전에는 '/feedback'으로 이동했는데, App.tsx / 기능명세서 기준 실제
      // 등록된 경로는 '/feedback-result'였습니다(App.tsx에는 아예 등록조차 안 돼
      // 있었음). 그래서 평가가 끝나도 결과 화면에 도달할 수 없었습니다.
      navigate('/feedback-result', { state: { evaluationResult, file: uploadedFile } });
    }
  };

  if (!isOpen) return null;

  return (
    <LoadingScreen
      title="발표 피드백을 생성하고 있어요"
      description="발표 음성 및 대본을 분석하여 피드백 보고서를 작성하는 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 10분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
      buttonLabel="피드백 결과 보기"
      onButtonClick={handleNavigateNext}
    />
  );
};

export default FeedbackLoading;
