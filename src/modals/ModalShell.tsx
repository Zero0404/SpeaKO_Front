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
  /** 기본 px-6 py-8 / sm:px-10 sm:py-10 보다 다른 여백이 필요할 때 (예: 설정 모달의 p-6) */
  paddingClassName?: string;
}

const ModalShell = ({
  onClose,
  title,
  description,
  children,
  tone = "default",
  maxWidthClassName = "max-w-[440px]",
  paddingClassName = "px-6 py-8 sm:px-10 sm:py-10",
}: ModalShellProps) => {
  const hasHeader = Boolean(title || description);

  return (
    // overflow-y-auto + min-h-full 래퍼: 모바일 등 뷰포트가 낮을 때도
    // 모달이 화면 위로 잘리지 않고 배경 전체가 스크롤되도록 함
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-6 sm:py-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative flex w-full ${maxWidthClassName} max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_10px_40px_0px_rgba(91,108,251,0.15)] sm:rounded-[20px]`}
        >
          {/* 닫기 버튼은 카드 바깥쪽(스크롤 영역 밖)에 고정 — 내용이 길어서
              스크롤되어도 항상 같은 자리에서 눌려야 하므로 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 z-10 text-slate-400 transition hover:text-zinc-800 sm:right-6 sm:top-6"
          >
            <X size={20} />
          </button>

          {/* 실제 스크롤은 이 안쪽 컨테이너가 담당 */}
          <div className={`overflow-y-auto ${paddingClassName}`}>
            {hasHeader && (
              <div className="flex flex-col gap-2 pr-8 sm:pr-6">
                {title && (
                  <h2
                    className={`whitespace-pre-line text-lg font-bold leading-6 font-['Pretendard'] sm:text-xl ${
                      tone === "danger" ? "text-rose-500" : "text-zinc-800"
                    }`}
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm font-medium leading-5 text-slate-500 font-['Pretendard']">
                    {description}
                  </p>
                )}
              </div>
            )}

            <div className={hasHeader ? "mt-6" : ""}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
