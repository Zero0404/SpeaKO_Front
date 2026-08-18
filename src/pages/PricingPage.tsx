import React, { useState } from "react";
import { Check, X } from "lucide-react";
import MainChip from "../components/MainChip";
import bgImage from "../assets/select-page-background.png";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  originalPrice?: number;
  priceLabel: string;
  unit?: string;
  buttonText: string;
  features: PricingFeature[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "guest",
    name: "비회원",
    description: "SPEAKO의 강력한 AI 성능을 가볍게 맛보기 위한 체험 모드입니다.",
    priceLabel: "0",
    unit: "/월",
    buttonText: "무료로 시작하기",
    features: [
      { text: "AI 대본 생성 (총 3회 제공)", included: true },
      { text: "발표 발음 코칭 (총 1회 제공)", included: true },
      { text: "발음 평가 리포트 (총 1회 / 점수만 제공)", included: true },
      { text: "개인 워크스페이스 대본 저장", included: false },
      { text: "상세 발음 취약점 분석 및 교정 가이드", included: false },
      { text: "대본 부분 재생성 가능", included: false },
    ],
  },
  {
    id: "free",
    name: "무료 회원",
    description: "회원가입만해도 제공되는 혜택으로, 발표를 든든하게 준비할 수 있습니다.",
    priceLabel: "0",
    unit: "/월",
    buttonText: "무료로 시작하기",
    features: [
      { text: "AI 대본 생성 무제한", included: true },
      { text: "발표 발음 코칭 무제한", included: true },
      { text: "발음 평가 리포트 무제한 (점수만 제공)", included: true },
      { text: "개인 워크스페이스 대본 저장", included: true },
      { text: "상세 발음 취약점 분석 및 교정 가이드", included: false },
      { text: "대본 부분 재생성 가능", included: false },
    ],
  },
  {
    id: "pro",
    name: "PRO",
    badge: "체험판",
    description:
      "중요한 발표, 발표 면접, 비즈니스 경쟁 PT를 완벽하게 정복하기 위한 마스터 플랜입니다.",
    originalPrice: 4990,
    priceLabel: "Free!",
    buttonText: "현재 플랜",
    features: [
      { text: "AI 대본 생성 무제한", included: true },
      { text: "발표 발음 코칭 무제한", included: true },
      { text: "발음 평가 리포트 무제한", included: true },
      { text: "개인 워크스페이스 대본 저장", included: true },
      { text: "상세 발음 취약점 분석 및 교정 가이드", included: true },
      { text: "대본 부분 재생성 가능", included: true },
    ],
  },
];

interface PricingCardProps {
  plan: PricingPlan;
  isActive: boolean;
  onSelect: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isActive, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[20px] bg-gradient-to-br from-white/10 to-indigo-500/10 p-8 text-left outline outline-offset-[-1px] transition-all duration-300 hover:-translate-y-2 sm:p-10 ${
        isActive
          ? "scale-[1.02] shadow-[0_0_40px_8px_rgba(99,102,241,0.25)] outline-2 outline-indigo-500 backdrop-blur-md"
          : "outline-1 outline-white"
      }`}
    >
      {/* 헤더 */}
      <div className="mb-2 flex items-center gap-2">
        <h3
          className={`text-xl font-bold ${
            isActive ? "text-[color:var(--color-brand-primary)]" : "text-gray-400"
          }`}
        >
          {plan.name}
        </h3>
        {plan.badge && <MainChip text={plan.badge} scale={0.8} className="!py-1.5" />}
      </div>

      <p className={`mb-6 text-sm leading-relaxed ${isActive ? "text-gray-600" : "text-gray-400"}`}>
        {plan.description}
      </p>

      {/* 가격 */}
      <div className="mb-6 flex items-end gap-2">
        {plan.originalPrice ? (
          <>
            <span className="text-2xl font-bold text-gray-300 line-through sm:text-3xl">
              ₩{plan.originalPrice.toLocaleString()}
            </span>
            {isActive ? (
              <span
                className="bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
                style={{ backgroundImage: "var(--gradient-brand-active)" }}
              >
                {plan.priceLabel}
              </span>
            ) : (
              <span className="text-2xl font-bold text-gray-400 sm:text-3xl">{plan.priceLabel}</span>
            )}
          </>
        ) : (
          <span
            className={`text-2xl font-bold sm:text-3xl ${
              isActive ? "text-[color:var(--color-text-heading)]" : "text-gray-400"
            }`}
          >
            ₩{plan.priceLabel}
            {plan.unit && <span className="text-base font-medium">{plan.unit}</span>}
          </span>
        )}
      </div>

      {/* 버튼 (표시용) */}
      <div
        className={`hover-effect-btn ${
          isActive ? "is-active" : "!text-gray-400"
        } mb-6 w-full rounded-xl py-3 text-center text-sm font-semibold sm:text-base`}
      >
        {plan.buttonText}
      </div>

      {/* 기능 리스트 */}
      <ul className="flex flex-col gap-3">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {feature.included ? (
              <Check size={16} className={isActive ? "text-black" : "text-gray-300"} />
            ) : (
              <X size={16} className="text-gray-300" />
            )}
            <span
              className={`text-sm ${
                feature.included ? (isActive ? "text-gray-700" : "text-gray-400") : "text-gray-300"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </button>
  );
};

const PricingPage: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      <div className="relative flex flex-col items-center px-4 pb-24 pt-36 sm:pt-40 lg:pt-44">
        <MainChip text="Pricing Plans" />

        <h1 className="mt-6 text-center text-2xl font-bold text-[color:var(--color-text-heading)] sm:text-3xl lg:text-4xl">
          원하는 플랜을 선택하고, <span style={{ color: "#5B6CFB" }}>발표 준비</span>를 완성하세요
        </h1>

        <div className="mt-12 grid w-full max-w-6xl grid-cols-1 gap-9 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isActive={selectedPlanId === plan.id}
              onSelect={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;