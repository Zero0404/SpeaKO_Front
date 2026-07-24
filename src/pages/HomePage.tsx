import type { FC } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Play, FileText, TrendingDown, Mic, ExternalLink, ArrowUp, Volume2, Highlighter, CheckCircle2 } from "lucide-react";

import img from "../assets/Home Image.png";
import logo from "../assets/SpeaKO-logo.svg";

import FeatureCard1  from "../assets/feature-script-illustration.svg";
import FeatureCard2 from "../assets/feature-coach-illustration.svg";
import FeatureCard3 from "../assets/발음 평가 Image.png"

import MainChip from "../components/MainChip";

interface ReasonCardData {
    id: string;
    number: string;
    icon: FC<{ size?: number; className?: string }>;
    title: string;
    description: string;
}

interface FeatureTag {
    icon: FC<{ size?: number; className?: string }>;
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
        description: "PPT 내용은 있지만,\n이를 자연스러운 말로\n풀어내기 막막합니다.",
    },
    {
        id: "flow",
        number: "02",
        icon: TrendingDown,
        title: "불안정한 발표 흐름",
        description: "긴장으로 인해 말이 빨라지거나\n준비한 내용을 쉽게\n잊어버립니다.",
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
        description: "PPT/PDF 업로드 또는 텍스트 입력으로 AI가자동으로 발표 대본을 생성합니다. 발표 시간·청중·말투 설정 가능",
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
        description: "생성된 대본에서 발음 주의 단어를 자동 추출하고 표준 발음 표기를 제공합니다. 대본 내 위치 하이라이트",
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
        description: "음성 파일(MP3/MPA)을 업로드하면 AI가 발음 정확도를 0~5점으로 평가하고  실제 인식된 텍스트를 확인할 수 있습니다.",
        tags: [{ icon: CheckCircle2, label: "점수 미리보기" }],
    },
];

