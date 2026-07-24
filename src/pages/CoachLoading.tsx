import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgGradient from '../assets/background_gradiant.png';

export const CoachLoadingPage: React.FC = () => {
  const navigate = useNavigate();

  // [다음 페이지로 이동] 버튼 클릭 시
  const handleNavigateNext = () => {
    navigate('/coach-view');
  };

  // 5초 뒤 자동 이동 (백엔드 연동 및 테스트용)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleNavigateNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 bg-cover bg-center bg-no-repeat font-sans select-none overflow-hidden"
      style={{
        backgroundImage: `url(${bgGradient})`,
        backgroundColor: '#F8FAFC',
      }}
    >
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full px-4">
        {/* 회전 스피너 */}
        <div className="relative flex items-center justify-center mb-8 md:mb-10">
          <div
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[5px] border-gray-200/80 border-t-transparent animate-spin"
            style={{
              borderTopColor: 'rgba(91, 108, 251, 1)',
              borderRightColor: 'rgba(91, 108, 251, 0.8)',
            }}
          />
        </div>

        {/* 타이틀 & 설명 문구 */}
        <div className="space-y-3 mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-heading)] tracking-tight">
            발음 하이라이팅을 적용하고 있어요
          </h2>
          <p className="text-sm md:text-base font-medium text-[var(--color-text-body)]">
            생성된 대본에서 정확한 발음 가이드를 분석 중입니다.
          </p>
          <p className="text-xs md:text-sm text-gray-400">
            잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
          </p>
        </div>

        {/* 하단 4단계 프로세스 위젯 */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
              1
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">대본 로드</span>
          </div>

          <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
              2
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">텍스트 분석</span>
          </div>

          <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin flex items-center justify-center" />
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">하이라이팅 중</span>
          </div>

          <span className="text-gray-300 font-light text-xl pb-6">≫</span>

          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-400 text-gray-500 font-medium flex items-center justify-center text-xs sm:text-sm">
              4
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-400 mt-1">완료</span>
          </div>
        </div>

        {/* 하단 [다음 페이지로 이동] 버튼 */}
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
          <span className="text-base font-semibold">다음 페이지로 이동</span>
          <span className="text-xl font-light">&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default CoachLoadingPage;