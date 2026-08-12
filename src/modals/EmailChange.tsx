// EmailChange.tsx
import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";
import { patchEmailApi, ApiError } from "../apis/apiclient";

interface EmailChangeProps {
  onClose: () => void;
  currentEmail?: string;
  onSave?: (email: string) => void;
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const EmailChange = ({ onClose, onSave }: EmailChangeProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedEmail = email.trim();
  const isEmailValid = isValidEmail(trimmedEmail);
  const isPasswordValid = password.length > 0;
  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await patchEmailApi(trimmedEmail, password);
      onSave?.(trimmedEmail);
      onClose();
    } catch (err) {
      // 비밀번호 불일치 등은 서버 메시지를 그대로 노출
      setErrorMessage(err instanceof ApiError ? err.message : "이메일 변경에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="이메일 주소 변경" description="로그인에 사용할 새로운 이메일 주소를 입력하세요.">
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
        {errorMessage && <p className="-mt-4 text-sm text-rose-500">{errorMessage}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit}
            style={canSubmit ? { backgroundImage: "var(--gradient-brand-active)" } : undefined}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
              canSubmit ? "text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "저장 중..." : "변경 사항 저장"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default EmailChange;