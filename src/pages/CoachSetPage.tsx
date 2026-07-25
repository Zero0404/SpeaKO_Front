import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 에셋 파일 불러오기 (프로젝트 내 에셋 경로에 맞게 확인해 주세요)
import bgSvg from '../assets/select-page-background.svg';
import featureIllustration from '../assets/feature-script-illustration.svg';
import bgGradient from '../assets/background_gradiant.png';

export const CoachSetPage: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [file, setFile] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  // [발음 코칭 받기] 버튼 클릭 시 로딩 화면 띄우기
  const handleStartCoach = () => {
    if (!file && !scriptText.trim()) {
      alert('파일을 업로드하거나 대본을 입력해 주세요.');
      return;
    }
    setIsLoading(true);
  };

  // 로딩 화면 시작 후 5초 뒤에 CoachViewPage로 이동
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        navigate('/coach-view');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, navigate]);

  // =========================================================
  // 1. [발음 코칭 받기] 클릭 시 표시되는 로딩 화면 (배경 + 위젯)
  // =========================================================
  if (isLoading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat font-sans select-none overflow-hidden"
        style={{
          backgroundImage: `url(${bgGradient})`,
          backgroundColor: '#F8FAFC',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          
          {/* 1) 회전 스피너 (rgba(91, 108, 251, 1)) */}
          <div className="relative flex items-center justify-center mb-10">
            <div
              className="w-20 h-20 rounded-full border-[5px] border-gray-200/80 border-t-transparent animate-spin"
              style={{
                borderTopColor: 'rgba(91, 108, 251, 1)',
                borderRightColor: 'rgba(91, 108, 251, 0.8)',
              }}
            />
          </div>

          {/* 2) 타이틀 & 설명 문구 */}
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

          {/* 3) 하단 4단계 위젯 (텍스트 분석 = 2 적용) */}
          <div className="flex items-center justify-center gap-6">
            
            {/* Step 1: 대본 로드 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <span className="text-sm font-bold text-gray-900 mt-1">대본 로드</span>
            </div>

            <span className="text-[#6E8BFF] font-light text-xl pb-6">≫</span>

            {/* Step 2: 텍스트 분석 (숫자 2) */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <span className="text-sm font-bold text-gray-900 mt-1">텍스트 분석</span>
            </div>

            <span className="text-[#6E8BFF] font-light text-xl pb-6">≫</span>

            {/* Step 3: 하이라이팅 중 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin flex items-center justify-center" />
              <span className="text-sm font-bold text-gray-900 mt-1">하이라이팅 중</span>
            </div>

            <span className="text-gray-300 font-light text-xl pb-6">≫</span>

            {/* Step 4: 완료 */}
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
  }

  // =========================================================
  // 2. 대본 설정 및 파일 업로드 화면 (평소 화면)
  // =========================================================
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat font-sans overflow-x-hidden"
      style={{
        backgroundImage: `url(${bgSvg})`,
        backgroundColor: '#F3F4F6',
      }}
    >
      <div className="flex flex-col items-start">
        {/* 상단 스텝 배너 (1cm 위 배치) */}
        <div className="flex items-center gap-6 mb-8 pl-4 select-none">
          {/* 1번 동그라미: 항상 그라데이션 유지 */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-base shadow-sm">
              1
            </div>
            <span className="font-bold text-gray-900 text-base">코칭 대본 업로드</span>
          </div>

          <span className="text-gray-400 font-light text-lg">≫</span>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-gray-400 text-gray-500 font-medium flex items-center justify-center text-base">
              2
            </div>
            <span className="font-medium text-gray-500 text-base">실시간 발음 코칭</span>
          </div>

          <span className="text-gray-400 font-light text-lg">≫</span>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-gray-400 text-gray-500 font-medium flex items-center justify-center text-base">
              3
            </div>
            <span className="font-medium text-gray-500 text-base">코칭 리포트</span>
          </div>
        </div>

        {/* 메인 박스 (1520px x 670px) + 오른쪽 아래 버튼 */}
        <div className="flex flex-col items-end gap-6">
          <main
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 flex flex-col justify-between box-border"
            style={{ width: '1520px', height: '670px' }}
          >
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">발음 코칭 대본 설정</h1>
              <p className="text-sm text-gray-400">연습할 대본을 넣고 스피치 가이드라인을 세팅하세요.</p>
            </div>

            <div className="flex justify-between items-center w-full">
              {/* 좌측: 파일 업로드 상자 (530px x 472px) */}
              <div
                onClick={handleBoxClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ width: '530px', height: '472px' }}
                className={`rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 cursor-pointer box-border relative ${
                  isDragging
                    ? 'border-[#7A5CFF] bg-indigo-50/50'
                    : 'border-indigo-200 bg-[#F8FAFF] hover:bg-indigo-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".docx,.txt,.pdf,.ppt,.pptx"
                  className="hidden"
                />

                <div className="w-36 h-36 mb-4 flex items-center justify-center">
                  <img
                    src={featureIllustration}
                    alt="Feature Script Illustration"
                    className="w-full h-full object-contain"
                  />
                </div>

                {file ? (
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-[#7A5CFF] mt-1">클릭하여 다른 파일로 변경</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-gray-800">
                      파일을 여기에 끌어다 놓거나 클릭하세요
                    </p>
                    <p className="text-xs text-gray-400">
                      DOCX, TXT, PDF 지원 · 최대 20MB
                    </p>
                    {/* [파일 선택] 버튼: 항상 그라데이션 유지 */}
                    <button
                      type="button"
                      className="mt-4 px-8 py-3 bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>↑</span>
                      <span>파일 선택</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 우측: 대본 입력 상자 (882px x 472px) */}
              <div
                style={{ width: '882px', height: '472px' }}
                className="border border-gray-300 rounded-2xl p-6 bg-white box-border focus-within:border-[#7A5CFF] transition-colors"
              >
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="발표 연습을 진행할 대본 전체를 입력하거나 붙여넣기 해주세요."
                  className="w-full h-full resize-none outline-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed"
                />
              </div>
            </div>
          </main>

          {/* 오른쪽 아래 버튼: 평소 흰색+회색글씨 ➔ 호버/클릭 시 그라데이션+흰글씨 */}
          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={handleStartCoach}
              className="px-10 py-4 bg-white text-gray-500 font-semibold text-base rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#6E8BFF] hover:to-[#7A5CFF] hover:text-white hover:border-transparent hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-4 cursor-pointer"
            >
              <span>발음 코칭 받기</span>
              <span className="text-lg font-light">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachSetPage;