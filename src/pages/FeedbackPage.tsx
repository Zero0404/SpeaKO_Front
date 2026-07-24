import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import bgSvg from '../assets/select-page-background.svg';
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput';

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();

  // 음성 파일 및 대본 상태
  const [file, setFile] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pretendard 폰트 로드
  useEffect(() => {
    const fontId = 'pretendard-font-cdn';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css';
      document.head.appendChild(link);
    }
  }, []);

  // [피드백 받기] 버튼 클릭 시 로딩 페이지로 이동
  const handleStartFeedback = () => {
    setErrorMessage('');

    // 파일이나 대본 중 최소 하나 이상 필요
    if (!file && !scriptText.trim()) {
      setErrorMessage('음성 파일 업로드 또는 대본 입력 중 하나는 필수입니다.');
      return;
    }

    // 피드백 로딩 페이지로 라우팅 이동
    navigate('/feedback-loading');
  };

  const fontStyle = {
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  };

  return (
    <div
      style={{ ...fontStyle, backgroundImage: `url(${bgSvg})` }}
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center py-8 md:py-12 px-4 sm:px-6"
    >
      <div className="w-full max-w-[1520px] flex flex-col items-center">

        {/* 1. 상단 스텝 바 */}
        <div className="w-full flex justify-start items-center mb-6">
          <div className="flex items-center gap-3 sm:gap-[45px] min-h-[38px]">
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-sm"
                style={{ backgroundImage: 'var(--gradient-brand-active, linear-gradient(135deg, #6E8BFF, #7A5CFF))' }}
              >
                1
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-heading, #27272A)' }}>
                음성 파일 / 대본 입력
              </span>
            </div>

            <span className="text-slate-300 text-sm font-bold">≫</span>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white text-slate-400 text-sm font-bold flex items-center justify-center shadow-sm border border-slate-200">
                2
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-body, #64748B)' }}>
                피드백 분석
              </span>
            </div>

            <span className="text-slate-300 text-sm font-bold">≫</span>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white text-slate-400 text-sm font-bold flex items-center justify-center shadow-sm border border-slate-200">
                3
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-body, #64748B)' }}>
                리포트 확인
              </span>
            </div>
          </div>
        </div>

        {/* 2. 메인 2단 패널 레이아웃 */}
        <div className="w-full flex flex-col lg:flex-row justify-center items-center lg:items-start gap-6 lg:gap-[30px]">

          {/* 좌측 패널: 음성 파일 업로드 (FileUpload 컴포넌트 사용) */}
          <div
            className="bg-white shadow-lg flex flex-col justify-start box-border shrink-0 w-full lg:w-[610px] h-auto lg:h-[670px]"
            style={{
              borderRadius: '20px',
              paddingTop: '50px',
              paddingRight: '40px',
              paddingBottom: '60px',
              paddingLeft: '40px',
            }}
          >
            <h2 className="text-2xl font-bold mb-[12px]" style={{ color: 'var(--color-text-heading, #27272A)' }}>
              음성 파일 업로드
            </h2>
            <p className="text-sm mb-[28px]" style={{ color: 'var(--color-text-body, #64748B)' }}>
              발표 녹음 파일(MP3, WAV, M4A)을 업로드하면 AI가 정밀 분석합니다.
            </p>

            <div className="flex-1 flex flex-col items-center justify-center">
              <FileUpload
                type="mp3"
                file={file}
                maxSizeMB={20}
                onFileSelect={(selectedFile) => {
                  setErrorMessage('');
                  setFile(selectedFile);
                }}
                onError={(msg) => setErrorMessage(msg)}
              />
            </div>
          </div>

          {/* 우측 패널: 대본 직접 입력 (TextInput 컴포넌트 사용) */}
          <div
            className="bg-white shadow-lg flex flex-col justify-start box-border shrink-0 w-full lg:w-[880px] h-auto lg:h-[670px]"
            style={{
              borderRadius: '20px',
              paddingTop: '50px',
              paddingRight: '40px',
              paddingBottom: '60px',
              paddingLeft: '40px',
            }}
          >
            <h2 className="text-2xl font-bold mb-[12px]" style={{ color: 'var(--color-text-heading, #27272A)' }}>
              발표 대본 입력
            </h2>
            <p className="text-sm mb-[28px]" style={{ color: 'var(--color-text-body, #64748B)' }}>
              음성 분석의 정확도를 높이기 위해 발표 대본 텍스트를 함께 입력해 주세요.
            </p>

            <div className="w-full flex-1">
              <TextInput
                label="대본 텍스트"
                value={scriptText}
                onChange={(val) => {
                  setErrorMessage('');
                  setScriptText(val);
                }}
                placeholder="발표하실 대본 내용을 여기에 붙여넣거나 입력하세요..."
              />
            </div>
          </div>

        </div>

        {/* 3. 하단 피드백 받기 버튼 */}
        <div className="w-full flex flex-col items-end mt-6">
          {errorMessage && (
            <p className="text-xs font-bold text-red-500 mb-2">{errorMessage}</p>
          )}
          <button
            type="button"
            onClick={handleStartFeedback}
            className="flex items-center justify-between shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white text-slate-500 hover:text-white border border-slate-200 hover:border-transparent group"
            style={{
              width: '250px',
              height: '60px',
              borderRadius: '16px',
              paddingTop: '16px',
              paddingRight: '20px',
              paddingBottom: '16px',
              paddingLeft: '20px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-brand-active, linear-gradient(90deg, #6E8BFF 0%, #7A5CFF 100%))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <span className="text-base font-bold transition-colors group-hover:text-white">
              피드백 받기
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