import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalShellProps {
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "danger";
}

const ModalShell = ({
  onClose,
  title,
  description,
  children,
  tone = "default",
}: ModalShellProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-[20px] bg-white p-8 shadow-[0px_10px_40px_0px_rgba(91,108,251,0.15)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-6 top-6 text-slate-400 transition hover:text-zinc-800"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-2 pr-6">
          <h2
            className={`text-2xl font-bold leading-6 font-['Pretendard'] ${
              tone === "danger" ? "text-rose-500" : "text-zinc-800"
            }`}
          >
            {title}
          </h2>
          {description && (
            <p className="text-lg font-medium leading-5 text-slate-500 font-['Pretendard']">
              {description}
            </p>
          )}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalShell;
