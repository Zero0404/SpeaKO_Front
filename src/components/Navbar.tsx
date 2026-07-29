import { useState } from "react";
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

// TODO: 로그인 상태/유저 정보를 전역 상태(Context 등)로 관리하게 되면 이 mock 값을 대체합니다.
// (백엔드 로그인 API 정상화 전까지 마이페이지 화면 테스트용으로 임시 고정)
const CURRENT_USER = {
  name: "홍길동",
  email: "honggildong@naver.com",
};

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const handleLogoutConfirm = () => {
    // TODO: 로그아웃 API 연동 시 여기서 함께 호출
    console.log("로그아웃 처리");
  };

  const handleDeleteAccountConfirm = () => {
    // TODO: 회원 탈퇴 API 연동 시 여기서 함께 호출
    console.log("회원 탈퇴 처리");
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 w-full h-28 transparent-bg">
        <div className="flex h-full w-full items-center justify-between py-6 px-6 lg:px-12">
          {/* 왼쪽 */}
          <div className="flex items-center gap-20">
            <Link to="/">
              <img
                src={logo}
                alt="SpeaKO"
                className="h-14 w-auto"
              />
            </Link>

            <nav className="flex items-center gap-14">
              <LinkButton to="/service">서비스 소개</LinkButton>
              <LinkButton to="/pricing">요금 안내</LinkButton>
            </nav>
          </div>

          {/* 오른쪽 */}
          <div className="flex items-center gap-7">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-label="마이페이지"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-brand-light)] to-[color:var(--color-brand-primary)]"
              >
                <User size={22} className="text-[color:var(--color-white)]" />
              </button>

              {isAccountMenuOpen && (
                <AccountMenu
                  name={CURRENT_USER.name}
                  email={CURRENT_USER.email}
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

            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-2xl hover-effect-btn is-active px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:scale-105"
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

      {/* 설정 모달 (계정 설정 / 요금제 업그레이드에서 진입) */}
      {settingsTab && (
        <SetModal
          initialTab={settingsTab}
          user={CURRENT_USER}
          onClose={() => setSettingsTab(null)}
          onSaveProfile={(data) => {
            // TODO: 프로필 저장 API 연동
            console.log("프로필 저장", data);
          }}
          onDeleteAccountClick={() => {
            setSettingsTab(null);
            setIsDeleteAccountOpen(true);
          }}
        />
      )}

      {/* 로그아웃 확인 */}
      {isLogoutOpen && (
        <Logout onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
      )}

      {/* 회원 탈퇴 확인 */}
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
