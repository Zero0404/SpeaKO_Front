import { Link } from "react-router-dom";
import img from "../assets/Home Image.png";
import MainChip from "../components/MainChip";

const HomePage = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-white via-[#F5F7FF] to-white">
            <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center gap-32 px-20">
                {/* Left */}
                <div className="w-[46%]">
                    <MainChip text="AI Presentation Coach" />

                    <h1 className="mt-8 text-[56px] font-bold leading-tight text-[#222]">
                        발표가 두려운 당신을 위한
                    </h1>

                    <h1 className="text-[56px] font-bold leading-tight text-[#5D6CFF]">
                        AI 코치, SpeaKO
                    </h1>

                    <p className="mt-10 text-xl leading-9 text-gray-500">
                        PPT 분석부터 맞춤 대본 생성, 실시간 발음 평가까지
                        <br />
                        완벽한 발표를 위한 모든 과정을 도와드려요.
                    </p>

                    <div className="mt-14 flex gap-6">
                        <Link
                            to="/select"
                            className="rounded-2xl bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] px-10 py-5 text-lg font-semibold text-white shadow-xl transition duration-300 hover:scale-105"
                        >
                            파일 업로드하고 시작하기
                        </Link>

                        <Link
                            to="/guide"
                            className="rounded-2xl bg-white px-10 py-5 text-lg font-semibold text-[#333] shadow-xl transition duration-300 hover:scale-105"
                        >
                            서비스 가이드
                        </Link>
                    </div>
                </div>

                {/* Right */}
                <div className="flex w-[45%]">
                    <img
                        src={img}
                        alt="Hero"
                        className="w-[760px] max-w-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;