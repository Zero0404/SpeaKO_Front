import React from 'react';
import bgSvg from '../assets/select-page-background.svg';

interface FeedbackLoadingPageProps {
  // 백엔드 연동 전까지 화면 전환 테스트가 가능하도록 구성
  onComplete?: () => void;
}

export const FeedbackLoadingPage: React.FC<FeedbackLoadingPageProps> = () => {
  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat font-['Pretendard'] select-none"
      style={{
        backgroundImage: `url(${bgSvg})`,
      }}
    >
      {/* 중앙 로딩 콘텐츠 박스 */}
      <div className="flex flex-col items-center justify-center text-center z-10 px-4">
        {/* 스피너 (회전 애니메이션) */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-[#5B6CFB] animate-spin" />
        </div>

        {/* 안내 타이틀 */}
        <h2
          className="text-[22px] font-bold tracking-tight mb-3"
          style={{ color: 'var(--color-text-heading, #27272a)' }}
        >
          AI가 발표 피드백 리포트를 생성하고 있어요
        </h2>

        {/* 서브 안내 설명 */}
        <p
          className="text-sm font-normal leading-relaxed max-w-md"
          style={{ color: 'var(--color-text-body, #64748b)' }}
        >
          음성 파일과 대본을 분석하여 발음, 속도, 전달력을 종합적으로 평가 중입니다.
          <br />
          잠시만 기다려 주세요. (최대 1~2분 소요될 수 있습니다)
        </p>
      </div>
    </div>
  );
};

export default FeedbackLoadingPage;