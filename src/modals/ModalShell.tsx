import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalShellProps {
  onClose: () => void;
  /** 사이드바가 있는 SetModal처럼 자체 헤딩을 children 안에서 그리는 경우 생략 가능 */
  title?: string;
  description?: string;
  children: ReactNode;
  /** 회원 탈퇴처럼 위험한 액션일 때 살짝 다른 톤을 주고 싶을 때 */
  tone?: "default" | "danger";
  /** 기본 440px보다 넓은 모달(예: 사이드바가 있는 설정 모달)이 필요할 때 */
  maxWidthClassName?: string;
  /** 기본 px-10 py-10보다 다른 여백이 필요할 때 (예: 설정 모달의 p-6) */
  paddingClassName?: string;
}

const ModalShell = ({
  onClose,
  title,
  description,
  children,
  tone = "default",
  maxWidthClassName = "max-w-[440px]",
  paddingClassName = "px-10 py-10",
}: ModalShellProps) => {
  const hasHeader = Boolean(title || description);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClassName} rounded-[20px] bg-white ${paddingClassName} shadow-[0px_10px_40px_0px_rgba(91,108,251,0.15)]`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-6 top-6 text-slate-400 transition hover:text-zinc-800"
        >
          <X size={20} />
        </button>

        {hasHeader && (
          <div className="flex flex-col gap-2 pr-6">
            {title && (
              <h2
                className={`whitespace-pre-line text-xl font-bold leading-6 text-zinc-800 font-['Pretendard'] ${
                  tone === "danger" ? "text-rose-500" : "text-zinc-800"
                }`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-m font-medium leading-5 text-slate-500 font-['Pretendard']">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={hasHeader ? "mt-6" : ""}>{children}</div>
      </div>
    </div>
  );
};

export default ModalShell;
