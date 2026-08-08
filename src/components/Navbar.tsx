import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/SpeaKO-logo.svg";
import LinkButton from "./LinkButton";
import Login from "../modals/Login";
import Signup from "../modals/SignUp";
import Logout from "../modals/Logout";
import DeleteAccount from "../modals/DeleteAccount";
import AccountMenu from "../modals/AccountMenu";
import SetModal from "../modals/SetModal";
import type { SettingsTab } from "../modals/SetModal";
import { User } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;

  const [isScrolled, setIsScrolled] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  // 스크롤 시 배경 전환 (겹침 방지)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoutConfirm = () => {
    // TODO: 로그아웃 API 연동 시 여기서 함께 호출
    useAuthStore.getState().logout();
    setIsAccountMenuOpen(false);
    setIsLogoutOpen(false);
    window.location.reload();
  };

  const handleDeleteAccountConfirm = () => {
    // TODO: 회원 탈퇴 API 연동 시 여기서 함께 호출
    useAuthStore.getState().logout();
    setIsDeleteAccountOpen(false);
    window.location.reload();
  };

  const CURRENT_USER = {
    name: "홍길동",
    email: "honggildong@naver.com",
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[2000px] items-center justify-between px-4 py-3 sm:px-5 sm:py-3 md:px-8 md:py-4 lg:px-12 lg:py-6">
          {/* 왼쪽 */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-6 md:gap-10 lg:gap-20">
            <Link to="/" className="shrink-0">
              <img
                src={logo}
                alt="SpeaKO"
                className="h-7 w-auto sm:h-9 md:h-10 lg:h-16"
              />
            </Link>

            <nav className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
              <LinkButton
                to="/service"
                className="hidden md:inline-flex text-base lg:text-lg"
              >
                서비스 소개
              </LinkButton>
              <LinkButton
                to="/pricing"
                className="text-xs sm:text-sm md:text-base lg:text-lg"
              >
                요금 안내
              </LinkButton>
            </nav>
          </div>

          {/* 오른쪽 */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-7">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  aria-label="마이페이지"
                  className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)] sm:size-9 md:size-10 lg:size-11"
                >
                  <User size={18} className="text-[color:var(--color-white)] sm:size-[18px] md:size-5 lg:size-[22px]" />
                </button>

                {isAccountMenuOpen && (
                  <AccountMenu
                    name={CURRENT_USER.name}
                    email={CURRENT_USER.email}
                    onClose={() => setIsAccountMenuOpen(false)}
                    onOpenSettings={(tab) => setSettingsTab(tab)}
                    onLogoutClick={() => setIsLogoutOpen(true)}
                    onContactClick={() => console.log("문의하기")}
                    onNotificationClick={() => console.log("알림")}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="whitespace-nowrap rounded-xl hover-effect-btn is-active px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm md:px-5 md:py-2.5 lg:rounded-2xl lg:px-8 lg:py-3.5 lg:text-base"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 모달들은 이전과 동일 */}
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
      {settingsTab && (
        <SetModal
          initialTab={settingsTab}
          user={CURRENT_USER}
          onClose={() => setSettingsTab(null)}
          onSaveProfile={(data) => console.log("프로필 저장", data)}
          onDeleteAccountClick={() => {
            setSettingsTab(null);
            setIsDeleteAccountOpen(true);
          }}
        />
      )}
      {isLogoutOpen && (
        <Logout onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
      )}
      {isDeleteAccountOpen && (
        <DeleteAccount
          onClose={() => setIsDeleteAccountOpen(false)}
          onConfirm={handleDeleteAccountConfirm}
        />
      )}
    </>
  );
};

export default Navbar;