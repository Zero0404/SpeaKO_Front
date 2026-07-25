import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/SpeaKO-logo.svg";
import LinkButton from "./LinkButton";
import Login from "../modals/Login";
import Signup from "../modals/SignUp";

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="absolute left-0 top-0 right-0 z-50 h-20 w-full transparent-bg">
        <div className="mx-auto flex h-full max-w-[2000px] items-center justify-between px-4 sm:px-8 lg:px-12">
          {/* 왼쪽 */}
          <div className="flex items-center gap-6 lg:gap-16">
            <Link to="/">
              <img
                src={logo}
                alt="SpeaKO"
                className="h-9 w-auto lg:h-11"
              />
            </Link>

            {/* Desktop 메뉴 */}
            <nav className="hidden items-center gap-12 lg:flex">
              <LinkButton to="/service">서비스 소개</LinkButton>
              <LinkButton to="/pricing">요금 안내</LinkButton>
            </nav>
          </div>

          {/* Desktop 로그인 */}
          <div className="hidden items-center gap-6 lg:flex">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-2xl hover-effect-btn is-active px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-105"
            >
              로그인
            </button>
          </div>

          {/* Mobile 햄버거 */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="lg:hidden"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile 메뉴 */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-20 bg-white shadow-lg lg:hidden">
            <nav className="flex flex-col px-6 py-5">
              <Link
                to="/service"
                className="py-3 text-sm font-medium text-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                서비스 소개
              </Link>

              <Link
                to="/pricing"
                className="py-3 text-sm font-medium text-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                요금 안내
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="mt-4 rounded-2xl hover-effect-btn is-active py-3 text-sm font-semibold text-white shadow-md"
              >
                로그인
              </button>
            </nav>
          </div>
        )}
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