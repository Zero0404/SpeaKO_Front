import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 에셋 및 컴포넌트 불러오기
import bgSvg from '../assets/select-page-background.svg';
import MainChip from '../components/MainChip';
import type { EvaluationResult } from '../apis/feedback';

// FeedbackLoading -> navigate('/feedback-result', { state: { evaluationResult, file } })
// 로 넘어온 실제 평가 결과. (이전에는 이 페이지가 { score, aiComment, originalText,
// recognizedText } 같은 평평한 필드를 기대하고 있었는데, 실제로 전달되는 값은
// evaluationResult 하나로 감싸져 있어서 실제 API 결과가 화면에 전혀 반영되지
// 않는 버그가 있었습니다. 아래에서 evaluationResult를 직접 읽도록 고쳤습니다.
interface FeedbackResultState {
  evaluationResult?: EvaluationResult;
  file?: File;
}

// API 연동 전 || 이 페이지에 바로 진입해서 테스트할 때 보여줄 목데이터
const MOCK_RECOGNIZED_TEXT = `안녕하세요, 여러분!\n오늘 저희는 특별한 주제로 여러분께 소개해드리고자 이 자리에 섰습니다.\n지금부터 보여드릴 내용은 다소 난해하게 느껴질 수도 있지만, 흥미로운 점들이 많이 담겨 있으니 끝까지 함께 해주시길 바랍니다.\n\n먼저 첫 번째 슬라이드를 통해 기본적인 구성 요소를 알아보도록 하겠습니다.\n여기에는 다양한 기호와 문자들이 조합되어 있는데요, 이는 저희 주제에서 자주 등장하는 심벌들입니다. 이 심벌들은 각각의 의미를 가지고 있으며, 앞으로의 설명에서도 반복해서 등장할 것 입니다.\n특정 기호나 숫자들은 특정한 개념이나 방향을 나타고 있습니다.\n\n다음 두 번째 슬라이드로 넘어가면, 조금 더 복잡한 형태의 패턴이 나타나고 있습니다.\n이 패턴들은 단순한 배열 이상의 의미를 가지며, 서로 다른 요소들이 어떻게 연결되고 상호작용하는지 보여줍니다.\n이러한 패턴을 이해함으로써, 전체적인 구조와 원리를 파악하는데 큰 도움이 될 것 입니다.\n\n...(하이라이팅이 적용된 대본이 들어갑니다)`;

const getScoreFeedback = (value: number) => {
  if (value >= 90) {
    return { title: '완벽해요! 🎉', detail: '발음이 아주 정확하고 자연스러워요.\n지금처럼만 유지하면 돼요!' };
  }
  if (value >= 75) {
    return {
      title: '훌륭해요! 👏',
      detail: '전반적으로 안정적인 발표예요.\n장단음에 대한 부분만 좀 더 연습하면 더 완벽한 발표를 할 수 있을 것 같아요!',
    };
  }
  if (value >= 50) {
    return { title: '좋아요, 조금만 더! 💪', detail: '기본기는 탄탄해요.\n하이라이트된 단어들 위주로 반복 연습해보세요.' };
  }
  return { title: '연습이 더 필요해요 🙂', detail: '녹음을 다시 들어보면서 발음을 차근차근 교정해보세요.' };
};



/**
 * 발음 종합 점수 도넛 차트.
 * CoachViewPage의 ScoreDonut과 동일한 방식(SVG stroke-dashoffset 애니메이션)을 사용해
 * 앱 전체에서 점수 도넛의 두께/애니메이션이 일관되게 보이도록 맞췄습니다.
 * mount 시 0%에서 목표 점수까지 시계방향으로 자연스럽게 채워집니다.
 */
