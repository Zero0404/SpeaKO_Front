import { Link } from "react-router-dom";
import logo from "../assets/SpeaKO-logo.png";
import LinkButton from "./LinkButton";

const Navbar = () => {
  return (
    <header className="w-full h-20 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-full max-w-[2000px] items-center justify-between px-12">
        {/* 왼쪽 */}
        <div className="flex items-center gap-16">
          <Link to="/">
            <img
              src={logo}
              alt="SpeaKO"
              className="h-11 w-auto"
            />
          </Link>

          <nav className="flex items-center gap-12">
            <LinkButton to="/service">서비스 소개</LinkButton>
            <LinkButton to="/pricing">요금 안내</LinkButton>
          </nav>
        </div>

        {/* 오른쪽 */}
        <div className="flex items-center gap-6">
          <LinkButton to="/login">로그인</LinkButton>

          <Link
            to="/signup"
            className="rounded-2xl bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-105"
          >
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;