const HomePage: FC = () => {
    const [isTopButtonVisible, setIsTopButtonVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsTopButtonVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="w-full pt-20 bg-[var(--color-white)]">
            {/* Hero Section */}
            <section className="w-full snap-start scroll-mt-20 bg-gradient-to-br from-white via-[#F5F7FF] to-white lg:min-h-[calc(100vh-80px)]">
                <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-10 px-6 py-16 sm:px-10 md:px-16 lg:min-h-[calc(100vh-80px)] lg:flex-row lg:gap-28 lg:px-28 lg:py-0">
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
                                    <Play size={11} fill="white" color="white" className="ml-[1px]" />
                                </span>
                                서비스 가이드
                            </Link>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex w-full flex-1 justify-center lg:justify-end">
                        <img
                            src={img}
                            alt="Hero"
                            className="w-[240px] max-w-full sm:w-[360px] md:w-[480px] lg:w-[760px] lg:max-w-none"
                        />
                    </div>
                </div>
            </section>

            {/* Why SpeaKO Section */}
            <section className="flex w-full snap-start scroll-mt-20 items-center bg-[var(--color-white)] px-6 py-16 sm:px-10 md:px-16 lg:min-h-screen lg:px-28 lg:py-24">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col items-start gap-10 lg:flex-row lg:gap-4">
                    {/* Left - 텍스트 */}
                    <div className="w-full text-center lg:mt-8 lg:w-[500px] lg:shrink-0 lg:text-left">
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
                    <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-64 lg:flex lg:flex-1 lg:grid-cols-none lg:gap-8">
                        {REASONS.map((reason) => {
                            const Icon = reason.icon;

                            return (
                                <div
                                    key={reason.id}
                                    className="relative w-full pt-6 lg:w-[340px]"
                                >
                                    {/* Number */}
                                    <span
                                        className="
                                            absolute
                                            left-10
                                            -top-8
                                            z-0
                                            select-none
                                            text-[56px]
                                            font-bold
                                            leading-none
                                            text-[var(--color-brand-light)]/45
                                            lg:text-[72px]
                                        "
                                    >
                                        {reason.number}
                                    </span>

                                    {/* Card */}
                                    <div
                                        className="
                                            relative
                                            z-10
                                            flex
                                            h-auto
                                            min-h-[360px]
                                            w-full
                                            flex-col
                                            items-start
                                            rounded-[28px]
                                            bg-gradient-to-br
                                            from-[var(--color-brand-light)]/10
                                            via-white
                                            to-white
                                            px-7
                                            py-8
                                            shadow-[0_12px_32px_rgba(0,0,0,0.08)]
                                            transition-[var(--transition-hover)]
                                            hover:-translate-y-2
                                            hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)]
                                            lg:h-[428px]
                                            lg:w-[340px]
                                            lg:px-9
                                        "
                                    >
                                        <div className="glass-icon-box flex h-14 w-14 items-center justify-center rounded-2xl lg:h-16 lg:w-16">
                                            <Icon
                                                size={24}
                                                className="text-[var(--color-brand-primary)] lg:size-[26px]"
                                            />
                                        </div>

                                        <h3 className="mt-6 text-[24px] font-bold leading-snug text-[var(--color-text-heading)] lg:mt-7 lg:text-[30px]">
                                            {reason.title}
                                        </h3>

                                        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[var(--color-text-body)] lg:mt-4 lg:text-[17px] lg:leading-8">
                                            {reason.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Main Function Section */}
            <section className="flex w-full snap-start scroll-mt-20 flex-col items-center justify-center bg-[#F8F9FF] px-6 py-16 sm:px-10 md:px-16 lg:min-h-screen lg:px-28 lg:py-20">
                <MainChip text="Main Function" />

                <h2 className="mt-6 text-center text-[28px] font-bold leading-tight text-[var(--color-text-heading)] sm:text-[38px] md:text-[48px] lg:mt-8 lg:text-[60px]">
                    SpeaKO의 3가지 핵심 기능
                </h2>

                <p className="mt-4 text-center text-sm text-[var(--color-text-body)] sm:text-base lg:text-[20px]">
                    대본 생성부터 발음 평가까지, 발표의 모든 과정을 케어합니다.
                </p>

                <div className="mx-auto mt-10 flex w-full max-w-[1600px] flex-col items-center justify-center gap-8 md:flex-row md:flex-wrap lg:mt-12 lg:gap-12">
                    {FEATURES.map((feature) => {

                        return (
                            <div
                                key={feature.id}
                                className="
                                    group
                                    flex
                                    h-auto
                                    w-full
                                    max-w-[420px]
                                    flex-col
                                    items-start
                                    rounded-[32px]

                                    border
                                    border-[#ECECFF]

                                    bg-white/20
                                    backdrop-blur-md

                                    px-8
                                    py-10

                                    shadow-[0_8px_30px_rgba(120,110,255,0.05)]

                                    transition-all
                                    duration-300

                                    hover:-translate-y-2
                                    hover:border-[#7A6CFF]
                                    hover:bg-white/45
                                    hover:shadow-[0_20px_45px_rgba(108,99,255,0.18)]

                                    md:w-[340px]

                                    lg:h-[576px]
                                    lg:w-[472px]
                                    lg:px-12
                                    lg:py-12
                                "
                            >
                                {/* Icon */}
                                <div className="flex h-[130px] w-full items-center justify-center lg:h-[170px]">
                                    <div className="flex h-28 w-28 items-center justify-center rounded-[36px] bg-[var(--color-brand-primary)]/10 lg:h-36 lg:w-36">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="
                                                w-[190px]
                                                object-contain
                                                transition-transform
                                                duration-300
                                                group-hover:scale-105
                                                lg:w-[270px]
                                            "
                                        />
                                    </div>
                                </div>

                                {/* Badge */}
                                <span
                                    className="
                                        mt-6
                                        text-xs
                                        font-bold
                                        tracking-wide
                                        text-[var(--color-brand-light)]
                                        transition-colors
                                        duration-300
                                        lg:mt-8
                                        lg:text-sm
                                    "
                                >
                                    {feature.badge}
                                </span>

                                {/* Title */}
                                <h3
                                    className="
                                        mt-4
                                        text-[28px]
                                        font-bold
                                        leading-tight
                                        transition-colors
                                        duration-300
                                        lg:mt-5
                                        lg:text-[42px]
                                    "
                                >
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        leading-7
                                        transition-opacity
                                        duration-300
                                        group-hover:opacity-100
                                        lg:mt-6
                                        lg:text-[20px]
                                        lg:leading-9
                                    "
                                >
                                    {feature.description}
                                </p>

                                {/* Bottom Tags */}
                                <div className="mt-6 flex flex-wrap gap-2 lg:mt-auto lg:gap-3">
                                    {feature.tags.map((tag) => {
                                        const TagIcon = tag.icon;
                                        return (
                                            <span
                                                key={tag.label}
                                                className="flex items-center gap-1.5 rounded-lg bg-[#EEF1FF] px-3 py-1.5 text-xs font-semibold text-gray-500 lg:px-4 lg:py-2 lg:text-sm"
                                            >
                                                <TagIcon size={13} className="shrink-0" />
                                                {tag.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full snap-start scroll-mt-20 border-t border-gray-100 bg-white px-6 py-12 sm:px-10 md:px-16 lg:px-28 lg:py-16">
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
                        <h4 className="text-lg font-bold text-[var(--color-text-heading)]">Product</h4>
                        <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-body)]">
                            <li>
                                <Link to="/#features" className="transition hover:text-[var(--color-brand-primary)]">
                                    주요 기능
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="transition hover:text-[var(--color-brand-primary)]">
                                    요금 안내
                                </Link>
                            </li>
                            <li>
                                <Link to="/updates" className="transition hover:text-[var(--color-brand-primary)]">
                                    업데이트 소식
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold text-[var(--color-text-heading)]">Support</h4>
                        <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-body)]">
                            <li>
                                <Link to="/guide" className="transition hover:text-[var(--color-brand-primary)]">
                                    사용 가이드
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="transition hover:text-[var(--color-brand-primary)]">
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
                    <span className="text-xs font-bold tracking-wide sm:text-sm">TOP</span>
                </button>
            )}
        </div>
    );
};

export default HomePage;