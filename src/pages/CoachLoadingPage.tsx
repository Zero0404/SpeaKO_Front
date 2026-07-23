import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import bgGradient from '../assets/background_gradiant.png';

export const CoachLoadingPage: React.FC = () => {
  const navigate = useNavigate();

  // 5초 유지 후 코칭 뷰 페이지로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/coach-view');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat font-sans select-none overflow-hidden"
      style={{
        backgroundImage: `url(${bgGradient})`,
        backgroundColor: '#F8FAFC',
      }}
    >
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        {/* 1. 상단 회전 스피너 */}
        <div className="relative flex items-center justify-center mb-10">
          <div
            className="w-20 h-20 rounded-full border-[5px] border-gray-200/80 border-t-transparent animate-spin"
            style={{
              borderTopColor: 'rgba(91, 108, 251, 1)',
              borderRightColor: 'rgba(91, 108, 251, 0.8)',
            }}
          />
        </div>

        {/* 2. 타이틀 & 설명 */}
        <div className="space-y-3 mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            발음 하이라이팅을 적용하고 있어요
          </h2>
          <p className="text-base font-medium text-gray-500">
            생성된 대본에서 정확한 발음 가이드를 분석 중입니다.
          </p>
          <p className="text-sm text-gray-400">
            잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
          </p>
        </div>

        {/* 3. 하단 4단계 위젯 */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-sm shadow-md">
              1
            </div>
            <span className="text-sm font-bold text-gray-900 mt-1">대본 로드</span>
          </div>

          <span className="text-[#6E8BFF] font-light text-xl pb-6">≫</span>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-sm shadow-md">
              1
            </div>
            <span className="text-sm font-bold text-gray-900 mt-1">텍스트 분석</span>
          </div>

          <span className="text-[#6E8BFF] font-light text-xl pb-6">≫</span>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin flex items-center justify-center" />
            <span className="text-sm font-bold text-gray-900 mt-1">하이라이팅 중</span>
          </div>

          <span className="text-gray-300 font-light text-xl pb-6">≫</span>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-gray-400 text-gray-500 font-medium flex items-center justify-center text-sm">
              4
            </div>
            <span className="text-sm font-medium text-gray-400 mt-1">완료</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachLoadingPage;