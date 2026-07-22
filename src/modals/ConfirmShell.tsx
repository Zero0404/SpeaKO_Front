import type { ReactNode } from "react";

interface ConfirmShellProps {
  icon: ReactNode;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  /** danger: 빨강 그라디언트(탈퇴/로그아웃 등 위험한 액션), primary: 인디고 그라디언트(일반 확인) */
  confirmVariant?: "danger" | "primary";
}

const CONFIRM_GRADIENTS: Record<NonNullable<ConfirmShellProps["confirmVariant"]>, string> = {
  danger: "bg-gradient-to-br from-red-300 to-rose-500",
  primary: "bg-gradient-to-br from-indigo-300 to-indigo-500",
};

const ConfirmShell = ({
  icon,
  title,
  description,
  cancelLabel = "취소하기",
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled,
  confirmVariant = "danger",
}: ConfirmShellProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-[20px] bg-white px-10 py-10 text-center shadow-[0px_10px_40px_0px_rgba(91,108,251,0.15)]"
      >
        <div className="mx-auto mb-5 flex items-center justify-center">{icon}</div>

        <h2 className="whitespace-pre-line text-xl font-bold leading-6 text-zinc-800 font-['Pretendard']">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-[280px] whitespace-pre-line text-sm font-medium leading-5 text-slate-500 font-['Pretendard']">
          {description}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-8 py-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-8 py-4 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 ${CONFIRM_GRADIENTS[confirmVariant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmShell;
