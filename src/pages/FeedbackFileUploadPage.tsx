import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgSvg from '../assets/select-page-background.png';
import FileUpload from '../components/FileUpload';
import { recordEvaluation, type EvaluationResult } from '../apis/feedback';

export const FeedbackFileUploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 파일 업로드 여부 확인
  const isFormValid = Boolean(file);

  // [평가 시작하기] 버튼 클릭 시 -> 실제로 서버에 평가 요청을 보낸다.
  const handleStartFeedback = async () => {
    setErrorMessage('');

    if (!file) {
      setErrorMessage('음성 파일을 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // ⚠️ userId는 여전히 1로 고정되어 있습니다 (authStore에 userId 필드가 없어서
      // 실제 로그인 사용자 id를 여기서 가져올 방법이 없습니다 
      // ⚠️ scriptId: 151은 "진짜 값"이 아니라 테스트용 임시 하드코딩입니다.
 
      const result: EvaluationResult = await recordEvaluation({
        userId: 22, // ⚠️ 실제 로그인 사용자 id를 가져올 방법이 없어서 임시로 151로 고정
        scriptId: 199, // ⚠️ 실제 scriptId를 가져올 방법이 없어서 임시로 151로 고정
        file,
      });

      // 피드백 분석 로딩 페이지로 이동. 이미 받아온 실제 평가 결과를 같이 넘겨준다.
      navigate('/feedback-loading', { state: { file, evaluationResult: result } });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '평가 요청 중 오류가 발생했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${bgSvg})` }}
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 font-sans box-border"
    >
      <div className="w-full max-w-[1240px] flex flex-col items-center">

        {/* 메인 평가 카드 패널 (반응형 패딩 및 높이 설정) */}
        <div
          className="bg-white shadow-lg flex flex-col justify-start box-border w-full min-h-[450px] sm:min-h-[520px] md:min-h-[600px] p-6 sm:p-8 md:p-[48px]"
          style={{
            borderRadius: '24px',
          }}
        >
          {/* 타이틀 영역 (화면 폭에 맞춘 반응형 폰트 크기) */}
          <h2
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text-heading, #27272a)' }}
          >
            발음 평가
          </h2>
          <p
            className="text-xs sm:text-sm mb-6 sm:mb-8"
            style={{ color: 'var(--color-text-body, #64748b)' }}
          >
            음성 파일을 업로드해주세요.
          </p>

          {/* 중앙 음성 파일 업로드 영역 및 TextInput 컴포넌트 활용 */}
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-6 overflow-hidden">
            <FileUpload
              type="mp3"
              file={file}
              onFileSelect={(selectedFile) => {
                setErrorMessage('');
                setFile(selectedFile);
              }}
              onError={(message) => setErrorMessage(message)}
            />
          </div>
        </div>

        {/* 하단 평가 시작하기 버튼 (모바일 풀사이즈 / 데스크톱 고정너비 대응) */}
        <div className="w-full flex flex-col items-center sm:items-end mt-6">
          {errorMessage && (
            <p className="text-xs font-bold text-red-500 mb-2 text-center sm:text-right">{errorMessage}</p>
          )}
          <button
            type="button"
            onClick={handleStartFeedback}
            disabled={!isFormValid || isSubmitting}
            style={{
              width: '250px',
              height: '60px',
              borderRadius: '16px',
              paddingTop: '16px',
              paddingRight: '20px',
              paddingBottom: '16px',
              paddingLeft: '20px',
              opacity: 1,
              background: isFormValid ? 'var(--gradient-brand-active)' : 'var(--color-inactive-bg, #f3f4f6)',
              color: isFormValid ? 'var(--color-white, #ffffff)' : '#9CA3AF',
            }}
            className={`group flex items-center justify-between shadow-md transition-all duration-300 box-border border border-slate-200 ${
              isFormValid && !isSubmitting
                ? 'cursor-pointer hover:shadow-xl hover:border-transparent'
                : 'cursor-not-allowed pointer-events-none'
            }`}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.currentTarget.style.background = 'var(--gradient-brand-active)';
                e.currentTarget.style.color = 'var(--color-white)';
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                e.currentTarget.style.background = 'var(--gradient-brand-active)';
                e.currentTarget.style.color = 'var(--color-white)';
              }
            }}
          >
            <span className="text-sm sm:text-base font-bold transition-colors">
              {isSubmitting ? '전송 중...' : '평가 시작하기'}
            </span>
            <svg
              className={`w-5 h-5 transition-colors shrink-0 ${
                isFormValid ? 'text-white group-hover:text-white' : 'text-slate-400'
              }`}
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

export default FeedbackFileUploadPage;
