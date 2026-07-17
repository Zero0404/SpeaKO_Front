import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 에셋 import
import selectPageBackground from "../assets/select-page-background.svg";
import scriptIllustration from "../assets/feature-script-illustration.svg";
import coachIllustration from "../assets/feature-coach-illustration.svg";

// 컴포넌트 import
import MainChip from "../components/MainChip";
import HoverButton from "../components/HoverButton";
import SubChip from "../components/SubChip";

interface FeatureCardData {
  id: string;
  badge: string;
  title: string;
  description: string;
  buttonLabel: string;
  image: string;
  imageAlt: string;
  route: string;
}

const FEATURES: FeatureCardData[] = [
  {
    id: "script",
    badge: "인기 모드",
    title: "AI 대본 생성",
    description: "발표 주제나 가이드라인, 혹은 PPT/PDF 슬라이드를 기반으로 AI가 청중과 시간, 말투에 딱 맞는 완벽한 발표 대본을 만들어 드립니다.",
    buttonLabel: "대본 생성하기",
    image: scriptIllustration,
    imageAlt: "PPT/PDF 폴더 아이콘",
    route: "/ai-set",
  },
  {
    id: "coach",
    badge: "실전 대비",
    title: "발표 발음 코칭",
    description: "이미 준비된 대본이 있으신가요? 작성해 둔 대본을 입력하고 연습하면, AI가 정확한 표준 발음 표기와 함께 취약점을 정밀 분석 해드립니다.",
    buttonLabel: "발음 코칭 받기",
    image: coachIllustration,
    imageAlt: "마이크 코칭 아이콘",
    route: "/coach-set",
  },
];

const SelectPage: FC = () => {
  const navigate = useNavigate();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, route: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(route);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[var(--color-white)] overflow-hidden">
      {/* 배경 이미지 */}
      <img src={selectPageBackground} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {/* 배경 장식 블러 원형 */}
      <div aria-hidden="true" className="absolute w-[1225.4px] h-[644px] left-[1444px] top-[1276.36px] origin-top-left rotate-[-89.58deg] bg-radial-[at_26%_83%] from-[var(--color-brand-light)]/40 to-white/40 rounded-full blur-[300px] pointer-events-none" />
      <div aria-hidden="true" className="absolute w-[981.94px] h-[725.37px] left-[-466px] top-[407.23px] origin-top-left rotate-[-37.90deg] bg-radial-[at_55%_63%] from-[var(--color-brand-light)]/40 to-white/40 rounded-full blur-[350px] pointer-events-none" />

      {/* 상단 네비게이션 바 자리 */}
      <div className="relative w-full h-28" />

      {/* 헤더 영역 */}
      <div className="relative w-full flex flex-col items-center gap-5 px-4 pt-10">
        <MainChip text="Welcome To SpeaKO" />
        <h1 className="text-center whitespace-nowrap text-3xl sm:text-5xl lg:text-6xl">
          <span className="text-[var(--color-text-heading)] font-bold font-['Pretendard'] leading-[1.4] lg:leading-[83.70px]">오늘 어떤 </span>
          <span className="text-[var(--color-brand-primary)] font-bold font-['Pretendard'] leading-[1.4] lg:leading-[83.70px]">발표 연습</span>
          <span className="text-[var(--color-text-heading)] font-bold font-['Pretendard'] leading-[1.4] lg:leading-[83.70px]">을 시작할까요?</span>
        </h1>
        <p className="w-full max-w-[813px] mx-auto text-center text-[var(--color-text-body)] text-2xl font-medium font-['Pretendard'] leading-8">
          대본 작성이 막막할 때도, 실전 무대 전 확실한 피드백이 필요할 때도<br />
          SpeaKO의 지능형 AI 코치가 1:1 맞춤형으로 밀착 가이드합니다.
        </p>
      </div>

      {/* 기능 선택 카드 */}
      <div className="relative w-full max-w-[1520px] mx-auto mt-12 px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(feature.route)}
            onKeyDown={(event) => handleCardKeyDown(event, feature.route)}
            onMouseEnter={() => setHoveredCardId(feature.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            className="group w-full h-110 pl-10 pr-5 py-10 bg-gradient-to-br from-white/10 to-[var(--color-brand-primary)]/10 hover:bg-[var(--color-white)] rounded-[20px] outline outline-1 outline-offset-[-1px] outline-white hover:shadow-xl cursor-pointer transition-all duration-300 -translate-y-0 hover:-translate-y-2 flex justify-between items-center"
          >
            <div className="self-stretch flex flex-col justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-7">
                <SubChip text={feature.badge} />
                <div className="flex flex-col justify-start items-start gap-5 pl-1">
                  <h2 className="text-[var(--color-text-heading)] text-4xl font-bold font-['Pretendard'] leading-10">{feature.title}</h2>
                  <p className="w-96 text-[var(--color-text-body)] text-xl font-medium font-['Pretendard'] leading-8">{feature.description}</p>
                </div>
              </div>
              <HoverButton 
                label={feature.buttonLabel} 
                isParentHovered={hoveredCardId === feature.id}
                onClick={() => navigate(feature.route)} 
              />
            </div>

            <div className="w-72 h-64 p-2.5 flex flex-col justify-center items-center">
              <img src={feature.image} alt={feature.imageAlt} className="self-stretch h-64 object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectPage;