import React, { useState, useEffect } from 'react';

// Step 타입 정의 (1단계 ~ 4단계)
type Step = 1 | 2 | 3 | 4;

const LoadingPage: React.FC = () => {
  // 현재 진행 중인 단계를 관리하는 State (기본값: 1단계)
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // --------------------------------------------------------------------------
  // [실제 백엔드 연동 영역예시]
  // 백엔드가 신호를 줄 때 
  // 아래처럼 setCurrentStep을 업데이트해 줍니다.
  // --------------------------------------------------------------------------
  useEffect(() => {
    /* // 예시: SSE(Server-Sent Events)로 백엔드 진행상황 수신 시
    const eventSource = new EventSource('/api/script-progress');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data); // 예: { step: 2 }
      if (data.step >= 1 && data.step <= 4) {
        setCurrentStep(data.step as Step);
      }
    };
    return () => eventSource.close();
    */
  }, []);

  // 각 단계에 들어갈 정보 배열
  const steps = [
    { number: 1, title: '파일 수령' },
    { number: 2, title: '텍스트 추출' },
    { number: 3, title: '대본 작성 중' },
    { number: 4, title: '완료' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F8FAFC] text-[#08060d] font-sans overflow-auto min-w-[1280px]">
     
      {/* 2. 중앙 메인 로딩 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* 회전 스피너 */}
        <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
          <div className="w-full h-full border-4 border-[#aa3bff]/20 border-t-[#aa3bff] rounded-full animate-spin" />
        </div>

        {/* Dynamic Title & Subtitle */}
        <h2 className="text-3xl font-bold text-[#08060d] mb-4">
          {currentStep === 4 ? '대본 생성이 완료되었습니다!' : 'AI가 대본을 생성하고 있어요'}
        </h2>
        <p className="text-base text-[#6b6375] max-w-lg leading-relaxed mb-2">
          슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다.
        </p>
        <p className="text-sm text-[#aa3bff] font-medium">
          잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
        </p>
      </main>

      {/* 3. 하단 4단계 프로세스 바 */}
      <footer className="border-t border-[#e5e4e7] bg-white py-10 px-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <React.Fragment key={step.number}>
                {/* 단계 아이콘 및 텍스트 */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#aa3bff] text-white ring-4 ring-[#aa3bff]/20'
                        : isCompleted
                        ? 'bg-[#aa3bff]/10 text-[#aa3bff] border border-[#aa3bff]'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {/* 진행 중인 단계에 회전 효과를 주고 싶다면 스피너 추가 가능 */}
                    {isCurrent ? (
                      <span className="animate-pulse">{step.number}</span>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`font-semibold text-base ${
                      isCurrent
                        ? 'text-[#aa3bff]'
                        : isCompleted
                        ? 'text-[#08060d]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {/* 단계 구분 화살표 (마지막 단계 제외) */}
                {index < steps.length - 1 && (
                  <span
                    className={`text-xl font-bold transition-colors ${
                      step.number < currentStep ? 'text-[#aa3bff]' : 'text-gray-300'
                    }`}
                  >
                    ≫
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </footer>

      {/* 4. [프론트 단독 테스트용 디버그 컨트롤러] */}
      {/* 백엔드 없이 버튼을 눌러 단계 변환을 눈으로 확인할 수 있습니다. */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur border border-gray-300 p-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
        <span className="text-xs font-bold text-gray-500 mr-1">단계 테스트:</span>
        {([1, 2, 3, 4] as Step[]).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentStep(num)}
            className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
              currentStep === num
                ? 'bg-[#aa3bff] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {num}단계
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoadingPage;