import React, { useEffect, useState } from 'react';
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

export const AiLoading: React.FC<AiLoadingProps> = ({
  isOpen = true,
  onClose,
  onNext,
}) => {
  const navigate = useNavigate();
  const { status, result, error, presentationId, fetchResult } = useScriptJobStore();
  const [currentStep, setCurrentStep] = useState<number>(3);


  useEffect(() => {
    if (!isOpen) return;
    if (result) {
      setCurrentStep(4);
      return;
    }
    if (presentationId) {
      void fetchResult(presentationId);
    }
  }, [isOpen, presentationId, result, fetchResult]);

  useEffect(() => {
    if (status === 'success' && result) {
      setCurrentStep(4);
    }
  }, [status, result]);

  const isReady = status === 'success' && result !== null;

  const handleNavigateNext = () => {
    if (!isReady) return; // 아직 결과가 없으면 이동하지 않음
    if (onClose) onClose();
    if (onNext) {
      onNext();
    } else {
      
      navigate('/script-edit');
    }
  };

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

  return (
    <LoadingScreen
      title="AI가 대본을 생성하고 있어요"
      description="슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다."
      note="잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다."
      steps={STEPS}
      currentStep={currentStep}
      buttonLabel={isReady ? '대본 편집으로 이동' : '생성 중...'}
      onButtonClick={handleNavigateNext}
    />
  );
};

export default AiLoading;