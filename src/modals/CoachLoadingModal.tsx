import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import bgSvg from '../assets/select-page-background.svg';
import bgGradient from '../assets/background_gradiant.png';
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput';

interface AiSetPageProps {
  onNext?: () => void;
}

export const AiSetPage: React.FC<AiSetPageProps> = ({ onNext }) => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('5분');
  const [outline, setOutline] = useState('');
  const [style, setStyle] = useState<'formal' | 'casual'>('formal');
  const [file, setFile] = useState<File | null>(null);

  // 모달 및 전체 화면 로딩 상태 관리
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // 💡 전체 화면 로딩 상태
  const [errorMessage, setErrorMessage] = useState('');

  // Pretendard 폰트 동적 로드
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

  const recommendations = {
    formal: [
      '교수님, 면접관 등 윗사람 앞 발표',
      '공식적인 자리 (학술 발표, 업무 보고 등)',
      '전문성이 중요한 상황',
    ],
    casual: [
      '동아리, 팀원들 간의 캐주얼한 발표',
      '청중과의 소통과 공감이 중요한 상황',
      '친근하고 부드러운 분위기의 유도',
    ],
  };

  // 대본 생성 버튼 클릭 시 필수값 검사 후 확인 모달 열기
  const handleOpenModal = () => {
    setErrorMessage('');

    if (!file) {
      if (!topic.trim()) {
        setErrorMessage('파일 미업로드 시 발표 주제는 필수 입력 항목입니다.');
        return;
      }
      if (!outline.trim()) {
        setErrorMessage('파일 미업로드 시 가이드라인은 필수 입력 항목입니다.');
        return;
      }
    }

    setIsConfirmModalOpen(true);
  };

  // 확인 모달에서 '네, 맞습니다' 클릭 시 전체 로딩 화면으로 전환
  const handleConfirmStart = () => {
    setIsConfirmModalOpen(false);
    setIsGenerating(true); // 💡 모달 창이 아니라 전체 로딩 화면으로 전환
  };

  // 로딩 화면 하단의 [다음 페이지] 버튼 클릭 시 이동
  const handleGoNext = () => {
    setIsGenerating(false);
    if (onNext) onNext();
    navigate('/script-edit');
  };

  const fontStyle = {
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  };

  const defaultBorderStyle = {
    border: '1px solid rgba(128, 136, 146, 1)',
  };

  // =========================================================
  // 1. 전체 화면 로딩 페이지 (모달 창 X, 전체 화면 전환 O)
  // =========================================================
  if (isGenerating) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 bg-cover bg-center bg-no-repeat font-sans select-none overflow-hidden"
        style={{
          ...fontStyle,
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

          {/* 타이틀 & 문구 */}
          <div className="space-y-3 mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-heading)] tracking-tight">
              AI가 대본을 생성하고 있어요
            </h2>
            <p className="text-sm md:text-base font-medium text-[var(--color-text-body)]">
              슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다.
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
            </p>
          </div>

          {/* 4단계 프로세스 위젯 */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
                1
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">파일 수령</span>
            </div>

            <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
                2
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">텍스트 추출</span>
            </div>

            <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin flex items-center justify-center" />
              <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">대본 작성 중</span>
            </div>

            <span className="text-gray-300 font-light text-xl pb-6">≫</span>

            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-400 text-gray-500 font-medium flex items-center justify-center text-xs sm:text-sm">
                4
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-400 mt-1">완료</span>
            </div>
          </div>

          {/* 하단 [다음 페이지] 버튼 */}
          <button
            type="button"
            onClick={handleGoNext}
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
  }

  // =========================================================
  // 2. 대본 설정 및 가이드라인 입력 화면 (평소 화면)
  // =========================================================
  return (
    <div
      style={{ ...fontStyle, backgroundImage: `url(${bgSvg})` }}
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center py-8 md:py-12 px-4 sm:px-6"
    >
      <div className="w-full max-w-[1520px] flex flex-col items-center">

        {/* 1. 상단 스텝 바 & 경고 메시지 상자 */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-[45px] min-h-[38px]">
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-sm"
                style={{ backgroundImage: 'var(--gradient-brand-active)' }}
              >
                1
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                자료 업로드 / 가이드라인 입력
              </span>
            </div>

            <span className="text-slate-300 text-sm font-bold">≫</span>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white text-slate-400 text-sm font-bold flex items-center justify-center shadow-sm border border-slate-200">
                2
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
                대본 미리보기
              </span>
            </div>

            <span className="text-slate-300 text-sm font-bold">≫</span>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white text-slate-400 text-sm font-bold flex items-center justify-center shadow-sm border border-slate-200">
                3
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
                대본 생성
              </span>
            </div>
          </div>

          {/* 경고 상자 */}
          <div className="relative self-end md:self-auto shrink-0">
            <div
              className="bg-white border border-red-100 shadow-sm flex flex-col items-start justify-center box-border relative z-10"
              style={{
                width: '329px',
                height: '68px',
                borderRadius: '12px',
                paddingTop: '16px',
                paddingRight: '20px',
                paddingBottom: '16px',
                paddingLeft: '20px',
              }}
            >
              <p className="text-xs font-medium text-red-500 leading-snug">
                파일 업로드를 하지 않을 시,<br />
                <span className="font-bold">발표 주제와 가이드라인을 필수</span>로 입력하셔야합니다.
              </p>
            </div>

            <div
              className="absolute z-0 pointer-events-none"
              style={{
                width: '32px',
                height: '32px',
                bottom: '-12px',
                right: '24px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 32L0 0H32L16 32Z" fill="white" stroke="#FEE2E2" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. 메인 콘텐츠 2단 배치 */}
        <div className="w-full flex flex-col lg:flex-row justify-center items-center lg:items-start gap-6 lg:gap-[30px]">

          {/* 좌측 패널: PPT / PDF 업로드 */}
          <div
            className="bg-white shadow-lg border border-white/80 flex flex-col items-center justify-center box-border shrink-0 w-full lg:w-[610px] h-auto lg:h-[670px] min-h-[472px]"
            style={{
              borderRadius: '20px',
              padding: '30px 20px',
            }}
          >
            <FileUpload
              type="ppt"
              file={file}
              onFileSelect={(selectedFile) => setFile(selectedFile)}
            />
          </div>

          {/* 우측 패널: 주제 설정 및 가이드라인 */}
          <div
            className="bg-white shadow-lg flex flex-col justify-between box-border shrink-0 w-full lg:w-[880px] h-auto lg:h-[670px]"
            style={{
              borderRadius: '20px',
              paddingTop: '50px',
              paddingRight: '40px',
              paddingBottom: '60px',
              paddingLeft: '40px',
              gap: '28px',
            }}
          >
            <div>
              <h2 className="text-2xl font-bold mb-[12px]" style={{ color: 'var(--color-text-heading)' }}>
                주제 설정 및 가이드라인
              </h2>
              <p className="text-sm mb-[28px]" style={{ color: 'var(--color-text-body)' }}>
                발표의 핵심 방향과 스타일을 정하는데 도움을 드려요.
              </p>

              {/* 내부 위젯 박스 */}
              <div className="flex flex-col justify-between w-full lg:w-[800px] mx-auto gap-6 lg:gap-0 h-auto lg:h-[472px]">
                
                {/* 상단: 발표 주제 + 발표 시간 */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                  <div className="w-full md:w-[352px]">
                    <TextInput
                      label={`발표 주제 ${!file ? '(필수)' : ''}`}
                      value={topic}
                      onChange={(value) => setTopic(value)}
                      placeholder="예) AI 기반 발표 코칭 서비스 기획"
                    />
                  </div>

                  <div className="w-full md:w-auto">
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                      발표 시간
                    </label>
                    <div className="relative w-full md:w-[408px] h-[50px]">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
                        </svg>
                      </div>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={defaultBorderStyle}
                        className="w-full md:w-[408px] h-[50px] pl-12 pr-10 rounded-xl text-sm font-medium bg-white focus:outline-none cursor-pointer appearance-none shadow-sm"
                      >
                        <option value="3분">3분</option>
                        <option value="5분">5분</option>
                        <option value="10분">10분</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단: 목차/가이드라인 + 발표 스타일 & 추천 상자 */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
                  <div className="w-full md:w-[352px] h-[220px] md:h-[322px]">
                    <TextInput
                      label={`목차 / 가이드라인 ${!file ? '(필수)' : ''}`}
                      value={outline}
                      onChange={(value) => setOutline(value)}
                      placeholder="1. 발표 내용&#10;2. 설명 대상&#10;3. 상세한 설명"
                    />
                  </div>

                  <div className="flex flex-col justify-between w-full md:w-[408px] h-auto md:h-[352px] gap-4 md:gap-0">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                        발표 스타일
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStyle('formal')}
                          style={style === 'formal' ? {} : defaultBorderStyle}
                          className={`flex-1 md:flex-none w-full md:w-[198px] h-[160px] rounded-[16px] transition-all flex flex-col justify-center items-center cursor-pointer p-4 ${
                            style === 'formal'
                              ? 'border-[#5b6cfb] border bg-[#EEF2FF] shadow-sm'
                              : 'bg-white hover:border-slate-400'
                          }`}
                        >
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                            style={{ backgroundColor: 'rgba(159, 160, 253, 0.25)' }}
                          >
                            <svg className="w-5 h-5" style={{ color: 'rgba(91, 108, 251, 1)' }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                            </svg>
                          </div>
                          <span className={`text-sm font-bold mb-1 ${style === 'formal' ? 'text-[#4338CA]' : 'text-slate-800'}`}>
                            격식체
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal leading-tight text-center">
                            공식적이고 전문적인<br />어조의 발표
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStyle('casual')}
                          style={style === 'casual' ? {} : defaultBorderStyle}
                          className={`flex-1 md:flex-none w-full md:w-[198px] h-[160px] rounded-[16px] transition-all flex flex-col justify-center items-center cursor-pointer p-4 ${
                            style === 'casual'
                              ? 'border-[#5b6cfb] border bg-[#EEF2FF] shadow-sm'
                              : 'bg-white hover:border-slate-400'
                          }`}
                        >
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                            style={{ backgroundColor: 'rgba(159, 160, 253, 0.25)' }}
                          >
                            <svg className="w-5 h-5" style={{ color: 'rgba(91, 108, 251, 1)' }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                            </svg>
                          </div>
                          <span className={`text-sm font-bold mb-1 ${style === 'casual' ? 'text-[#4338CA]' : 'text-slate-800'}`}>
                            편안한 말투
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal leading-tight text-center">
                            친근하고 자연스러운<br />대화체 발표
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full md:w-[408px] h-[150px] bg-[#F5F7FF] rounded-[16px] p-4 flex flex-col justify-center">
                      <p className="text-sm font-bold mb-2.5 flex items-center gap-2 text-[#4f46e5]">
                        <svg className="w-4 h-4 text-[#4f46e5] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-1.26C17.81 14.47 19 12.38 19 10a7 7 0 00-7-7z" />
                        </svg>
                        <span>이런 상황에 추천해요</span>
                      </p>
                      <ul className="text-xs space-y-2 list-none p-0 m-0">
                        {recommendations[style].map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-slate-600">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 하단 대본 생성하기 버튼 */}
        <div className="w-full flex flex-col items-end mt-6">
          {errorMessage && (
            <p className="text-xs font-bold text-red-500 mb-2">{errorMessage}</p>
          )}
          <button
            type="button"
            onClick={handleOpenModal}
            className="hover-effect-btn is-active flex items-center justify-between shadow-lg hover:shadow-xl transition-all cursor-pointer"
            style={{
              width: '250px',
              height: '60px',
              borderRadius: '16px',
              paddingTop: '16px',
              paddingRight: '20px',
              paddingBottom: '16px',
              paddingLeft: '20px',
            }}
          >
            <span className="text-base font-bold">대본 생성하기</span>
            <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>

      {/* 확인 모달 팝업 */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white p-7 flex flex-col items-center justify-between text-center box-border animate-fadeIn relative shadow-2xl rounded-[20px]"
            style={{
              width: '410px',
              height: '292px',
              gap: '24px',
            }}
          >
            <div className="flex flex-col items-center justify-center flex-1 pt-1">
              <div
                className="w-12 h-12 rounded-full text-white flex items-center justify-center mb-3 shadow-sm shrink-0"
                style={{ backgroundColor: 'rgba(91, 108, 251, 1)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="white" />
                </svg>
              </div>

              <h3 className="text-lg font-bold leading-snug mb-2" style={{ color: 'var(--color-text-heading)' }}>
                발표 주제, 발표 시간, 말투 스타일<br />모두 알맞게 설정하셨습니까?
              </h3>

              <p
                style={{
                  fontFamily: 'Pretendard, -apple-system, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '140%',
                  letterSpacing: '-0.025em',
                  textAlign: 'center',
                  color: 'var(--color-text-body)',
                }}
              >
                선택 값: {time} / {style === 'formal' ? '격식체' : '편안한 말투'}
              </p>
            </div>

            <div className="flex justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                style={{ width: '150px', height: '40px' }}
                className="bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-200"
              >
                다시 확인하기
              </button>
              <button
                type="button"
                onClick={handleConfirmStart}
                style={{ width: '150px', height: '40px' }}
                className="hover-effect-btn is-active text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center"
              >
                네, 맞습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSetPage;