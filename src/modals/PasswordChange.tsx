// PasswordChange.tsx
import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";
import { patchPasswordApi, ApiError } from "../apis/apiclient";

interface PasswordChangeProps {
  onClose: () => void;
  onSave?: () => void;
}

// 8~25자, 영문 대/소문자, 숫자, 특수문자 조합
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,25}$/;

const PasswordChange = ({ onClose, onSave }: PasswordChangeProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isRuleValid = PASSWORD_RULE.test(newPassword);
  const isMismatched = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValid =
    currentPassword.length > 0 && isRuleValid && newPassword === confirmPassword && !isSubmitting;

  const handleSave = async () => {
    if (!isValid) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await patchPasswordApi(currentPassword, newPassword, confirmPassword);
      onSave?.();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="비밀번호 변경" description="안전한 계정 이용을 위해 비밀번호를 주기적으로 변경해주세요.">
      <div className="flex flex-col gap-5">
        <TextInput
          label="현재 비밀번호"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="기존 비밀번호를 입력해주세요."
        />
        <TextInput
          label="새 비밀번호 (8~25자, 영문 대/소문자·숫자·특수문자 포함)"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="새 비밀번호를 입력해주세요."
        />
        {newPassword.length > 0 && !isRuleValid && (
          <p className="-mt-3 text-sm text-rose-500">
            8~25자이며 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.
          </p>
        )}

        <TextInput
          label="새 비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="새 비밀번호를 한번 더 입력해주세요."
        />
        {isMismatched && <p className="-mt-3 text-sm text-rose-500">비밀번호가 일치하지 않습니다.</p>}
        {errorMessage && <p className="-mt-3 text-sm text-rose-500">{errorMessage}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            style={isValid ? { backgroundImage: "var(--gradient-brand-active)" } : undefined}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
              isValid ? "text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "저장 중..." : "변경 사항 저장"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default PasswordChange;