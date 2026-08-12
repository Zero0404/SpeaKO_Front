import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import { useScriptJobStore } from '../store/scriptJobStore';

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
  const { status, result } = useScriptJobStore();
  const [currentStep, setCurrentStep] = useState<number>(3); // 3: 진행 중, 4: 완료

  // 이전 페이지(FeedbackFileUploadPage)에서 전달받은 파일 정보
  const uploadedFile = location.state?.file as File | undefined;

  // TODO: 백엔드 연동 후에는 아래 하드코딩된 2초 타이머 대신, 실제 피드백 분석 job의
  // 상태(loading/success/error)에 맞춰 currentStep을 갱신하도록 교체하기.
  useEffect(() => {
    if (!isOpen) return;

    const timerStep4 = setTimeout(() => {
      setCurrentStep(4);
    }, 2000);

    return () => {
      clearTimeout(timerStep4);
    };
  }, [isOpen, status]);

  const handleNavigateNext = () => {
    if (onClose) onClose();
    if (onNext) {
      onNext();
    } else {
      // TODO: App.tsx / 기능명세서에는 '/feedback-result' 경로로 FeedbackPage가 등록되어 있는데
      // 여기는 '/feedback'으로 이동하고 있어요. 기존 동작을 그대로 유지했으니, 실제 연동 작업
      // 들어갈 때 라우팅 경로가 맞는지 한번 확인해보면 좋을 것 같아요.
      navigate('/feedback', { state: { result, file: uploadedFile } });
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
