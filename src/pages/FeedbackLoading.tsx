import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgGradient from '../assets/background_gradiant.png';

interface FeedbackLoadingProps {
  onComplete?: () => void;
}

export const FeedbackLoading: React.FC<FeedbackLoadingProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지(FeedbackFileUploadPage)에서 전달받은 파일 정보
  const uploadedFile = location.state?.file as File | undefined;

  useEffect(() => {
    // 💡 [백엔드 API 연동 위치]
    // 페이지 진입 시 백엔드로 분석 요청을 보내는 로직을 여기에 작성하시면 됩니다.
    // 예: axios.post('/api/feedback', { file: uploadedFile }).then(...)
  }, [uploadedFile]);

  // [다음 페이지] 버튼 클릭 시 이동 핸들러
  const handleNextPage = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/feedback-result');
    }
  };

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
            녹음 파일을 분석하고 있어요
          </h2>
          <p className="text-sm md:text-base font-medium text-[var(--color-text-body)]">
            사용자님의 음성을 분석하여 발음 피드백을 생성하는 중입니다.
          </p>
          <p className="text-xs md:text-sm text-gray-400">
            잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
          </p>
        </div>

        {/* 하단 4단계 프로세스 위젯 */}
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

          {/* 3단계 - 진행 중 (숫자 없이 회전 링만) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin" />
            <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">코칭 분석 중</span>
          </div>

          <span className="text-gray-300 font-light text-xl pb-6">≫</span>

          {/* 4단계 - 대기 */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-400 text-gray-500 font-medium flex items-center justify-center text-xs sm:text-sm bg-white">
              4
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-400 mt-1">완료</span>
          </div>
        </div>

        {/* 하단 [다음 페이지] 버튼 */}
        <button
          type="button"
          onClick={handleNextPage}
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
          <span className="text-base font-semibold">다음 페이지</span>
          <span className="text-xl font-light">&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackLoading;