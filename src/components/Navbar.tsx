import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/SpeaKO-logo.png";
import LinkButton from "./LinkButton";
import Login from "../modals/Login";
import Signup from "../modals/SignUp";

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
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
            {/* 로그인 버튼 -> 모달 열기 */}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-sm font-medium text-gray-700 transition hover:text-[#6E8BFF]"
            >
              로그인
            </button>

            {/* 회원가입은 나중에 모달로 변경 예정 */}
            <button
              onClick={() => setIsSignupOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-105"
            >
              회원가입
            </button>
          </div>
        </div>
      </header>

      {/* 로그인 모달 */}
      <Login
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSignupClick={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />

      <Signup
        open={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginClick={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
};

export default Navbar;