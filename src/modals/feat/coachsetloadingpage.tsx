import React, { useState } from 'react';

interface LoadingModalProps {
  isOpen?: boolean;
}

export default function LoadingModal({ isOpen = true }: LoadingModalProps) {
  // 백엔드 신호 상태 (1단계 ~ 4단계)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 단계별 안내 메시지
  const stepMessages: Record<number, string> = {
    1: '1단계: 학습 데이터를 수신 및 검증하고 있습니다...',
    2: '2단계: AI 맞춤형 분석을 진행하고 있습니다...',
    3: '3단계: 학습 결과 데이터를 생성 중입니다...',
    4: '4단계: 분석이完了되었습니다! 결과를 불러옵니다.'
  };

  if (!isOpen) return null;

  return (
    // 1. 페이지 전체 배경 (background_gradiant.png 적용 및 중앙 정렬)
    <div 
      className="relative w-screen h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/src/assets/background_gradiant.png')" }}
    >
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 2. 메인 모달 카드 (수치 명세: 800px x 286px 적용) */}
      <div 
        className="relative z-10 w-[800px] h-[286px] rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover-effect-btn glass-icon-box border border-white/80"
        style={{
          boxShadow: '0 20px 50px rgba(91, 108, 251, 0.25)',
        }}
      >
        {/* 상단 헤더 & 단계 뱃지 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">
              AI 분석 진행 중
            </h2>
            <p className="text-sm text-[var(--color-text-body)] mt-1">
              잠시만 기다려주시면 맞춤 결과를 생성해 드립니다.
            </p>
          </div>
          
          {/* Glass Badge 활용 */}
          <span className="glass-badge px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--color-brand-primary)]">
            Step {currentStep} / 4
          </span>
        </div>

        {/* 1~4단계 스텝 프로그레스 바 */}
        <div className="flex items-center justify-between my-2 px-4">
          {[1, 2, 3, 4].map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <React.Fragment key={step}>
                {/* 단계 원형 박스 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCompleted || isCurrent
                        ? 'is-active hover-effect-btn shadow-md scale-105'
                        : 'bg-white/60 text-[var(--color-text-body)] border border-white/80'
                    }`}
                  >
                    {isCompleted ? '✓' : step}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-[var(--color-brand-primary)] font-bold'
                        : 'text-[var(--color-text-body)]'
                    }`}
                  >
                    {step}단계
                  </span>
                </div>

                {/* 연결 선 */}
                {step < 4 && (
                  <div className="flex-1 h-[3px] mx-3 rounded-full bg-slate-200/60 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: step < currentStep ? '100%' : '0%',
                        backgroundColor: 'var(--color-brand-primary)',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 하단 단계 메시지 box */}
        <div className="glass-badge py-2.5 px-4 rounded-xl text-center text-sm font-medium text-[var(--color-text-heading)]">
          {stepMessages[currentStep]}
        </div>

        {/* 🛠️ 개발자용 테스트 컨트롤러 (백엔드 없이 테스트 가능) */}
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-100 shadow-lg">
          <span className="text-xs font-bold text-[var(--color-brand-primary)] mr-1">
            백엔드 가상 테스트:
          </span>
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => setCurrentStep(s)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                currentStep === s
                  ? 'is-active hover-effect-btn'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}단계
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}