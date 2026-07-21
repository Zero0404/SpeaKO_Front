import { useState } from "react";

import ModalShell from "./ModalShell";

interface DeleteAccountProps {
  onClose: () => void;
  /** TODO: 실제 API 연동 시 여기서 탈퇴 처리 + 로그인 페이지 이동 */
  onConfirm?: () => void;
}

const CONFIRM_TEXT = "회원 탈퇴";

const DeleteAccount = ({ onClose, onConfirm }: DeleteAccountProps) => {
  const [typed, setTyped] = useState("");
  const canConfirm = typed === CONFIRM_TEXT;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm?.();
    onClose();
  };

  return (
    <ModalShell
      onClose={onClose}
      tone="danger"
      title="회원 탈퇴"
      description="탈퇴 시 모든 대본과 코칭 기록이 삭제되며 복구할 수 없습니다."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            계속하려면 아래에 "{CONFIRM_TEXT}"를 입력하세요
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_TEXT}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-rose-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default DeleteAccount;
