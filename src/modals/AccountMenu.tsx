import type { ReactNode } from "react";
import { Bell, CreditCard, LogOut, MessageCircleQuestion, Settings, User } from "lucide-react";
import type { SettingsTab } from "./SetModal";

interface AccountMenuProps {
  name: string;
  email: string;
  onClose: () => void;
  /** 계정 설정 / 요금제 업그레이드 클릭 시 SetModal을 해당 탭으로 오픈 */
  onOpenSettings: (tab: SettingsTab) => void;
  onContactClick?: () => void;
  onNotificationClick?: () => void;
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
  onContactClick,
  onNotificationClick,
  onLogoutClick,
}: AccountMenuProps) => {
  const handle = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      {/* 바깥 클릭 시 닫기 */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[20px] bg-white p-6 shadow-[0px_10px_40px_0px_rgba(91,108,251,0.15)]"
      >
        {/* 프로필 요약 */}
        <div className="flex items-center gap-4">
          <div className="glass-icon-box flex size-16 shrink-0 items-center justify-center rounded-full">
            <User size={28} className="text-[color:var(--color-brand-primary)]" />
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
            icon={<Settings size={20} className="text-zinc-800" />}
            label="계정 설정"
            onClick={() => handle(() => onOpenSettings("profile"))}
          />
          <MenuItem
            icon={<CreditCard size={20} className="text-zinc-800" />}
            label="요금제 업그레이드"
            onClick={() => handle(() => onOpenSettings("plan"))}
          />
          <MenuItem
            icon={<MessageCircleQuestion size={20} className="text-zinc-800" />}
            label="문의하기"
            onClick={() => handle(() => onContactClick?.())}
          />
          <MenuItem
            icon={<Bell size={20} className="text-zinc-800" />}
            label="알림"
            onClick={() => handle(() => onNotificationClick?.())}
          />
        </nav>

        <div className="my-5 h-0 w-full outline outline-1 outline-offset-[-0.5px] outline-slate-500/25" />

        <MenuItem
          icon={<LogOut size={20} className="text-zinc-800" />}
          label="로그아웃"
          onClick={() => handle(onLogoutClick)}
        />
      </div>
    </>
  );
};

export default AccountMenu;
