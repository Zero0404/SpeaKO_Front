import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import bgSvg from '../assets/select-page-background.svg';
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput';
import SetModal from '../modals/SetModal';

export interface AiSetPageProps {
  onNext?: () => void;
}

export const AiSetPage: React.FC<AiSetPageProps> = ({ onNext }) => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('5분');
  const [outline, setOutline] = useState('');
  const [style, setStyle] = useState<'formal' | 'casual'>('formal');
  const [file, setFile] = useState<File | null>(null);

  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSubmittedWithoutFile, setHasSubmittedWithoutFile] = useState(false);

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

  const handleOpenModal = () => {
    setErrorMessage('');

    if (!file) {
      setHasSubmittedWithoutFile(true);
      if (!topic.trim()) {
        setErrorMessage('파일 미업로드 시 발표 주제는 필수 입력 항목입니다.');
        return;
      }
      if (!outline.trim()) {
        setErrorMessage('파일 미업로드 시 가이드라인은 필수 입력 항목입니다.');
        return;
      }
    } else {
      setHasSubmittedWithoutFile(false);
    }

    setIsSetModalOpen(true);
  };

  const handleConfirmStart = () => {
    setIsSetModalOpen(false);
    if (onNext) onNext();
    navigate('/ai-loading');
  };

  const fontStyle = {
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  };

  const defaultBorderStyle = {
    border: '1px solid rgba(128, 136, 146, 1)',
  };

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
            className="bg-white shadow-lg flex flex-col justify-start box-border shrink-0 w-full lg:w-[610px] h-auto lg:h-[670px]"
            style={{
              borderRadius: '20px',
              paddingTop: '50px',
              paddingRight: '40px',
              paddingBottom: '60px',
              paddingLeft: '40px',
            }}
          >
            <h2 className="text-2xl font-bold mb-[12px]" style={{ color: 'var(--color-text-heading)' }}>
              PPT / PDF 업로드
            </h2>
            <p className="text-sm mb-[28px]" style={{ color: 'var(--color-text-body)' }}>
              슬라이드 파일을 업로드하면 AI가 내용을 분석합니다.
            </p>

            <div className="flex-1 flex flex-col items-center justify-center">
              <FileUpload
                type="ppt"
                file={file}
                maxSizeMB={20}
                onFileSelect={(selectedFile) => {
                  setErrorMessage('');
                  setFile(selectedFile);
                  setHasSubmittedWithoutFile(false);
                }}
                onError={(msg) => {
                  setErrorMessage(msg);
                }}
              />
            </div>
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
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                      발표 주제 <span className="font-bold text-[#5B6CFB]" style={{ color: 'var(--color-primary-500, #5B6CFB)' }}>(필수)</span>
                    </label>
                    <div
                      style={{
                        width: '352px',
                        height: '50px',
                        borderRadius: '12px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: hasSubmittedWithoutFile && !file && !topic.trim() ? 'rgba(255, 118, 118, 1)' : 'rgba(128, 136, 146, 1)',
                        paddingTop: '10px',
                        paddingRight: '20px',
                        paddingBottom: '10px',
                        paddingLeft: '20px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      className="bg-white shadow-sm box-border overflow-hidden [&>div]:w-full [&_input]:w-full [&_input]:border-0 [&_input]:p-0 [&_input]:bg-transparent"
                    >
                      <TextInput
                        label=""
                        type="text"
                        value={topic}
                        onChange={(value) => setTopic(value)}
                        placeholder="예) AI 기반 발표 코칭 서비스 기획"
                      />
                    </div>
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
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0">
                  <div className="w-full md:w-[352px]">
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                      목차 / 가이드라인
                    </label>
                    <textarea
                      value={outline}
                      onChange={(e) => setOutline(e.target.value)}
                      placeholder={'1. 발표 내용\n2. 설명 대상\n3. 상세한 설명'}
                      style={defaultBorderStyle}
                      className="w-full h-[322px] p-4 rounded-2xl text-sm font-medium bg-white resize-none focus:outline-none leading-relaxed shadow-sm placeholder:text-slate-400"
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
          <button
            type="button"
            onClick={handleOpenModal}
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
              대본 생성하기
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

      {/* SetModal 호출 */}
      <SetModal
        isOpen={isSetModalOpen}
        onRecheck={() => setIsSetModalOpen(false)}
        onConfirm={handleConfirmStart}
        time={time}
        tone={style == 'casual' ? '편안한 말투' : '격식체'}
      />
    </div>
  );
};

export default AiSetPage;