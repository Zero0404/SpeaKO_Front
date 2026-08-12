import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen, { type LoadingStepInfo } from '../components/LoadingScreen';
import { useScriptJobStore } from '../store/scriptJobStore';

export interface CoachLoadingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

const STEPS: LoadingStepInfo[] = [
  { label: '대본 로드' },
  { label: '텍스트 분석' },
  { label: '하이라이팅', activeLabel: '하이라이팅 중' },
  { label: '완료' },
];

export const CoachLoadingModal: React.FC<CoachLoadingModalProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const { status, result } = useScriptJobStore();
  const [currentStep, setCurrentStep] = useState<number>(3); // 3: 하이라이팅 중, 4: 완료

  // TODO: 백엔드 연동 후에는 아래 하드코딩된 2초 타이머 대신, 실제 발음 코칭 분석 job의
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
      navigate('/coach-view', { state: { result } });
    }
  };

  if (!isOpen) return null;

  return (
    <LoadingScreen
      title="발음 하이라이팅을 적용하고 있어요"
      description="생성된 대본에서 정확한 발음 가이드를 분석 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
      buttonLabel="다음 페이지로 이동"
      onButtonClick={handleNavigateNext}
    />
  );
};

export const CoachLoading = CoachLoadingModal;
export default CoachLoadingModal;
