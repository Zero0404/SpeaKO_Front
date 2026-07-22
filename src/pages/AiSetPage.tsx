import React, { useState } from 'react';
import bgSvg from '../assets/select-page-background.svg';
import scriptIllustration from '../assets/feature-script-illustration.svg';

// png 아이콘 파일들 불러오기
import checkLogo from '../assets/Check_round_fill.png'; 
import GroupIcon from '../assets/Group.png'; 
import Frame12062 from '../assets/Frame 12062.png'; 
import Frame12063 from '../assets/Frame 12063.png'; 

interface AiSetPageProps {
  onNext?: () => void;
}

export const AiSetPage: React.FC<AiSetPageProps> = ({ onNext }) => {
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('5분');
  const [outline, setOutline] = useState('1. 발표 내용\n2. 설명 대상\n3. 상세한 설명');
  const [style, setStyle] = useState<'formal' | 'casual'>('formal');
  const [file, setFile] = useState<File | null>(null);

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

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center py-8 px-6 font-sans bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgSvg})` }}
    >
      {/* 메인 전체 프레임 컨테이너 (610px + 880px + gap 20px = 1510px) */}
      <div className="w-full max-w-[1510px] flex flex-col items-center">
        
        {/* 상단 라인: 스텝 바 (좌측) + 빨간색 말풍선 가이드 (우측 329x84) */}
        <div className="w-full flex justify-between items-end mb-2 pl-1 pr-1">
          {/* 1. PPT/PDF 업로드 상자 바로 위의 투명 스텝 바 (숫자 1, 2, 3) */}
          <div className="flex items-center gap-3 bg-transparent py-1">
            {/* Step 1: 보라색 배경 */}
            <div className="flex items-center gap-2">
              <span 
                className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-sm"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
              >
                1
              </span>
              <span 
                className="text-xs font-bold" 
                style={{ color: 'var(--color-text-heading)' }}
              >
                자료 업로드 / 가이드라인 입력
              </span>
            </div>

            <span className="text-slate-300 text-xs font-bold">≫</span>

            {/* Step 2: 흰색 배경 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-slate-500 text-xs font-bold flex items-center justify-center shadow-sm border border-slate-100">
                2
              </span>
              <span 
                className="text-xs font-medium" 
                style={{ color: 'var(--color-text-body)' }}
              >
                대본 미리보기
              </span>
            </div>

            <span className="text-slate-300 text-xs font-bold">≫</span>

            {/* Step 3: 흰색 배경 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-slate-500 text-xs font-bold flex items-center justify-center shadow-sm border border-slate-100">
                3
              </span>
              <span 
                className="text-xs font-medium" 
                style={{ color: 'var(--color-text-body)' }}
              >
                대본 생성
              </span>
            </div>
          </div>

          {/* 2. 주제 설정 및 가이드라인 우측 상단 정렬 말풍선 상자 (329px x 84px) */}
          <div 
            className="relative bg-white rounded-2xl border border-red-100 p-3 shadow-sm flex items-center justify-center text-center"
            style={{ width: '329px', height: '84px' }}
          >
            <p className="text-[11px] font-medium text-red-500 leading-snug">
              파일 업로드를 하지 않을 시,<br />
              <span className="font-bold">발표 주제와 가이드라인을 필수</span>로 입력하셔야합니다.
            </p>
            {/* 말풍선 아래쪽 꼬리표 */}
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
              <h2 
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--color-text-heading)' }}
              >
                PPT / PDF 업로드
              </h2>
              <p 
                className="text-xs mb-6"
                style={{ color: 'var(--color-text-body)' }}
              >
                슬라이드 파일을 업로드하면 AI가 내용을 분석합니다.
              </p>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative"
                style={{ 
                  borderColor: 'var(--color-brand-light)',
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

                <p 
                  className="text-base font-bold mb-1"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {file ? file.name : '파일을 여기에 끌어다 놓거나 클릭하세요'}
                </p>
                <p 
                  className="text-xs mb-8"
                  style={{ color: 'var(--color-text-body)' }}
                >
                  PPT, PPTX, PDF 지원 · 최대 20MB
                </p>

                <button 
                  type="button" 
                  className="px-7 py-3 text-white text-xs font-bold rounded-xl shadow-md pointer-events-none"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                >
                  파일 선택
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
                <h2 
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  주제 설정 및 가이드라인
                </h2>
                <p 
                  className="text-xs mb-6"
                  style={{ color: 'var(--color-text-body)' }}
                >
                  발표의 핵심 방향과 스타일을 정하는데 도움을 드려요.
                </p>

                {/* 발표 주제 (352x80) & 발표 시간 (408x80) */}
                <div className="flex gap-4 mb-5">
                  {/* 발표 주제 입력 상자 (352px x 80px) */}
                  <div style={{ width: '352px', height: '80px' }} className="flex flex-col justify-between">
                    <label 
                      className="block text-xs font-bold"
                      style={{ color: 'var(--color-text-heading)' }}
                    >
                      발표 주제 <span style={{ color: 'var(--color-brand-primary)' }} className="font-medium">(필수)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예) AI 기반 발표 코칭 서비스 기획"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full h-[48px] px-4 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* 발표 시간 드롭다운 (408px x 80px) */}
                  <div style={{ width: '408px', height: '80px' }} className="flex flex-col justify-between">
                    <label 
                      className="block text-xs font-bold"
                      style={{ color: 'var(--color-text-heading)' }}
                    >
                      발표 시간
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-[48px] px-4 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white shadow-sm cursor-pointer"
                    >
                      <option value="5분">5분</option>
                      <option value="3분">3분</option>
                      <option value="10분">10분</option>
                    </select>
                  </div>
                </div>

                {/* 목차 / 가이드라인 & 발표 스타일 */}
                <div className="flex gap-4">
                  {/* 목차 / 가이드라인 상자 (352px x 352px) */}
                  <div style={{ width: '352px', height: '352px' }} className="flex flex-col justify-between">
                    <label 
                      className="block text-xs font-bold mb-2"
                      style={{ color: 'var(--color-text-heading)' }}
                    >
                      목차 / 가이드라인
                    </label>
                    <textarea
                      value={outline}
                      onChange={(e) => setOutline(e.target.value)}
                      className="w-full h-[320px] p-4 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white resize-none shadow-sm leading-relaxed"
                    />
                  </div>

                  {/* 우측 서브 세션 (발표 스타일 + 추천 박스) */}
                  <div className="flex flex-col justify-between" style={{ width: '408px', height: '352px' }}>
                    <div>
                      <label 
                        className="block text-xs font-bold mb-2"
                        style={{ color: 'var(--color-text-heading)' }}
                      >
                        발표 스타일
                      </label>
                      <div className="flex gap-3 mb-4">
                        {/* 격식체 버튼 (198px x 160px) */}
                        <button
                          type="button"
                          onClick={() => setStyle('formal')}
                          style={{ width: '198px', height: '160px' }}
                          className={`p-3.5 rounded-xl border text-center transition-all hover-effect-btn flex flex-col justify-center items-center ${
                            style === 'formal' ? 'is-active border-transparent shadow-sm' : 'border-slate-200'
                          }`}
                        >
                          <img src={Frame12062} alt="격식체" className="w-8 h-8 mb-2 object-contain" />
                          <span className="block text-xs font-bold mb-1">격식체</span>
                          <span className="text-[10px] opacity-80 block leading-tight">
                            공식적이고 전문적인 어조
                          </span>
                        </button>

                        {/* 편안한 말투 버튼 (198px x 160px) */}
                        <button
                          type="button"
                          onClick={() => setStyle('casual')}
                          style={{ width: '198px', height: '160px' }}
                          className={`p-3.5 rounded-xl border text-center transition-all hover-effect-btn flex flex-col justify-center items-center ${
                            style === 'casual' ? 'is-active border-transparent shadow-sm' : 'border-slate-200'
                          }`}
                        >
                          <img src={Frame12063} alt="편안한 말투" className="w-8 h-8 mb-2 object-contain" />
                          <span className="block text-xs font-bold mb-1">편안한 말투</span>
                          <span className="text-[10px] opacity-80 block leading-tight">
                            친근하고 자연스러운 대화체
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 이런 상황에 추천해요 상자 (정확한 규격: 408px x 140px) */}
                    <div 
                      style={{ width: '408px', height: '140px' }}
                      className="glass-badge rounded-xl p-4 flex flex-col justify-center"
                    >
                      <p 
                        className="text-xs font-bold mb-2.5 flex items-center gap-1.5"
                        style={{ color: 'var(--color-brand-primary)' }}
                      >
                        {/* 전구 아이콘 (Group.png) */}
                        <img src={GroupIcon} alt="GroupIcon" className="w-4 h-4 object-contain" /> 
                        <span>이런 상황에 추천해요</span>
                      </p>
                      
                      {/* 추천 항목 리스트 (각 항목 앞에 checkLogo 표시) */}
                      <ul className="text-xs space-y-2 list-none p-0 m-0">
                        <li className="flex items-center gap-2 text-slate-600">
                          <img src={checkLogo} alt="checkLogo" className="w-3.5 h-3.5 object-contain" />
                          <span>교수님, 면접관 등 윗사람 앞 발표</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-600">
                          <img src={checkLogo} alt="checkLogo" className="w-3.5 h-3.5 object-contain" />
                          <span>공식적인 자리 (학술 발표, 업무 보고 등)</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-600">
                          <img src={checkLogo} alt="checkLogo" className="w-3.5 h-3.5 object-contain" />
                          <span>전문성이 중요한 상황</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 우측 하단 대본 생성하기 버튼 2종 */}
        <div className="w-full flex justify-end items-center gap-4 mt-6">
           <button
            type="button"
            onClick={onNext}
            style={{ 
              width: '250px', 
              height: '60px',
              backgroundColor: 'var(--color-brand-primary)'
            }}
            className="hover:opacity-95 text-white rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>대본 생성하기</span>
            <span>➔</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            style={{ width: '250px', height: '60px' }}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span style={{ color: 'var(--color-text-heading)' }}>대본 생성하기</span>
            <span style={{ color: 'var(--color-text-body)' }}>›</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiSetPage;