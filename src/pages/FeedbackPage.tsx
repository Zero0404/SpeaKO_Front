import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 에셋 및 컴포넌트 불러오기
import bgSvg from '../assets/select-page-background.svg';
import MainChip from '../components/MainChip';
import TextInput from '../components/TextInput';

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export interface FeedbackPageProps {
  onComplete?: () => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  // 데이터 상태 관리
  const [feedbackData] = useState({
    overallScore: 87,
    aiComment: '', 
  });
  const [originalText] = useState(
    `안녕하세요, 여러분!\n오늘 저희는 특별한 주제로 여러분께 소개해드리고자 이 자리에 섰습니다.\n지금부터 보여드릴 내용은 다소 난해하게 느껴질 수도 있지만, 흥미로운 점들이 많이 담겨 있으니 끝까지 함께 해주시길 바랍니다.\n\n먼저 첫 번째 슬라이드를 통해 기본적인 구성 요소를 알아보도록 하겠습니다.\n여기에는 다양한 기호와 문자들이 조합되어 있는데요, 이는 저희 주제에서 자주 등장하는 심벌들입니다. 이 심벌들은 각각의 의미를 가지고 있으며, 앞으로의 설명에서도 반복해서 등장할 것 입니다.\n특정 기호나 숫자들은 특정한 개념이나 방향을 나타내고 있습니다.\n\n다음 두 번째 슬라이드로 넘어가면, 조금 더 복잡한 형태의 패턴이 나타나고 있습니다.\n이 패턴들은 단순한 배열 이상의 의미를 가지며, 서로 다른 요소들이 어떻게 연결되고 상호작용하는지 보여줍니다.\n이러한 패턴을 이해함으로써, 전체적인 구조와 원리를 파악하는데 큰 도움이 될 것 입니다.\n\n...(하이라이팅이 적용된 대본이 들어갑니다)`
  );

  const [recognizedText] = useState(
    `안녕하세요, 여러분!\n오늘 저희는 특별한 주제로 여러분께 소개해드리고자 이 자리에 섰습니다.\n지금부터 보여드릴 내용은 다소 난해하게 느껴질 수도 있지만, 흥미로운 점들이 많이 담겨 있으니 끝까지 함께 해주시길 바랍니다.\n\n먼저 첫 번째 슬라이드를 통해 기본적인 구성 요소를 알아보도록 하겠습니다.\n여기에는 다양한 기호와 문자들이 조합되어 있는데요, 이는 저희 주제에서 자주 등장하는 심벌들입니다. 이 심벌들은 각각의 의미를 가지고 있으며, 앞으로의 설명에서도 반복해서 등장할 것 입니다.\n특정 기호나 숫자들은 특정한 개념이나 방향을 나타고 있습니다.\n\n다음 두 번째 슬라이드로 넘어가면, 조금 더 복잡한 형태의 패턴이 나타나고 있습니다.\n이 패턴들은 단순한 배열 이상의 의미를 가지며, 서로 다른 요소들이 어떻게 연결되고 상호작용하는지 보여줍니다.\n이러한 패턴을 이해함으로써, 전체적인 구조와 원리를 파악하는데 큰 도움이 될 것 입니다.\n\n...(하이라이팅이 적용된 대본이 들어갑니다)`
  );

  const handleRetest = () => {
    navigate('/ai-set');
  };

  // 도넛 차트 설정 (브랜드 그라데이션 적용: #a5b4fc -> #6366f1)
  const doughnutData = {
    labels: ['Score', 'Remaining'],
    datasets: [{
      data: [feedbackData.overallScore, 100 - feedbackData.overallScore],
      backgroundColor: (context: any) => {
        if (context.dataIndex === 1) return 'transparent';
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return '#6366f1';

        // --gradient-brand-active: to bottom right (#a5b4fc -> #6366f1)
        const gradient = ctx.createLinearGradient(0, 0, chartArea.width, chartArea.height);
        gradient.addColorStop(0, '#a5b4fc');
        gradient.addColorStop(1, '#6366f1');
        return gradient;
      },
      borderWidth: 0,
      borderRadius: 5,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '90%', // 원 두께를 얇게 조절 (기존 84% -> 90%)
    plugins: { 
      legend: { display: false }, 
      tooltip: { enabled: false } 
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart' as const, // 👈 'as const'를 붙여 TypeScript 타입 오류를 방지합니다.
    },
  };
  // 특정 키워드 하이라이트 처리 함수
  // 1) 구성, 조금, 배열: duration (장단음 - 핑크)
  // 2) "특정 기호나"의 특정: mismatch (표기 불일치 - 주황/앰버)
  // 3) "특정한 개념이나"의 특정: 하이라이트 안 함
  const renderHighlightedOriginalText = (text: string) => {
    const durationStyle = {
      backgroundColor: 'rgba(247, 53, 142, 0.1)',
      color: 'rgba(247, 53, 142, 1)',
      boxShadow: 'inset 0px -2px 0px 0px rgba(247, 53, 142, 1)',
    };

    const mismatchStyle = {
      backgroundColor: 'rgba(247, 147, 34, 0.1)',
      color: 'rgba(247, 147, 34, 1)',
      boxShadow: 'inset 0px -2px 0px 0px rgba(247, 147, 34, 1)',
    };

    const parts = text.split(/(구성|특정 기호나|조금|배열)/g);

    return parts.map((part, i) => {
      if (part === '구성' || part === '조금' || part === '배열') {
        return (
          <span
            key={i}
            style={durationStyle}
            className="relative inline-block rounded-sm px-1 font-semibold mx-0.5"
          >
            {part}
          </span>
        );
      }
      if (part === '특정 기호나') {
        return (
          <React.Fragment key={i}>
            <span
              style={mismatchStyle}
              className="relative inline-block rounded-sm px-1 font-semibold mx-0.5"
            >
              특정
            </span>
             기호나
          </React.Fragment>
        );
      }
      return part;
    });
  };

  return (
    <div
      className="relative w-screen min-h-screen bg-cover bg-center overflow-y-auto"
      style={{
        backgroundImage: `url(${bgSvg})`,
        fontFamily: 'Pretendard, sans-serif',
      }}>
      {/*  반응형 전체 페이지 래퍼  */}
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-[50px] py-[120px] flex flex-col gap-6 box-border">
        
        {/* ================= 1. Title Bar ================= */}
        <div 
          className="w-full bg-white/90 backdrop-blur-md shadow-sm border border-white/80 flex items-center justify-between box-border"
          style={{
            height: '66px',
            borderRadius: '11.36px',
            paddingTop: '10px',
            paddingRight: '10px',
            paddingBottom: '10px',
            paddingLeft: '25px',
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-bold text-[#27272A]">최종 평가 결과</h2>
          </div>
          <button
            onClick={handleRetest}
            className="flex items-center gap-2 text-[#6366f1] px-4 py-2 rounded-[8px] text-sm font-semibold transition-all cursor-pointer border border-indigo-100 shadow-sm"
            style={{
              backgroundColor: 'rgba(91, 108, 251, 0.1)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 테스트
          </button>
        </div>

        {/* ================= 2. Score Box ================= */}
        <div 
          className="w-full bg-white/90 backdrop-blur-md shadow-md border border-white/80 flex flex-col justify-between box-border"
          style={{
            minHeight: '288px',
            borderRadius: '20px',
            paddingTop: '40px',
            paddingRight: '25px',
            paddingBottom: '40px',
            paddingLeft: '25px',
            gap: '24px',
          }}
        >
              <div className="flex items-center gap-2 my-2">
                <h2 className="text-[20px] font-bold text-[#27272A]">평가 결과</h2>
                <MainChip
                  text="AI 생성"
                  scale={0.7}
                  className="whitespace-nowrap"
                />
              </div>

          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">
            {/* 피그마 스펙 158px x 158px 차트 영역 */}
            <div 
              className="relative flex-shrink-0 flex items-center justify-center"
              style={{ width: '158px', height: '158px' }}
            >
              {/* 고정된 얇은 회색 배경 링 (8px) */}
              <div className="absolute inset-0 rounded-full border-[8px] border-[#E2E8F0] pointer-events-none box-border" />
              
              {/* 보라색 차트 (인터랙션 차오르는 애니메이션) */}
              <div className="relative w-full h-full z-10">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>

              {/* 중앙 점수 표시 (피그마 폰트 스펙 & TextInput 방식 상속 적용) */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div 
                  className="flex flex-col items-center justify-center box-border"
                  style={{
                    width: '57.68px',
                    height: '60.68px',
                    gap: '3.68px',
                  }}
                >
                  {/* 87점: font-size 30px, weight 600, line-height 100%, letter-spacing -2% */}
                  <span className="text-[30px] font-semibold text-[#6366f1] leading-[100%] tracking-[-0.02em] text-center whitespace-nowrap">
                    {feedbackData.overallScore}점
                  </span>
                  {/* /100: font-size 18px, weight 500, line-height 100%, letter-spacing 0% */}
                  <span className="text-[18px] font-medium text-gray-400 leading-[100%] tracking-normal text-center whitespace-nowrap">
                    /100
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1.5 text-center md:text-left">
              <h4 className="text-[20px] font-bold text-[#27272A]">
                총점 {feedbackData.overallScore}점 - 훌륭해요! 👏
              </h4>
              <p className="text-[14px] text-[#64748B] leading-relaxed whitespace-pre-line">
                전반적으로 안정적인 발표예요.<br />
                장단음에 대한 부분만 좀 더 연습하면 더 완벽한 발표를 할 수 있을 것 같아요!
              </p>
            </div>
          </div>
        </div>

        {/* ================= 3 & 4. 원본 텍스트 및 인식 텍스트 상자 (피그마 중첩 2단계 상자 스펙 100% 반영) ================= */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          
          {/* 원본 텍스트 외부 큰 상자 (769px, radius 20px, padding 30/25/30/25, gap 12px) */}
          <div 
            className="w-full bg-white/95 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
            style={{
              height: '769px',
              borderRadius: '20px',
              paddingTop: '30px',
              paddingRight: '25px',
              paddingBottom: '30px',
              paddingLeft: '25px',
              gap: '12px',
            }}
          >
            <h3 className="text-[18px] font-bold text-[#27272A] shrink-0">
              원본 텍스트
            </h3>

            {/* 원본 텍스트 내부 상자 (671px, radius 12px, border 0.5px #cbd5e1, padding 25px, gap 10px) */}
            <div 
              className="w-full bg-white box-border overflow-y-auto"
              style={{
                height: '671px',
                borderRadius: '12px',
                borderWidth: '0.5px',
                borderStyle: 'solid',
                borderColor: '#cbd5e1',
                padding: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* 원본 텍스트: 16px, SemiBold 600, leading 200%, tracking -2.5% */}
              <div className="text-[16px] font-semibold text-[#27272A] leading-[200%] tracking-[-0.025em] whitespace-pre-line select-text">
                {renderHighlightedOriginalText(originalText)}
              </div>
            </div>
          </div>

          {/* 인식 텍스트 외부 큰 상자 (769px, radius 20px, padding 30/25/30/25, gap 12px) */}
          <div 
            className="w-full bg-white/95 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
            style={{
              height: '769px',
              borderRadius: '20px',
              paddingTop: '30px',
              paddingRight: '25px',
              paddingBottom: '30px',
              paddingLeft: '25px',
              gap: '12px',
            }}
          >
            <h3 className="text-[18px] font-bold text-[#27272A] shrink-0">
              인식 텍스트
            </h3>

            {/* 인식 텍스트 내부 상자 (671px, radius 12px, border 0.5px #cbd5e1, padding 25px, gap 10px) */}
            <div 
              className="w-full bg-white box-border overflow-y-auto"
              style={{
                height: '671px',
                borderRadius: '12px',
                borderWidth: '0.5px',
                borderStyle: 'solid',
                borderColor: '#cbd5e1',
                padding: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* 인식 텍스트: 16px, SemiBold 600, leading 200%, tracking -2.5% */}
              <div className="text-[16px] font-semibold text-[#27272A] leading-[200%] tracking-[-0.025em] whitespace-pre-line select-text">
                {recognizedText}
              </div>
            </div>
          </div>

        </div>

        {/* ================= 5. Feedback Box (상세 피드백) ================= */}
        <div 
          className="w-full bg-white/90 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
          style={{
            height: '276px',
            borderRadius: '20px',
            paddingTop: '40px',
            paddingRight: '25px',
            paddingBottom: '40px',
            paddingLeft: '25px',
            gap: '24px',
          }}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] font-bold text-[#27272A]">상세 피드백</h3>
            <MainChip
              text="AI 피드백"
              scale={0.7}
              className="whitespace-nowrap"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;