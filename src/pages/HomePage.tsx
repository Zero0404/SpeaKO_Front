import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Upload,
  Play,
  FileText,
  TrendingDown,
  Mic,
  ExternalLink,
  ArrowUp,
  Volume2,
  Highlighter,
  CheckCircle2,
} from "lucide-react";

import mainfunctionbackground from "../assets/Homepage-Section3.png";

import img from "../assets/Home Image.png";
import logo from "../assets/SpeaKO-logo.svg";

import FeatureCard1 from "../assets/feature-script-illustration.svg";
import FeatureCard2 from "../assets/feature-coach-illustration.svg";
import FeatureCard3 from "../assets/feature-feedback-illustration.svg";

import MainChip from "../components/MainChip";
import SubChip from "../components/SubChip";

interface ReasonCardData {
  id: string;
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureTag {
  icon?: LucideIcon;
  label: string;
}

interface FeatureCardData {
  id: string;
  badge: string;
  image: string;
  title: string;
  description: string;
  tags: FeatureTag[];
}

const REASONS: ReasonCardData[] = [
  {
    id: "script",
    number: "01",
    icon: FileText,
    title: "대본 구성의 어려움",
    description:
      "PPT 내용은 있지만,\n이를 자연스러운 말로\n풀어내기 막막합니다.",
  },
  {
    id: "flow",
    number: "02",
    icon: TrendingDown,
    title: "불안정한 발표 흐름",
    description:
      "긴장으로 인해 말이 빨라지거나\n준비한 내용을 쉽게\n잊어버립니다.",
  },
  {
    id: "delivery",
    number: "03",
    icon: Mic,
    title: "전달력에 대한 확신 부족",
    description: "내 발음과 억양이\n청중에게 신뢰감을 주는지\n알 수 없습니다.",
  },
];

const FEATURES: FeatureCardData[] = [
  {
    id: "script-gen",
    badge: "SCRIPT GENERATION",
    image: FeatureCard1,
    title: "AI 대본 생성",
    description:
      "PPT/PDF 업로드 또는 텍스트 입력으로 AI가\n자동으로 발표 대본을 생성합니다.\n발표 시간·청중·말투 설정 가능",
    tags: [
      { icon: FileText, label: "PPT/PDF" },
      { icon: FileText, label: "TEXT" },
      { icon: FileText, label: "DOCX" },
    ],
  },
  {
    id: "pronun-coach",
    badge: "PRONUNCIATION COACHING",
    image: FeatureCard2,
    title: "발음 코칭",
    description:
      "생성된 대본에서 발음 주의 단어를\n자동 추출하고 표준 발음 표기를 제공합니다.\n대본 내 위치 하이라이트",
    tags: [
      { icon: Volume2, label: "편해 [펼레]" },
      { icon: Highlighter, label: "예시 하이라이트" },
    ],
  },
  {
    id: "pronun-eval",
    badge: "PRONUNCIATION EVALUATION",
    image: FeatureCard3,
    title: "발음 평가",
    description:
      "음성 파일(MP3/MPA)을 업로드하면\nAI가 발음 정확도를 0~5점으로 평가하고\n실제 인식된 텍스트를 확인할 수 있습니다.",
    tags: [{ icon: CheckCircle2, label: "점수 미리보기" }],
  },
];

// easeInOutCubic
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const SECTION_SCROLL_DURATION = 500; // ms, 영상 체감과 맞춘 값

const HomePage: FC = () => {
  const [isTopButtonVisible, setIsTopButtonVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0); // 0: Hero, 1: Why, 2: Main Function

  const heroRef = useRef<HTMLElement | null>(null);
  const whyRef = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  const isAnimatingRef = useRef(false);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsTopButtonVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 섹션 단위 휠/터치 스크롤 인터랙션
  useEffect(() => {
    const sectionRefs = [heroRef, whyRef, mainRef, footerRef];

    const getSectionTop = (index: number) => {
      const el = sectionRefs[index]?.current;
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;
    };

    const animateTo = (targetIndex: number) => {
      const targetY = getSectionTop(targetIndex);
      if (targetY === null) return;

      isAnimatingRef.current = true;
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / SECTION_SCROLL_DURATION, 1);
        window.scrollTo({ top: startY + diff * ease(t), behavior: "auto" });

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          isAnimatingRef.current = false;
          activeIndexRef.current = targetIndex;
          setActiveSection(targetIndex);
        }
      };

      requestAnimationFrame(step);
    };

