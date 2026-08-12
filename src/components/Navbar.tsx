import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { useUIStore } from "../store/uiStore";



const Navbar = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken;
  const storeUser = useAuthStore((state) => state.user);


  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);

  // 로그인 모달은 HomePage 등 다른 곳에서도 열 수 있어야 해서 전역 스토어로 관리합니다.
  // (예: 비로그인 상태에서 "파일 업로드하고 시작하기" 클릭 시)
  const isLoginOpen = useUIStore((state) => state.isLoginOpen);
  const openLogin = useUIStore((state) => state.openLogin);
  const closeLogin = useUIStore((state) => state.closeLogin);

  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  // 스크롤 시 배경 전환 (HomePage가 아닌 페이지에서만 사용)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // HomePage: 3개 섹션 내내 항상 투명 / 다른 페이지: 스크롤하면 배경 켜짐
  const showNavbarBackground = !isHomePage && isScrolled;

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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full h-20 sm:h-24 lg:h-28 transition-colors duration-300 ${
          showNavbarBackground
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : "transparent-bg"
        }`}
      >
        <div className="flex h-full w-full items-center justify-between py-4 px-4 sm:py-5 sm:px-6 lg:py-6 lg:px-12">
          {/* 왼쪽 */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-8 lg:gap-20">
            <Link to="/" className="shrink-0">
              <img
                src={logo}
                alt="SpeaKO"
                className="h-9 w-auto sm:h-11 lg:h-14"
              />
            </Link>

            <nav className="flex items-center gap-3 sm:gap-8 lg:gap-14">
              {/* 홈페이지 2번째 섹션(Why SpeaKO)으로 스크롤 이동 */}
              <LinkButton
                to="/#why-section"
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
          <div className="flex shrink-0 items-center gap-3 sm:gap-5 lg:gap-7">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  aria-label="마이페이지"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)] sm:size-10 lg:size-11"
                >
                  <User size={18} className="text-[color:var(--color-white)] sm:size-5 lg:size-[22px]" />
                </button>

                {isAccountMenuOpen && (
                  <AccountMenu
                    name={storeUser?.name ?? ""}
                    email={storeUser?.email ?? ""}
                    onClose={() => setIsAccountMenuOpen(false)}
                    onOpenSettings={(tab) => setSettingsTab(tab)}
                    onLogoutClick={() => setIsLogoutOpen(true)}
                    onContactClick={() => {
                      // TODO: 문의하기 플로우 연동
                      console.log("문의하기");
                    }}
                    onNotificationClick={() => {
                      // TODO: 알림 플로우 연동
                      console.log("알림");
                    }}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="whitespace-nowrap rounded-xl px-4 py-2 text-sm hover-effect-btn is-active font-semibold text-white shadow-md transition hover:scale-105 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base lg:px-8 lg:py-3.5"
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
        onClose={closeLogin}
        onSignupClick={() => {
          closeLogin();
          setIsSignupOpen(true);
        }}
      />
      <Signup
        open={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginClick={() => {
          setIsSignupOpen(false);
          openLogin();
        }}
      />
      {settingsTab && (
        <SetModal
          initialTab={settingsTab}
          user={{
            name: storeUser?.name ?? "",
            email: storeUser?.email ?? "",
          }}
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
