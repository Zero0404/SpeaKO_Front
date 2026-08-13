import React from 'react';
import bgGradient from '../assets/background_gradiant.png';
import Navbar from './Navbar';

export interface LoadingStepInfo {
  /** 완료 상태 또는 기본 상태일 때 보여줄 라벨 (예: "대본 생성") */
  label: string;
  /** 진행 중일 때만 다른 문구를 쓰고 싶으면 지정 (예: "대본 생성 중"). 생략하면 label을 그대로 사용 */
  activeLabel?: string;
}

export interface LoadingScreenProps {
  /** 상단 큰 타이틀 */
  title: string;
  /** 타이틀 아래 설명 문구 */
  description: string;
  /** 예상 소요 시간 등 하단 안내 문구 (선택) */
  note?: string;
  /** 하단 단계 위젯에 표시할 단계 목록 (보통 4단계) */
  steps: LoadingStepInfo[];
  /** 현재 진행 단계 (1부터 시작). steps.length에 도달하면 전체 완료 상태로 표시됨 */
  currentStep: number;
  /** 하단 버튼 라벨 (hideButton이 true면 무시됨) */
  buttonLabel?: string;
  /** 하단 버튼 클릭 핸들러 (hideButton이 true면 무시됨) */
  onButtonClick?: () => void;
  /** true면 하단 버튼을 아예 렌더링하지 않는다 (예: 자동으로 다음 화면으로 넘어가서 수동 버튼이 필요 없는 화면). 기본값 false */
  hideButton?: boolean;
}

/**
 * AI 대본 생성 / 발음 코칭 분석 / 피드백 분석 등, "작업이 진행되는 동안 보여주는 로딩 화면"에서
 * 공통으로 쓰는 UI (배경, 스피너, 단계 위젯, 하단 버튼).
 *
 * 각 화면(AiLoading, CoachLoading, FeedbackLoading)은 이 컴포넌트에 타이틀/문구/단계 라벨/
 * 다음 이동 동작만 props로 넘기고, 언제 currentStep을 몇으로 바꿀지(타이머 기반이든, 실제 API
 * 상태 기반이든)는 각자 알아서 관리한다.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title,
  description,
  note,
  steps,
  currentStep,
  buttonLabel,
  onButtonClick,
  hideButton = false,
}) => {
  const totalSteps = steps.length;
  const showButton = !hideButton && Boolean(buttonLabel) && Boolean(onButtonClick);

  return (
    <div
      className="fixed inset-0 z-50 min-h-screen w-full flex flex-col items-center justify-start bg-cover bg-center bg-no-repeat font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: `url(${bgGradient})`,
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* 시작점을 30도 옆으로 기울이고 1바퀴(1초 회전) + 1초 멈춤 애니메이션 */}
      <style>{`
        @keyframes spinAndPause {
          0% { transform: rotate(30deg); }
          50% { transform: rotate(390deg); }
          100% { transform: rotate(390deg); }
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
        {/* 회전 스피너 */}
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
            {title}
          </h2>
          <p className="text-sm md:text-base font-medium text-[var(--color-text-body)]">
            {description}
          </p>
          {note && (
            <p className="text-xs md:text-sm text-gray-400">{note}</p>
          )}
        </div>

        {/* 단계 위젯 (steps.length 만큼 동적으로 렌더링) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-12">
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const isLastStep = stepNumber === totalSteps;
            // 이전 단계들은 항상 완료 처리, 마지막 단계는 currentStep이 끝까지 도달했을 때만 완료 처리
            const isDone = stepNumber < currentStep || (isLastStep && currentStep >= totalSteps);
            const isActive = stepNumber === currentStep && !isDone;

            return (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center gap-2">
                  {isDone ? (
                    <div
                      style={{ backgroundImage: 'var(--gradient-brand-active)' }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md"
                    >
                      {stepNumber}
                    </div>
                  ) : isActive ? (
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 animate-spin-pause"
                      style={{
                        borderTopColor: 'rgba(91, 108, 251, 1)',
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm border border-gray-400 text-gray-500 font-medium bg-white">
                      {stepNumber}
                    </div>
                  )}
                  <span
                    className={`text-xs sm:text-sm mt-1 ${
                      isDone || isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-400'
                    }`}
                  >
                    {isActive && step.activeLabel ? step.activeLabel : step.label}
                  </span>
                </div>

                {!isLastStep && (
                  <span
                    className={
                      isDone
                        ? 'text-[#6E8BFF] font-light text-lg sm:text-xl pb-6'
                        : 'text-gray-300 font-light text-xl pb-6'
                    }
                  >
                    ≫
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 하단 이동 버튼 (hideButton이거나 label/handler가 없으면 렌더링하지 않음) */}
        {showButton && (
          <button
            type="button"
            onClick={onButtonClick}
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
            <span className="text-base font-semibold">{buttonLabel}</span>
            <span className="text-xl font-light">&gt;</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
