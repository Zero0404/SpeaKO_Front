import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgGradient from '../assets/background_gradiant.png';
import Navbar from '../components/Navbar';
import { useScriptJobStore } from '../store/scriptJobStore';

export interface FeedbackLoadingProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
}

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

  // 2초 타이머로 3단계 -> 4단계(완료) 전환
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
      navigate('/feedback', { state: { result, file: uploadedFile } });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 min-h-screen w-full flex flex-col items-center justify-start bg-cover bg-center bg-no-repeat font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: `url(${bgGradient})`,
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* 1바퀴(1초 회전) + 1초 멈춤 애니메이션 */}
      <style>{`
        @keyframes spinAndPause {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-pause {
          animation: spinAndPause 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* 상단 Navbar */}
      <div className="w-full relative z-20">
        <Navbar />
      </div>

      {/* 로딩 콘텐츠 메인 박스 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full px-4 py-8 relative z-10">
        {/* 회전 스피너 (원 전체의 1/4 크기 보라색 아크 회전) */}
        <div className="relative flex items-center justify-center mb-8 md:mb-10">
          <div
            className="w-[62px] h-[62px] rounded-full border-[5px] border-gray-200/80 animate-spin-pause"
            style={{
              borderTopColor: 'rgba(91, 108, 251, 1)',
            }}
          />
        </div>

        {/* 타이틀 & 문구 */}
        <div className="space-y-3 mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-heading)] tracking-tight">
            녹음 파일을 분석하고 있어요
          </h2>
          <p className="text-sm md:text-base font-medium text-[var(--color-text-body)]">
            사용자님의 음성을 분석하여 발음 피드백을 생성하는 중입니다.
          </p>
          <p className="text-xs md:text-sm text-gray-400">
            잠시만 기다려 주세요. 파일의 용량에 따라 최대 10분까지 소요될 수 있습니다.
          </p>
        </div>

        {/* 4단계 프로세스 위젯 */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-12">
          {/* 1단계 - 완료 */}
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundImage: 'var(--gradient-brand-active)' }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md"
            >
              1
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">오디오 업로드</span>
          </div>

          <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

          {/* 2단계 - 완료 */}
          <div className="flex flex-col items-center gap-2">
            <div
              style={{ backgroundImage: 'var(--gradient-brand-active)' }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md"
            >
              2
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">음성 인식</span>
          </div>

          <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

          {/* 3단계 - 진행 중("피드백 생성 중") -> 완료("피드백 생성")로 전환 */}
          <div className="flex flex-col items-center gap-2">
            {currentStep >= 4 ? (
              <div
                style={{ backgroundImage: 'var(--gradient-brand-active)' }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md"
              >
                3
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin" />
            )}
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
              {currentStep >= 4 ? '코칭 분석 중' : '코칭 분석 중'}
            </span>
          </div>

          <span className={currentStep >= 4 ? "text-[#6E8BFF] font-light text-lg sm:text-xl pb-6" : "text-gray-300 font-light text-xl pb-6"}>≫</span>

          {/* 4단계 - 대기 -> 완료로 활성화 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-300 ${
                currentStep >= 4
                  ? 'text-white font-bold shadow-md'
                  : 'border border-gray-400 text-gray-500 font-medium bg-white'
              }`}
              style={currentStep >= 4 ? { backgroundImage: 'var(--gradient-brand-active)' } : {}}
            >
              4
            </div>
            <span className={`text-xs sm:text-sm mt-1 ${currentStep >= 4 ? 'font-bold text-gray-900' : 'font-medium text-gray-400'}`}>
              완료
            </span>
          </div>
        </div>

        {/* 하단 [피드백 결과 보기] 버튼 */}
        <button
          type="button"
          onClick={handleNavigateNext}
          style={{
            width: '250px',
            height: '60px',
            borderRadius: '16px',
            paddingTop: '16px',
            paddingRight: '20px',
            paddingBottom: '16px',
            paddingLeft: '20px',
          }}
          className="hover-effect-btn flex items-center justify-between font-semibold text-base shadow-md border border-gray-100 transition-all duration-300 cursor-pointer active:scale-95 box-border bg-white"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--gradient-brand-active)';
            e.currentTarget.style.color = 'var(--color-white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = 'var(--color-text-heading)';
          }}
        >
          <span className="text-base font-semibold">피드백 결과 보기</span>
          <span className="text-xl font-light">&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackLoading;
