import type { FC } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Play, FileText, TrendingDown, Mic } from "lucide-react";

import img from "../assets/Home Image.png";
import footerImg from "../assets/Footer.png";
import topButtonImg from "../assets/Top_Button.png";

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

interface FeatureCardData {
    id: string;
    badge: string;
    image: string;
    title: string;
    description: string;
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
    },
    {
        id: "pronun-coach",
        badge: "PRONUNCIATION COACHING",
        image: FeatureCard2,
        title: "발음 코칭",
        description: "생성된 대본에서 발음 주의 단어를 자동 추출하고 표준 발음 표기를 제공합니다. 대본 내 위치 하이라이트",
    },
    {
        id: "pronun-eval",
        badge: "PRONUNCIATION EVALUATION",
        image: FeatureCard3,
        title: "발음 평가",
        description: "음성 파일(MP3/MPA)을 업로드하면 AI가 발음 정확도를 0~5점으로 평가하고 실제 인식된 텍스트를 확인할 수 있습니다.",
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
        // pt-20 제거 (헤더가 absolute로 위를 덮고 첫 번째 섹션 배경이 자연스럽게 비치도록 수정)
        <div className="w-full bg-[var(--color-white)]">
            {/* Hero Section */}
<section className="relative h-screen w-full snap-start flex items-center bg-gradient-to-br from-white via-[#F5F7FF] to-white">
    {/* h-full과 pt-20을 함께 주어 정확히 화면 높이를 유지하면서 헤더 공간 확보 */}
    <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-28 pt-20">
        {/* Left */}
        <div className="w-auto shrink-0">
            <MainChip text="AI Presentation Coach" />

            <h1 className="mt-8 whitespace-nowrap text-[56px] font-bold leading-tight text-[var(--color-text-heading)]">
                발표가 두려운 당신을 위한
            </h1>

            <h1 className="whitespace-nowrap text-[56px] font-bold leading-tight text-[var(--color-brand-primary)]">
                AI 코치, SpeaKO
            </h1>

            <p className="mt-10 text-xl leading-9 text-[var(--color-text-body)]">
                PPT 분석부터 맞춤 대본 생성, 실시간 발음 평가까지
                <br />
                완벽한 발표를 위한 모든 과정을 도와드려요.
            </p>

            <div className="mt-14 flex gap-6">
                <Link
                    to="/select"
                    className="flex items-center gap-2 rounded-2xl bg-[image:var(--gradient-brand-active)] px-10 py-5 text-lg font-semibold text-white shadow-xl transition-[var(--transition-hover)] hover:scale-105"
                >
                    <Upload size={20} />
                    파일 업로드하고 시작하기
                </Link>

                <Link
                    to="/guide"
                    className="flex items-center gap-2 rounded-2xl bg-[var(--color-white)] px-10 py-5 text-lg font-semibold text-[var(--color-text-heading)] shadow-xl transition-[var(--transition-hover)] hover:scale-105"
                >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-primary)]">
                        <Play size={11} fill="white" color="white" className="ml-[1px]" />
                    </span>
                    서비스 가이드
                </Link>
            </div>
        </div>

        {/* Right */}
        <div className="flex justify-end">
            <img src={img} alt="Hero" className="w-[760px] max-w-none" />
        </div>
    </div>
