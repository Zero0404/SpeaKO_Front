import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";

interface EmailChangeProps {
  onClose: () => void;
  currentEmail?: string;
  onSave?: (email: string, password: string) => void;
}

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const EmailChange = ({
  onClose,
  currentEmail: _currentEmail, 
  //  currentEmail = "",
  onSave,
}: EmailChangeProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isEmailValid = isValidEmail(email);
  const isPasswordValid = password.trim().length > 0;
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
          <p className="-mt-4 text-sm text-rose-500">
            이메일 형식을 확인해주세요.
          </p>
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
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
              canSubmit
                ? "bg-[var(--color-brand-primary)] text-white hover:bg-indigo-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default EmailChange;