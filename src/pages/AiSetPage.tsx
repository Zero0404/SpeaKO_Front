import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 에셋 파일 로드
import bgSvg from '../assets/select-page-background.svg';
import scriptIllustration from '../assets/feature-script-illustration.svg';
import bgGradient from '../assets/background_gradiant.png'; // 로딩 페이지용 배경 이미지

interface AiSetPageProps {
  onNext?: () => void;
}

export const AiSetPage: React.FC<AiSetPageProps> = ({ onNext }) => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('5분');
  const [outline, setOutline] = useState('1. 발표 내용\n2. 설명 대상\n3. 상세한 설명');
  const [style, setStyle] = useState<'formal' | 'casual'>('formal');
  const [file, setFile] = useState<File | null>(null);

  // 상태 관리: 모달 팝업 및 로딩 화면 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // 로딩 화면 상태
  const [errorMessage, setErrorMessage] = useState('');

  // 5초 타이머: isGenerating이 true가 되면 5초 후 ScriptEditPage 경로('/script-edit')로 이동
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isGenerating) {
      timer = setTimeout(() => {
        setIsGenerating(false);
        if (onNext) onNext();
        navigate('/script-edit');
      }, 5000); // 5000ms = 5초
    }
    return () => clearTimeout(timer);
  }, [isGenerating, navigate, onNext]);

  // 발표 스타일별 동적 추천 문구 데이터
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // 대본 생성 버튼 클릭 시 필수값 검사
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

    setIsModalOpen(true);
  };

  // 모달 상자에서 "네, 맞습니다" 클릭 시 로딩 화면 전환
  const handleConfirmStart = () => {
    setIsModalOpen(false);
    setIsGenerating(true); // 5초 로딩 시작
  };

  // ★ 1. 로딩 페이지 (5초간 노출)
  if (isGenerating) {
    return (
      <div
        className="min-h-screen w-full flex flex-col justify-center items-center font-sans bg-cover bg-center bg-no-repeat relative animate-fadeIn"
        style={{ backgroundImage: `url(${bgGradient})` }}
      >
        <div className="flex flex-col items-center justify-center text-center px-4">
          {/* 상단 원형 로딩 스피너 (요청 색상: rgba(91, 108, 251, 1)) */}
          <div 
            className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin mb-8"
            style={{ borderTopColor: 'rgba(91, 108, 251, 1)' }}
          />

          {/* 타이틀 & 설명 문구 */}
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            AI가 대본을 생성하고 있어요
          </h2>
          <p className="text-sm text-slate-500 mb-1 font-medium">
            슬라이드 내용을 분석하고 슬라이드별 대본을 작성하는 중입니다.
          </p>
          <p className="text-sm text-slate-500 mb-14 font-medium">
            잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
          </p>

          {/* 하단 4단계 진행 스텝 바 */}
          <div className="flex items-center gap-4">
            {/* Step 1: 파일 수령 (그라데이션 지정) */}
            <div className="flex flex-col items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                1
              </span>
              <span className="text-xs font-bold text-slate-800">파일 수령</span>
            </div>

            <span className="text-[#6E8BFF] text-xs font-bold mb-5">≫</span>

            {/* Step 2: 텍스트 추출 (숫자 2 및 그라데이션 지정) */}
            <div className="flex flex-col items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                2
              </span>
              <span className="text-xs font-bold text-slate-800">텍스트 추출</span>
            </div>

            <span className="text-[#6E8BFF] text-xs font-bold mb-5">≫</span>

            {/* Step 3: 대본 작성 중 (진행중 스피너: rgba(91, 108, 251, 1)) */}
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-slate-200 animate-spin"
                style={{ borderTopColor: 'rgba(91, 108, 251, 1)' }}
              />
              <span className="text-xs font-bold text-slate-800">대본 작성 중</span>
            </div>

            <span className="text-slate-300 text-xs font-bold mb-5">≫</span>

            {/* Step 4: 완료 */}
            <div className="flex flex-col items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white border border-slate-300 text-slate-400 text-xs font-bold flex items-center justify-center shadow-sm">
                4
              </span>
              <span className="text-xs font-medium text-slate-400">완료</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ★ 2. 메인 가이드라인 설정 화면
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center py-8 px-6 font-sans bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgSvg})` }}
    >
      <div className="w-full max-w-[1510px] flex flex-col items-center">
        
        {/* 상단 라인: 스텝 바 (좌) + 말풍선 가이드 (우: 329x84) */}
        <div className="w-full flex justify-between items-end mb-2 pl-1 pr-1">
          <div className="flex items-center gap-3 bg-transparent py-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                1
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                자료 업로드 / 가이드라인 입력
              </span>
            </div>

            <span className="text-slate-300 text-xs font-bold">≫</span>

            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-slate-500 text-xs font-bold flex items-center justify-center shadow-sm border border-slate-100">
                2
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-body, #64748b)' }}>
                대본 미리보기
              </span>
            </div>

            <span className="text-slate-300 text-xs font-bold">≫</span>

            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-slate-500 text-xs font-bold flex items-center justify-center shadow-sm border border-slate-100">
                3
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-body, #64748b)' }}>
                대본 생성
              </span>
            </div>
          </div>

          <div 
            className="relative bg-white rounded-2xl border border-red-100 p-3 shadow-sm flex items-center justify-center text-center"
            style={{ width: '329px', height: '84px' }}
          >
            <p className="text-[11px] font-medium text-red-500 leading-snug">
              파일 업로드를 하지 않을 시,<br />
              <span className="font-bold">발표 주제와 가이드라인을 필수</span>로 입력하셔야합니다.
            </p>
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white border-b border-r border-red-100 rotate-45"></div>
          </div>
        </div>

        {/* 메인 2단 패널 (좌: 610x670, 우: 880x670) */}
        <div className="w-full flex flex-wrap lg:flex-nowrap gap-5 justify-center items-center">
          
          {/* 좌측 패널: PPT / PDF 업로드 (610px x 670px) */}
          <div 
            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/80 flex flex-col justify-between"
            style={{ width: '610px', height: '670px' }}
          >
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                PPT / PDF 업로드
              </h2>
              <p className="text-xs mb-6" style={{ color: 'var(--color-text-body, #64748b)' }}>
                슬라이드 파일을 업로드하면 AI가 내용을 분석합니다.
              </p>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative"
                style={{ 
                  borderColor: 'var(--color-brand-light, #a5b4fc)',
                  backgroundColor: 'rgba(165, 180, 252, 0.08)' 
                }}
              >
                <input
                  type="file"
                  accept=".ppt,.pptx,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <img
                  src={scriptIllustration}
                  alt="PPT Upload Illustration"
                  className="w-36 h-36 object-contain mb-6 drop-shadow-sm"
                />

                <p className="text-base font-bold mb-1" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                  {file ? file.name : '파일을 여기에 끌어다 놓거나 클릭하세요'}
                </p>
                <p className="text-xs mb-8" style={{ color: 'var(--color-text-body, #64748b)' }}>
                  PPT, PPTX, PDF 지원 · 최대 20MB
                </p>

                {/* 파일 선택 버튼 (그라데이션 적용) */}
                <button 
                  type="button" 
                  className="px-7 py-3 text-white text-xs font-bold rounded-xl shadow-md pointer-events-none bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF]"
                >
                  {file ? '파일 변경' : '파일 선택'}
                </button>
              </div>
            </div>
          </div>

          {/* 우측 패널: 주제 설정 및 가이드라인 (880px x 670px) */}
          <div 
            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/80 flex flex-col justify-between"
            style={{ width: '880px', height: '670px' }}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                  주제 설정 및 가이드라인
                </h2>
                <p className="text-xs mb-6" style={{ color: 'var(--color-text-body, #64748b)' }}>
                  발표의 핵심 방향과 스타일을 정하는데 도움을 드려요.
                </p>

                {/* 발표 주제 (352x80) & 발표 시간 (408x80) */}
                <div className="flex gap-4 mb-5">
                  <div style={{ width: '352px', height: '80px' }} className="flex flex-col justify-between">
                    <label className="block text-xs font-bold" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                      발표 주제 {!file && <span style={{ color: 'var(--color-brand-primary, #5b6cfb)' }} className="font-medium">(필수)</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="예) AI 기반 발표 코칭 서비스 기획"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className={`w-full h-[48px] px-4 rounded-xl border text-xs focus:outline-none bg-white shadow-sm transition-all ${
                        !file && !topic.trim() && errorMessage ? 'border-red-400' : 'border-slate-200'
                      }`}
                    />
                  </div>

                  <div style={{ width: '408px', height: '80px' }} className="flex flex-col justify-between">
                    <label className="block text-xs font-bold" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                      발표 시간
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-[48px] px-4 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white shadow-sm cursor-pointer"
                    >
                      <option value="3분">3분</option>
                      <option value="5분">5분</option>
                      <option value="10분">10분</option>
                    </select>
                  </div>
                </div>

                {/* 목차/가이드라인 (352x352) & 발표 스타일 서브 세션 */}
                <div className="flex gap-4">
                  <div style={{ width: '352px', height: '352px' }} className="flex flex-col justify-between">
                    <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                      목차 / 가이드라인 {!file && <span style={{ color: 'var(--color-brand-primary, #5b6cfb)' }} className="font-medium">(필수)</span>}
                    </label>
                    <textarea
                      value={outline}
                      onChange={(e) => setOutline(e.target.value)}
                      className={`w-full h-[320px] p-4 rounded-xl border text-xs focus:outline-none bg-white resize-none shadow-sm leading-relaxed ${
                        !file && !outline.trim() && errorMessage ? 'border-red-400' : 'border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col justify-between" style={{ width: '408px', height: '352px' }}>
                    <div>
                      <label className="block text-xs font-bold mb-2" style={{ color: 'var(--color-text-heading, #27272a)' }}>
                        발표 스타일
                      </label>
                      <div className="flex gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => setStyle('formal')}
                          style={{
                            width: '198px',
                            height: '160px',
                            background: style === 'formal'
                              ? 'linear-gradient(135deg, rgba(165, 180, 252, 0.35), rgba(91, 108, 251, 0.2))'
                              : '#ffffff',
                          }}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-center items-center cursor-pointer ${
                            style === 'formal'
                              ? 'border-[#5b6cfb] text-[#5b6cfb] font-bold shadow-sm'
                              : 'border-slate-300 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <svg className={`w-7 h-7 mb-2 ${style === 'formal' ? 'text-[#5b6cfb]' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="block text-xs font-bold mb-1">격식체</span>
                          <span className={`text-[10px] block leading-tight ${style === 'formal' ? 'text-[#5b6cfb]/80' : 'text-slate-500'}`}>
                            공식적이고 전문적인 어조
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStyle('casual')}
                          style={{
                            width: '198px',
                            height: '160px',
                            background: style === 'casual'
                              ? 'linear-gradient(135deg, rgba(165, 180, 252, 0.35), rgba(91, 108, 251, 0.2))'
                              : '#ffffff',
                          }}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-center items-center cursor-pointer ${
                            style === 'casual'
                              ? 'border-[#5b6cfb] text-[#5b6cfb] font-bold shadow-sm'
                              : 'border-slate-300 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <svg className={`w-7 h-7 mb-2 ${style === 'casual' ? 'text-[#5b6cfb]' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="block text-xs font-bold mb-1">편안한 말투</span>
                          <span className={`text-[10px] block leading-tight ${style === 'casual' ? 'text-[#5b6cfb]/80' : 'text-slate-500'}`}>
                            친근하고 자연스러운 대화체
                          </span>
                        </button>
                      </div>
                    </div>

                    <div 
                      style={{ width: '408px', height: '140px' }}
                      className="glass-badge rounded-xl p-4 flex flex-col justify-center"
                    >
                      <p 
                        className="text-xs font-bold mb-2.5 flex items-center gap-1.5"
                        style={{ color: 'var(--color-brand-primary, #5b6cfb)' }}
                      >
                        <svg className="w-4 h-4 text-amber-500 fill-amber-400" viewBox="0 0 24 24">
                          <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7zM9 21a1 1 0 001 1h6a1 1 0 001-1v-1H9v1z" />
                        </svg>
                        <span>이런 상황에 추천해요</span>
                      </p>
                      
                      <ul className="text-xs space-y-2 list-none p-0 m-0">
                        {recommendations[style].map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-slate-600">
                            <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

        {errorMessage && (
          <div className="w-full max-w-[1510px] flex justify-end mt-2 pr-1">
            <p className="text-xs font-bold text-red-500">{errorMessage}</p>
          </div>
        )}

        <div className="w-full flex justify-end items-center gap-4 mt-4">
          <button
            type="button"
            onClick={handleOpenModal}
            style={{ width: '250px', height: '60px' }}
            className="group rounded-2xl bg-[rgba(255,255,255,0.8)] text-[#27272a] hover:bg-gradient-to-r hover:from-[#6E8BFF] hover:to-[#7A5CFF] hover:text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <span>대본 생성하기</span>
            <svg className="w-5 h-5 text-[#27272a] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

      </div>

      {/* 대본 생성 확정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            style={{ width: '410px', height: '292px' }}
            className="bg-white rounded-3xl p-7 shadow-2xl flex flex-col items-center justify-between text-center animate-fadeIn relative"
          >
            <div className="flex flex-col items-center justify-center flex-1 pt-1">
              {/* i 정보 아이콘 (그라데이션 지정) */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                i
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
                발표 주제, 발표 시간, 말투 스타일<br />모두 알맞게 설정하셨습니까?
              </h3>

              <p className="text-xs text-slate-400 font-medium">
                선택 값: {time} / {style === 'formal' ? '격식체' : '편안한 말투'}
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 bg-[#f4f4f5] text-[#71717a] rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                다시 확인하기
              </button>
              {/* 확인 버튼 (그라데이션 지정) */}
              <button
                type="button"
                onClick={handleConfirmStart}
                className="flex-1 py-3.5 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF]"
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