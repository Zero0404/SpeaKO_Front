import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import { useScriptJobStore } from '../store/scriptJobStore';

export interface AiLoadingModalProps {
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

export const AiLoadingModal: React.FC<AiLoadingModalProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const { status, result } = useScriptJobStore();
  const [currentStep, setCurrentStep] = useState<number>(3); // 3: 대본 작성 중, 4: 완료

  // TODO: 백엔드 연동 후에는 아래 하드코딩된 2초 타이머 대신, useScriptJobStore의 status
  // (running/success/error/paywall)에 맞춰 currentStep을 갱신하도록 교체하기.
  // 예) status === 'success' -> setCurrentStep(4), status === 'error' -> 에러 UI 분기 등
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
      navigate('/script-edit', { state: { result } });
    }
  };

  if (!isOpen) return null;

  return (
    <LoadingScreen
      title="AI가 대본을 생성하고 있어요"
      description="슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
      buttonLabel="대본 편집으로 이동"
      onButtonClick={handleNavigateNext}
    />
  );
};

export const AiLoading = AiLoadingModal;
export default AiLoadingModal;
