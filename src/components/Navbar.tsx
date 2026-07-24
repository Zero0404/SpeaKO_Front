import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/SpeaKO-logo.svg";
import LinkButton from "./LinkButton";
import Login from "../modals/Login";
import Signup from "../modals/SignUp";
import { User } from "lucide-react";

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 w-full h-20 transparent-bg">
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
            <Link
              to="/mypage"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)]"
            >
              <User size={18} className="text-[color:var(--color-white)]"/>
            </Link>
            
            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-2xl hover-effect-btn is-active px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-105"
            >
              로그인
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

      {/* 회원가입 모달 */}
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