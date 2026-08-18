import { useState, type ReactNode } from "react";
import {
  Bell,
  CreditCard,
  LogOut,
  MessageCircleQuestion,
  Settings,
  User,
} from "lucide-react";
import type { SettingsTab } from "./SetModal";

interface AccountMenuProps {
  name: string;
  email: string;
  onClose: () => void;
  onOpenSettings: (tab: SettingsTab) => void;
  onLogoutClick: () => void;
}

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const MenuItem = ({ icon, label, onClick }: MenuItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-10 w-full items-center gap-2 rounded-lg p-3 text-left transition hover:bg-neutral-100"
  >
    {icon}
    <span className="text-center text-sm font-medium leading-4 text-zinc-800 font-['Pretendard']">
      {label}
    </span>
  </button>
);

const AccountMenu = ({
  name,
  email,
  onClose,
  onOpenSettings,
  onLogoutClick,
}: AccountMenuProps) => {
  const [isUpdatingModalOpen, setIsUpdatingModalOpen] = useState(false);

  const handle = (action: () => void) => {
    action();
    onClose();
  };

  // 업데이트 중인 기능 팝업 열기
  const handleUpdatingFeature = () => {
    setIsUpdatingModalOpen(true);
  };

  return (
    <>
      {/* 바깥 클릭 시 닫기 */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* 계정 메뉴 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[20px] bg-white p-6 shadow-[0px_10px_40px_0px_rgba(91,108,251,0.15)]"
      >
        {/* 프로필 요약 */}
        <div className="flex items-center gap-4">
          <div className="glass-icon-box flex size-16 shrink-0 items-center justify-center rounded-full">
            <User
              size={28}
              className="text-[color:var(--color-brand-primary)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-center text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
              {name}
            </span>

            <span className="text-center text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
              {email}
            </span>
          </div>
        </div>

        <div className="my-5 h-0 w-full outline outline-1 outline-offset-[-0.5px] outline-slate-500/25" />

        {/* 메뉴 */}
        <nav className="flex flex-col gap-1">
          <MenuItem
            icon={
              <Settings
                size={20}
                className="text-zinc-800"
              />
            }
            label="계정 설정"
            onClick={() =>
              handle(() => onOpenSettings("profile"))
            }
          />

          <MenuItem
            icon={
              <CreditCard
                size={20}
                className="text-zinc-800"
              />
            }
            label="요금제 업그레이드"
            onClick={() =>
              handle(() => onOpenSettings("plan"))
            }
          />

          <MenuItem
            icon={<MessageCircleQuestion size={20} className="text-zinc-800" />}
            label="문의하기"
            onClick={handleUpdatingFeature}
          />

          <MenuItem
            icon={<Bell size={20} className="text-zinc-800" />}
            label="알림"
            onClick={handleUpdatingFeature}
          />
        </nav>

        <div className="my-5 h-0 w-full outline outline-1 outline-offset-[-0.5px] outline-slate-500/25" />

        <MenuItem
          icon={
            <LogOut
              size={20}
              className="text-zinc-800"
            />
          }
          label="로그아웃"
          onClick={() => handle(onLogoutClick)}
        />
      </div>

      {/* 업데이트 중 기능 팝업 */}
      {isUpdatingModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
          onClick={() => setIsUpdatingModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-zinc-800">
              업데이트 중인 기능입니다
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              해당 기능은 현재 준비 중입니다.
              <br />
              조금만 기다려주세요.
            </p>

            <button
              type="button"
              onClick={() => setIsUpdatingModalOpen(false)}
              className="mt-6 w-full rounded-xl bg-[color:var(--color-brand-primary)] py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountMenu;