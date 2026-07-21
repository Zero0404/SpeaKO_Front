import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";

interface EmailChangeProps {
  onClose: () => void;
  currentEmail?: string;
  /** TODO: 실제 API 연동 시 여기서 이메일 변경/인증 요청 호출 */
  onSave?: (email: string) => void;
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const EmailChange = ({ onClose, currentEmail = "", onSave }: EmailChangeProps) => {
  const [email, setEmail] = useState("");
  const valid = isValidEmail(email);

  const handleSave = () => {
    if (!valid) return;
    onSave?.(email.trim());
    onClose();
  };

  return (
    <ModalShell
      onClose={onClose}
      title="이메일 변경"
      description="로그인에 사용할 새 이메일을 입력하세요."
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          현재 이메일 &nbsp;
          <span className="font-semibold text-zinc-800">{currentEmail}</span>
        </div>

        <TextInput
          label="새 이메일"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="new.email@example.com"
        />
        {email.length > 0 && !valid && (
          <p className="-mt-4 text-sm text-rose-500">이메일 형식을 확인해주세요.</p>
        )}

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
            onClick={handleSave}
            disabled={!valid}
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            변경하기
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default EmailChange;
