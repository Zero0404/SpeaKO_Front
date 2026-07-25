import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 에셋 파일 불러오기
import selectBgSvg from '../assets/select-page-background.svg';
import featureScriptSvg from '../assets/feature-script-illustration.svg';
import backgroundGradiantPng from '../assets/background_gradiant.png';

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();

  // 분석(로딩) 화면 전환 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // '평가 시작하기' 버튼 클릭 시 로딩 화면으로 전환
  const handleStartEvaluation = () => {
    setIsAnalyzing(true);
  };

  return (
    <div
      className="min-h-screen w-full font-sans antialiased text-gray-800 flex flex-col justify-between select-none bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: `url(${isAnalyzing ? backgroundGradiantPng : selectBgSvg})`,
      }}
    >
      {/* 상단 GNB (Naver바 제외, SpeaKO 로고) */}
      <header className="w-full max-w-7xl mx-auto px-8 py-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-10">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/coach-view')}
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6C7CFF] to-[#8FA2FF] flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.435 5.176L2.25 21.75l4.693-1.155A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">SpeaKO</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-semibold text-gray-700">
            <a href="#service" className="hover:text-[#5B6CFB] transition-colors">서비스 소개</a>
            <a href="#pricing" className="hover:text-[#5B6CFB] transition-colors">요금 안내</a>
          </nav>
        </div>
        <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#6C7CFF] to-[#8BA1FF] hover:opacity-90 shadow-sm transition-all">
          로그인
        </button>
      </header>

      {/* 1️⃣ [isAnalyzing === false] : 발음 평가 파일 업로드 화면 */}
      {!isAnalyzing ? (
        <main className="flex-1 w-full flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-4xl bg-white/85 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white/60 flex flex-col items-start mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">발음 평가</h2>
              <p className="text-sm text-gray-500">음성 파일을 업로드해주세요.</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".mp3,.wav,.m4a"
              className="hidden"
            />

            {/* 파일 드래그 앤 드롭 / 클릭 상자 (그라데이션 효과) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full py-12 px-6 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${
                isDragging
                  ? 'border-[#5B6CFB] bg-[#5B6CFB]/10 scale-[1.01]'
                  : 'border-[#78A5FA]/40 bg-[#F5F8FF]/80 hover:border-[#5B6CFB] hover:bg-gradient-to-br hover:from-[#5B6CFB]/5 hover:to-[#78A5FA]/10'
              }`}
            >
              {/* 센터 에셋 일러스트 */}
              <img
                src={featureScriptSvg}
                alt="Feature Script Illustration"
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-4 transform group-hover:scale-105 transition-transform duration-300"
              />

              <p className="text-lg font-bold text-gray-800 mb-1 text-center">
                {selectedFile ? selectedFile.name : '파일을 여기에 끌어다 놓거나 클릭하세요'}
              </p>
              <p className="text-xs text-gray-500 mb-6 text-center">
                음성 파일 선택 (MP3 / WAV / M4A) · 최대 20MB
              </p>

              {/* 파일 선택 버튼 (그라데이션) */}
              <button
                type="button"
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#6C7CFF] to-[#8BA1FF] shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>파일 선택</span>
              </button>
            </div>
          </div>

          {/* 하단 평가 시작하기 버튼 (평소: 흰색 / 마우스 커서 올라갔을 때: 그라데이션) */}
          <div className="w-full max-w-4xl flex justify-end">
            <button
              onClick={handleStartEvaluation}
              className="group py-3.5 px-8 rounded-2xl text-base font-bold shadow-md border border-gray-200 transition-all duration-300 flex items-center space-x-2 bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#6C7CFF] hover:to-[#8BA1FF] hover:text-white hover:border-transparent hover:shadow-xl active:scale-95"
            >
              <span>평가 시작하기</span>
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </main>
      ) : (
        /* 2️⃣ [isAnalyzing === true] : 녹음 파일 분석/로딩 화면 */
        <main className="flex-1 w-full flex flex-col justify-center items-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto my-auto space-y-8">
            {/* 로딩 스피너 */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-2">
              <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-[#6C7CFF] animate-spin"></div>
            </div>

            {/* 문구 영역 */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                녹음 파일을 분석하고 있어요
              </h1>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                사용자님의 음성을 분석하여 발음 피드백을 생성하는 중입니다.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
              </p>
            </div>

            {/* 단계별 스텝퍼 (1번, 2번 상자 그라데이션 적용) */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-6 pt-6">
              {/* 1번: 오디오 업로드 (그라데이션) */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6C7CFF] to-[#8BA1FF] text-white flex items-center justify-center font-bold text-base shadow-md">
                  1
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">오디오 업로드</span>
              </div>

              <div className="text-[#8BA1FF] pb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>

              {/* 2번: 음성 인식 (숫자 2로 수정 & 그라데이션) */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6C7CFF] to-[#8BA1FF] text-white flex items-center justify-center font-bold text-base shadow-md">
                  2
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">음성 인식</span>
              </div>

              <div className="text-[#8BA1FF] pb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>

              {/* 3번: 코칭 분석 중 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-[#6C7CFF] animate-spin flex items-center justify-center bg-white shadow-sm"></div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">코칭 분석 중</span>
              </div>

              <div className="text-gray-300 pb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>

              {/* 4번: 완료 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-400 bg-white flex items-center justify-center font-semibold text-base">
                  4
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-400">완료</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 푸터 */}
      <footer className="w-full text-center py-4 text-xs text-gray-400 z-20">
        © SpeaKO. All rights reserved.
      </footer>
    </div>
  );
};

export default FeedbackPage;