</section>

            {/* Why SpeaKO Section */}
            <section className="flex min-h-screen w-full snap-start scroll-mt-20 items-center bg-[var(--color-white)] px-28 py-24">
                <div className="mx-auto flex w-full max-w-[1600px] items-start gap-4">
                    {/* Left - 텍스트 */}
                    <div className="mt-8 w-[500px] shrink-0">
                        <p className="mt-4 text-left text-[25px] font-bold bg-[image:var(--gradient-brand-active)] bg-clip-text text-transparent">
                            Why SpeaKO
                        </p>

                        <h2 className="mt-6 text-[70px] font-bold leading-snug text-[var(--color-text-heading)]">
                            발표가 막막한
                            <br />
                            3가지 이유
                        </h2>

                        <p className="mt-5 text-[25px] leading-7 text-[var(--color-text-body)]">
                            대부분의 사람들이 발표를 앞두고
                            <br />
                            어려워하는 부분들입니다.
                        </p>
                    </div>

                    {/* Right - 카드 3개 */}
                    <div className="mt-64 flex flex-1 gap-8">
                        {REASONS.map((reason) => {
                            const Icon = reason.icon;

                            return (
                                <div
                                    key={reason.id}
                                    className="relative w-[340px] pt-6"
                                >
                                    {/* Number */}
                                    <span
                                        className="
                                            absolute
                                            left-10
                                            -top-8
                                            z-0
                                            select-none
                                            text-[72px]
                                            font-bold
                                            leading-none
                                            text-[var(--color-brand-light)]/45
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
                                            h-[428px]
                                            w-[340px]
                                            flex-col
                                            items-start
                                            rounded-[28px]
                                            bg-gradient-to-br
                                            from-[var(--color-brand-light)]/10
                                            via-white
                                            to-white
                                            px-9
                                            py-8
                                            shadow-[0_12px_32px_rgba(0,0,0,0.08)]
                                            transition-[var(--transition-hover)]
                                            hover:-translate-y-2
                                            hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)]
                                        "
                                    >
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-primary)]/10 shadow-sm">
                                            <Icon
                                                size={26}
                                                className="text-[var(--color-brand-primary)]"
                                            />
                                        </div>

                                        <h3 className="mt-7 text-[30px] font-bold leading-snug text-[var(--color-text-heading)]">
                                            {reason.title}
                                        </h3>

                                        <p className="mt-4 whitespace-pre-line text-[17px] leading-8 text-[var(--color-text-body)]">
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
            <section className="flex min-h-screen w-full snap-start scroll-mt-20 flex-col items-center justify-center bg-[#F8F9FF] px-28 py-20">
                <MainChip text="Main Function" />

                <h2 className="mt-8 text-center text-[60px] font-bold leading-tight text-[var(--color-text-heading)]">
                    SpeaKO의 3가지 핵심 기능
                </h2>

                <p className="mt-4 text-center text-[20px] text-[var(--color-text-body)]">
                    대본 생성부터 발음 평가까지, 발표의 모든 과정을 케어합니다.
                </p>

                <div className="mx-auto mt-12 flex w-full max-w-[1600px] justify-center gap-12">
                    {FEATURES.map((feature) => {
                        return (
                            <div
                                key={feature.id}
                                className="
                                    group
                                    flex
                                    h-[576px]
                                    w-[472px]
                                    flex-col
                                    items-start
                                    rounded-[32px]
                                    border
                                    border-[#ECECFF]
                                    bg-white/20
                                    backdrop-blur-md
                                    px-12
                                    py-12
                                    shadow-[0_8px_30px_rgba(120,110,255,0.05)]
                                    transition-all
                                    duration-300
                                    hover:-translate-y-2
                                    hover:border-[#7A6CFF]
                                    hover:bg-white/45
                                    hover:shadow-[0_20px_45px_rgba(108,99,255,0.18)]
                                "
                            >
                                {/* Icon */}
                                <div className="flex h-[170px] w-full items-center justify-center">
                                    <div className="flex h-36 w-36 items-center justify-center rounded-[36px] bg-[var(--color-brand-primary)]/10">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="
                                                w-[270px]
                                                object-contain
                                                transition-transform
                                                duration-300
                                                group-hover:scale-105
                                            "
                                        />
                                    </div>
                                </div>

                                {/* Badge */}
                                <span className="mt-8 text-sm font-bold tracking-wide text-[var(--color-brand-light)] transition-colors duration-300">
                                    {feature.badge}
                                </span>

                                {/* Title */}
                                <h3 className="mt-5 text-[42px] font-bold leading-tight transition-colors duration-300">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-6 text-[20px] leading-9 transition-opacity duration-300 group-hover:opacity-100">
                                    {feature.description}
                                </p>

                                {/* Bottom Tags */}
                                <div className="mt-auto flex gap-3">
                                    <span className="rounded-lg bg-[#EEF1FF] px-4 py-2 text-sm font-semibold text-gray-500">
                                        PPT/PDF
                                    </span>
                                    <span className="rounded-lg bg-[#EEF1FF] px-4 py-2 text-sm font-semibold text-gray-500">
                                        TEXT
                                    </span>
                                    <span className="rounded-lg bg-[#EEF1FF] px-4 py-2 text-sm font-semibold text-gray-500">
                                        DOCX
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full snap-start scroll-mt-20">
                <img src={footerImg} alt="Footer" className="block w-full" />
            </footer>

            {/* Scroll to Top Button */}
            {isTopButtonVisible && (
                <button
                    onClick={scrollToTop}
                    aria-label="맨 위로 이동"
                    className="fixed bottom-10 right-10 z-40 transition-[var(--transition-hover)] hover:-translate-y-1"
                >
                    <img src={topButtonImg} alt="TOP" className="h-16 w-16" />
                </button>
            )}
        </div>
    );
};

export default HomePage;