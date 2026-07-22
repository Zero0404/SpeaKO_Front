import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";

interface EmailChangeProps {
  onClose: () => void;
  currentEmail?: string;
  /** TODO: 실제 API 연동 시 여기서 이메일 변경/인증 요청 호출 */
  onSave?: (email: string, password: string) => void; // 필요하다면 password도 전달 가능
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const EmailChange = ({ onClose, currentEmail = "", onSave }: EmailChangeProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 현재 비밀번호 상태

  const isEmailValid = isValidEmail(email);
  const isPasswordValid = password.trim().length > 0;

  // 두 조건이 모두 충족되어야 활성화
  const canSubmit = isEmailValid && isPasswordValid;

  const handleSave = () => {
    if (!canSubmit) return;
    onSave?.(email.trim(), password);
    onClose();
  };

  return (
    <ModalShell
      onClose={onClose}
      title="이메일 주소 변경"
      description="로그인에 사용할 새로운 이메일 주소를 입력하세요."
    >
      <div className="flex flex-col gap-6">
        <TextInput
          label="새 이메일 주소"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="새로운 이메일 주소를 입력해주세요."
        />

        {email.length > 0 && !isEmailValid && (
          <p className="-mt-4 text-sm text-rose-500">이메일 형식을 확인해주세요.</p>
        )}

        <TextInput
          label="현재 비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="현재 비밀번호를 입력해주세요."
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-[var(--color-brand-primary)] py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default EmailChange;
