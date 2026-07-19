import type { LucideIcon } from "lucide-react";

interface TaskChipProps {
  icon: LucideIcon;
  label: string;
  /** 클릭 시 수행할 동작 - 이 부분만 바꿔주면 같은 디자인으로 다른 역할 부여 가능 */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 디자인은 고정, 역할(아이콘/라벨/onClick)만 주입해서 재사용하는 액션 칩.
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
      className={`flex h-12 items-center gap-2 rounded-xl bg-[color:var(--color-brand-primary)]/10 pl-4 pr-5 text-lg font-medium font-['Pretendard'] leading-4 text-[color:var(--color-brand-primary)] transition hover:bg-[color:var(--color-brand-primary)]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[color:var(--color-brand-primary)]/10 ${className}`}
    >
      <Icon size={22} />
      {label}
    </button>
  );
};

export default TaskChip;