    const isWithinPaginatedZone = () => {
      const footerTop = footerRef.current
        ? footerRef.current.getBoundingClientRect().top + window.scrollY
        : Infinity;
      // Main Function 섹션 중간까지는 페이지네이션 영역으로 간주
      return window.scrollY < footerTop - 40;
    };

    const handleWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const vh = window.innerHeight;
      const currentIndex = Math.round(window.scrollY / vh);
      const direction = e.deltaY > 0 ? 1 : -1;
      const targetIndex = currentIndex + direction;

      if (targetIndex < 0 || targetIndex > 3) return; // 범위 밖이면 기본 스크롤 허용

      e.preventDefault();
      animateTo(targetIndex);
    };

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isWithinPaginatedZone() || isAnimatingRef.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const delta = touchStartY - touchEndY;

      if (Math.abs(delta) < 50) return; // 짧은 스와이프는 무시

      const vh = window.innerHeight;
      const currentIndex = Math.round(window.scrollY / vh);
      const direction = delta > 0 ? 1 : -1;
      const targetIndex = currentIndex + direction;

      if (targetIndex < 0 || targetIndex > 2) return;

      animateTo(targetIndex);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        {/* Blob 1 - Hero 우측 */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute pointer-events-none -z-10"
          style={{
            top: "calc(467 / 1920 * 100vw)",
            left: "calc(2367 / 1920 * 100vw)",
            width: "calc(1239 / 1920 * 100vw)",
            height: "calc(508 / 1920 * 100vw)",
            transform: "rotate(172.32deg)",
            transformOrigin: "top left",
            background:
              "radial-gradient(at 89% 47%, #a5b4fc 0%, #ffffff 100%)",
            borderRadius: "9999px",
            filter: "blur(calc(400 / 1920 * 100vw))",
          }}
        />

        {/* Blob 2 - Hero~Why 경계 우측 */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute pointer-events-none -z-10"
          style={{
            top: "calc(971 / 1920 * 100vw)",
            left: "calc(1913 / 1920 * 100vw)",
            width: "calc(1523 / 1920 * 100vw)",
            height: "calc(384 / 1920 * 100vw)",
            transform: "rotate(174.37deg)",
            transformOrigin: "top left",
            background: "radial-gradient(at 55% 63%, #97a8fa 0%, #ffffff 100%)",
            borderRadius: "9999px",
            filter: "blur(calc(400 / 1920 * 100vw))",
          }}
        />

        <section
          id="hero-section"
          ref={heroRef}
          className="relative isolate flex min-h-screen w-full items-center overflow-hidden pt-24 sm:pt-28 lg:pt-32"
        >
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center gap-10 px-6 lg:flex-row lg:justify-between lg:px-28">
            {/* Left */}
            <div className="w-full text-center lg:w-auto lg:shrink-0 lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <MainChip text="AI Presentation Coach" />
              </div>

              <h1 className="mt-6 whitespace-normal text-[32px] font-bold leading-tight text-[var(--color-text-heading)] sm:text-[40px] md:text-[48px] lg:mt-8 lg:whitespace-nowrap lg:text-[56px]">
                발표가 두려운 당신을 위한
              </h1>

              <h1 className="whitespace-normal text-[32px] font-bold leading-tight text-[var(--color-brand-primary)] sm:text-[40px] md:text-[48px] lg:whitespace-nowrap lg:text-[56px]">
                AI 코치, SpeaKO
              </h1>

              <p className="mt-6 text-base leading-7 text-[var(--color-text-body)] sm:text-lg md:text-xl lg:mt-10 lg:leading-9">
                PPT 분석부터 맞춤 대본 생성, 실시간 발음 평가까지
                <br className="hidden sm:block" />
                완벽한 발표를 위한 모든 과정을 도와드려요.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:mt-14 lg:justify-start lg:gap-6">
                <Link
                  to="/select"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-brand-active)] px-8 py-4 text-base font-semibold text-white shadow-xl transition-[var(--transition-hover)] hover:scale-105 sm:w-auto lg:px-10 lg:py-5 lg:text-lg"
                >
                  <Upload size={20} />
                  파일 업로드하고 시작하기
                </Link>

                <Link
                  to="/guide"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-white)] px-8 py-4 text-base font-semibold text-[var(--color-text-heading)] shadow-xl transition-[var(--transition-hover)] hover:scale-105 sm:w-auto lg:px-10 lg:py-5 lg:text-lg"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-primary)]">
                    <Play
                      size={11}
                      fill="white"
                      color="white"
                      className="ml-[1px]"
                    />
                  </span>
                  서비스 가이드
                </Link>
              </div>
            </div>

            <div className="flex w-full flex-1 justify-center lg:justify-end">
              <img
                src={img}
                alt="Hero"
                className="hero-float w-[240px] max-w-full sm:w-[360px] md:w-[480px] lg:w-[760px] lg:max-w-none"
              />
            </div>
          </div>
        </section>

        {/* Why SpeaKO Section */}
        <section
          ref={whyRef}
          className="relative isolate overflow-hidden flex w-full scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 items-center px-6 py-16 sm:px-10 md:px-16 lg:h-screen lg:px-28 lg:py-24"
        >
          <div
            aria-hidden="true"
            className="hidden lg:block absolute pointer-events-none -z-10"
            style={{
              bottom: "-550px",
              left: "-500px",
              width: "1100px",
              height: "700px",
              transform: "rotate(-37.9deg)",
              transformOrigin: "top left",
              borderRadius: "9999px",
              background:
                "radial-gradient(at 55% 63%, rgba(165, 180, 252, 0.5) 0%, rgba(255, 255, 255, 0) 70%)",
              filter: "blur(150px)",
            }}
          />
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-start gap-10 lg:flex-row lg:gap-4">
            {/* Left - 텍스트 */}
            <div className="w-full text-center lg:-mt-4 lg:w-[500px] lg:shrink-0 lg:text-left">
              <p className="text-left text-[20px] font-bold bg-[image:var(--gradient-brand-active)] bg-clip-text text-transparent sm:text-[22px] lg:mt-4 lg:text-[25px]">
                Why SpeaKO
              </p>

              <h2 className="mt-4 text-[32px] font-bold leading-snug text-[var(--color-text-heading)] sm:text-[44px] md:text-[56px] lg:mt-6 lg:text-[70px]">
                발표가 막막한
                <br />
                3가지 이유
              </h2>

              <p className="mt-4 text-base leading-7 text-[var(--color-text-body)] sm:text-lg lg:mt-5 lg:text-[25px]">
                대부분의 사람들이 발표를 앞두고
                <br />
                어려워하는 부분들입니다.
              </p>
            </div>

            {/* Right - 카드 3개 */}
            <div
              className={`grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-40 lg:flex lg:flex-1 lg:grid-cols-none lg:gap-8 ${
                activeSection === 1 ? "reveal-active" : ""
              }`}
            >
              {REASONS.map((reason) => {
                const Icon = reason.icon;

                return (
                  <div
                    key={reason.id}
                    className="reveal-item relative w-full pt-8 lg:w-[340px]"
                  >
                    {/* Number */}
                    <span className="absolute left-8 -top-6 z-0 select-none text-[56px] font-semibold leading-none text-indigo-100 lg:text-[72px]">
                      {reason.number}
                    </span>

                    {/* Card */}
                    <div
                      className="
                        relative z-10 flex h-auto min-h-[360px] w-full flex-col items-start gap-11
                        rounded-[20px] bg-gradient-to-br from-white/10 to-indigo-500/10
                        outline outline-1 outline-offset-[-1px] outline-white
                        px-7 py-8
                        transition-all duration-300 hover:-translate-y-2
                        lg:h-[400px] lg:w-[340px] lg:px-9
                      "
                    >
                      <div className="glass-icon-box flex h-14 w-14 items-center justify-center rounded-2xl lg:h-16 lg:w-16">
                        <Icon
                          size={24}
                          className="text-[var(--color-brand-primary)] lg:size-[26px]"
                        />
                      </div>

                      <div className="flex flex-col items-start gap-5">
                        <h3 className="whitespace-nowrap text-[24px] font-bold leading-snug text-[var(--color-text-heading)] lg:text-[26px]">
                          {reason.title}
                        </h3>
                        <p className="whitespace-pre-line text-[15px] leading-7 text-[var(--color-text-body)] lg:text-[17px] lg:leading-8">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Main Function Section */}
      <section
        ref={mainRef}
        className="relative isolate overflow-hidden flex w-full scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 flex-col items-center justify-center bg-[#F8F9FF] px-6 pt-16 pb-16 sm:px-10 sm:pt-20 md:px-16 lg:min-h-screen lg:px-28 lg:pt-24 lg:pb-20"
      >
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <img
            src={mainfunctionbackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <MainChip text="Main Function" />

        <h2 className="mt-4 text-center text-[24px] font-bold leading-tight text-[var(--color-text-heading)] sm:text-[32px] md:text-[40px] lg:mt-6 lg:text-[50px]">
          SpeaKO의 3가지 핵심 기능
        </h2>

        <p className="mt-3 text-center text-sm text-[var(--color-text-body)] sm:text-base lg:text-[18px]">
          대본 생성부터 발음 평가까지, 발표의 모든 과정을 케어합니다.
        </p>

       <div
          className={`mx-auto mt-6 flex w-full max-w-[1600px] flex-col items-center justify-center gap-10 lg:flex-row lg:flex-nowrap lg:mt-8 lg:gap-12 ${
            activeSection === 2 ? "reveal-active" : ""
          }`}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="
            reveal-item group flex h-auto w-full max-w-[420px] flex-col items-center
            rounded-[20px] bg-gradient-to-br from-white/10 to-indigo-500/10
            outline outline-1 outline-offset-[-1px] outline-white
            px-7 py-9
            transition-all duration-300 hover:-translate-y-2
            md:w-[320px] lg:h-[500px] lg:w-[460px] lg:px-10 lg:py-10
          "
            >
              {/* Icon */}
              <div className="flex h-[165px] w-64 items-center justify-center p-2.5 lg:h-[220px]">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex w-full flex-col items-start gap-3">
                {/* Badge */}
                <span className="text-base font-semibold text-indigo-500">
                  {feature.badge}
                </span>

                {/* Title + Description */}
                <div className="flex flex-col items-start gap-4 pl-1">
                  <h3 className="text-2xl font-bold leading-7 text-[var(--color-text-heading)] lg:text-[32px]">
                    {feature.title}
                  </h3>
                  <p className="whitespace-pre-line text-base leading-7 text-[var(--color-text-body)]">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <SubChip
                      key={tag.label}
                      text={tag.label}
                      icon={tag.icon}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="w-full border-t border-gray-100 bg-white px-6 py-12 sm:px-10 md:px-16 lg:px-28 lg:py-16"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-10 text-center md:flex-row md:flex-wrap md:items-start md:justify-center md:gap-16 md:text-left lg:gap-50">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <img src={logo} alt="SpeaKO" className="h-16 w-auto" />
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-body)]">
              AI 기술을 통해 당신의 발표를 완성합니다.
              <br />
              PPT 분석부터 발음 코칭까지
              <br />
              무대 위의 자신감을 디자인하세요.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-bold text-[var(--color-text-heading)]">
              Product
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-body)]">
              <li>
                <Link
                  to="/#features"
                  className="transition hover:text-[var(--color-brand-primary)]"
                >
                  주요 기능
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="transition hover:text-[var(--color-brand-primary)]"
                >
                  요금 안내
                </Link>
              </li>
              <li>
                <Link
                  to="/updates"
                  className="transition hover:text-[var(--color-brand-primary)]"
                >
                  업데이트 소식
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold text-[var(--color-text-heading)]">
              Support
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-body)]">
              <li>
                <Link
                  to="/guide"
                  className="transition hover:text-[var(--color-brand-primary)]"
                >
                  사용 가이드
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="transition hover:text-[var(--color-brand-primary)]"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-lg font-bold text-[var(--color-text-heading)] transition hover:text-[var(--color-brand-primary)]"
            >
              Connect
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-[var(--color-text-body)] lg:mt-20">
          © 2026 SPEAKO AI. All right reserved.
        </p>
      </footer>

      {/* Scroll to Top Button */}
      {isTopButtonVisible && (
        <button
          onClick={scrollToTop}
          aria-label="맨 위로 이동"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full border border-[var(--color-text-heading)] bg-white text-[var(--color-text-heading)] transition-[var(--transition-hover)] hover:-translate-y-1 sm:bottom-10 sm:right-10 sm:h-16 sm:w-16"
        >
          <ArrowUp size={20} strokeWidth={2.5} className="sm:size-[22px]" />
          <span className="text-xs font-bold tracking-wide sm:text-sm">
            TOP
          </span>
        </button>
      )}
    </div>
  );
};

export default HomePage;