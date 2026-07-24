import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgSvg from '../assets/select-page-background.svg';
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput'; // 

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // [평가 시작하기] 버튼 클릭 시
  const handleStartFeedback = () => {
    setErrorMessage('');

    if (!file) {
      setErrorMessage('');
      return;
    }

    // 피드백 분석 로딩 페이지로 이동
    navigate('/feedback-loading');
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
              평가 시작하기
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

export default FeedbackPage;