const ScoreDonut = ({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // 0으로 리셋한 다음 프레임에 목표 점수로 올려야 transition이 실제로 재생됩니다.
    setAnimatedScore(0);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimatedScore(score));
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const SIZE = 158;
  const STROKE = 14;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedScore / 100);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
      <defs>
        <linearGradient id="feedbackScoreDonutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={STROKE} />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        fill="none"
        stroke="url(#feedbackScoreDonutGradient)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
    </svg>
  );
};



export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resultState = (location.state as FeedbackResultState | null) ?? null;
  const evaluationResult = resultState?.evaluationResult ?? null;

  // 실제 서버 응답이 있으면 그 값을, 없으면(예: 이 페이지로 직접 진입해서 테스트하는 경우)
  // 목데이터를 사용합니다. 실제 값과 목데이터를 섞어서 "가짜인데 진짜처럼" 보여주지
  // 않도록, 원본 텍스트처럼 서버가 아예 안 주는 필드는 목데이터일 때만 채웁니다.
  const overallScore = evaluationResult?.totalScore ?? 87;
  const recognizedText = evaluationResult?.recognizedText ?? MOCK_RECOGNIZED_TEXT;
  const feedbackDetail = evaluationResult?.feedbackDetail ?? null;
  const audioFileName = evaluationResult?.audioFileName ?? resultState?.file?.name ?? null;


  const scoreFeedback = getScoreFeedback(overallScore);

  const handleRetest = () => {
    navigate('/feedback-fileupload');
  };

  return (
    <div
      className="relative w-screen min-h-screen bg-cover bg-center overflow-y-auto"
      style={{
        backgroundImage: `url(${bgSvg})`,
        fontFamily: 'Pretendard, sans-serif',
      }}>
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
            {audioFileName && (
              <span className="text-xs font-medium text-[#94A3B8] truncate max-w-[220px]">{audioFileName}</span>
            )}
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
            <div
              className="relative flex-shrink-0 flex items-center justify-center"
              style={{ width: '158px', height: '158px' }}
            >
              <ScoreDonut score={overallScore} />

              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div
                  className="flex flex-col items-center justify-center box-border"
                  style={{
                    width: '57.68px',
                    height: '60.68px',
                    gap: '3.68px',
                  }}
                >
                  <span className="text-[30px] font-semibold text-[#6366f1] leading-[100%] tracking-[-0.02em] text-center whitespace-nowrap">
                    {overallScore}점
                  </span>
                  <span className="text-[18px] font-medium text-gray-400 leading-[100%] tracking-normal text-center whitespace-nowrap">
                    /100
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1.5 text-center md:text-left">
              <h4 className="text-[20px] font-bold text-[#27272A]">
                총점 {overallScore}점 - {scoreFeedback.title}
              </h4>
              <p className="text-[14px] text-[#64748B] leading-relaxed whitespace-pre-line">
                {scoreFeedback.detail}
              </p>
              {!evaluationResult && (
                <p className="text-[12px] text-amber-500 font-medium mt-1">
                  ⚠️ 실제 평가 결과 없이 목데이터로 보고 있는 화면입니다. (평가 플로우를 거쳐 들어오면 실제 점수가 표시됩니다.)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= 3. 인식 텍스트 (서버 STT 결과) ================= */}
        <div className="w-full">
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
              <div className="text-[16px] font-semibold text-[#27272A] leading-[200%] tracking-[-0.025em] whitespace-pre-line select-text">
                {recognizedText}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. Feedback Box (상세 피드백) ================= */}
        <div
          className="w-full bg-white/90 backdrop-blur-md shadow-md border border-white/80 flex flex-col box-border"
          style={{
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

        

          {feedbackDetail ? (
            <p className="text-[14px] text-[#27272A] leading-relaxed whitespace-pre-line">{feedbackDetail}</p>
          ) : (
            <p className="text-[13px] text-[#94A3B8]">
              {evaluationResult
                ? '아직 서버가 상세 피드백 문구(feedbackDetail)를 내려주지 않았어요.'
                : '실제 평가를 진행하면 이 영역에 상세 피드백이 표시됩니다.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
