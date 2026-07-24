import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgSvg from '../assets/background_gradiant.png';
import TextInput from '../components/TextInput';

interface FeedbackLoadingPageProps {
  onComplete?: () => void;
}

export const FeedbackLoadingPage: React.FC<FeedbackLoadingPageProps> = ({ onComplete }) => {
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
      // 추후 제작할 피드백 결과 페이지(예: /feedback-result)로 이동
      navigate('/feedback-result');
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat font-sans select-none px-4 sm:px-6 md:px-8 box-border py-12"
      style={{
        backgroundImage: `url(${bgSvg})`,
      }}
    >
      {/* 메인 컨테이너 */}
      <div className="flex flex-col items-center justify-center text-center z-10 w-full max-w-2xl px-4 sm:px-6">
        
        {/* 1. 상단 회전 스피너 (항상 돌아가는 상태) */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-[3.5px] border-slate-200 border-t-[#5B6CFB] animate-spin" />
        </div>

        {/* 2. 타이틀 */}
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3"
          style={{ color: 'var(--color-text-heading, #27272a)' }}
        >
          녹음 파일을 분석하고 있어요
        </h2>

        {/* 3. 서브 설명 문구 */}
        <p
          className="text-sm sm:text-base font-normal leading-relaxed mb-8 sm:mb-10"
          style={{ color: 'var(--color-text-body, #64748b)' }}
        >
          사용자님의 음성을 분석하여 발음 피드백을 생성하는 중입니다.
          <br />
          잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
        </p>


        {/* 5. 4단계 스텝 위젯 (이미지 시안과 100% 동일한 상태) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-xl mb-12">
          
          {/* STEP 1: 오디오 업로드 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-sm"
              style={{ background: 'var(--gradient-brand-active)' }}
            >
              1
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
              오디오 업로드
            </span>
          </div>

          <span className="text-indigo-400 text-sm font-bold pb-6">≫</span>

          {/* STEP 2: 음성 인식 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-sm"
              style={{ background: 'var(--gradient-brand-active)' }}
            >
              2
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
              음성 인식
            </span>
          </div>

          <span className="text-indigo-400 text-sm font-bold pb-6">≫</span>

          {/* STEP 3: 코칭 분석 중 (스피너 돌아가는 상태) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-200 border-t-[#5B6CFB] animate-spin flex items-center justify-center bg-white shadow-sm" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
              코칭 분석 중
            </span>
          </div>

          <span className="text-slate-300 text-sm font-bold pb-6">≫</span>

          {/* STEP 4: 완료 */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-300 bg-white text-slate-400 text-sm font-medium flex items-center justify-center shadow-sm">
              4
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-400 whitespace-nowrap">
              완료
            </span>
          </div>

        </div>

        {/* 6. 다음 페이지 버튼 */}
        <div className="w-full flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={handleNextPage}
            className="group flex items-center justify-between shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white text-[var(--color-text-heading,#27272a)] hover:text-white border border-slate-200 hover:border-transparent box-border w-full sm:w-[250px] h-[54px] sm:h-[60px] px-5 sm:px-6 rounded-[16px]"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-brand-active)';
              e.currentTarget.style.color = 'var(--color-white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = 'var(--color-text-heading, #27272a)';
            }}
          >
            <span className="text-sm sm:text-base font-bold transition-colors">
              다음 페이지
            </span>
            <svg
              className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeedbackLoadingPage;