import type { LucideIcon } from "lucide-react";

interface TaskChipProps {
  /** lucide-react 아이콘 컴포넌트 (예: FileText, Download, Share2 등) */
  icon: LucideIcon;
  /** 버튼에 표시할 라벨 (예: "대본 확인", "다운로드") */
  label: string;
  /** 클릭 시 수행할 동작 - 이 부분만 바꿔주면 같은 디자인으로 다른 역할 부여 가능 */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 디자인은 고정, 역할(아이콘/라벨/onClick)만 주입해서 재사용하는 액션 칩.
 * 모바일에서는 패딩/폰트가 살짝 줄어들고, sm 이상부터 원래 크기로 커진다.
 * 예) <TaskChip icon={FileText} label="대본 확인" onClick={openScriptModal} />
 *     <TaskChip icon={Download} label="다운로드" onClick={downloadReport} />
 */
const TaskChip = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  className = "",
}: TaskChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[color:var(--color-brand-primary)]/10 pl-3 pr-4 text-sm font-medium font-['Pretendard'] leading-4 text-[color:var(--color-brand-primary)] transition hover:bg-[color:var(--color-brand-primary)]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[color:var(--color-brand-primary)]/10 sm:h-12 sm:gap-2 sm:pl-4 sm:pr-5 sm:text-lg ${className}`}
    >
      <Icon size={18} className="shrink-0 sm:hidden" />
      <Icon size={22} className="hidden shrink-0 sm:block" />
      {label}
    </button>
  );
};

export default TaskChip;
