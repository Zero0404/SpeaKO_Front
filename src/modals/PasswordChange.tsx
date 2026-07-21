import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";

interface PasswordChangeProps {
  onClose: () => void;
  /** TODO: 실제 API 연동 시 여기서 비밀번호 변경 요청 호출 */
  onSave?: (currentPassword: string, newPassword: string) => void;
}

const PasswordChange = ({ onClose, onSave }: PasswordChangeProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isMismatched = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSave = () => {
    if (!isValid) return;
    onSave?.(currentPassword, newPassword);
    onClose();
  };

  return (
    <ModalShell
      onClose={onClose}
      title="비밀번호 변경"
      description="안전한 계정 이용을 위해 비밀번호를 주기적으로 변경해주세요."
    >
      <div className="flex flex-col gap-5">
        <TextInput
          label="현재 비밀번호"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="기존 비밀번호를 입력하세요"
        />
        <TextInput
          label="새 비밀번호(8자 이상)"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="새 비밀번호를 입력해주세요"
        />
        <TextInput
          label="새 비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="새 비밀번호를 다시 입력하세요"
        />
        {isMismatched && (
          <p className="-mt-3 text-sm text-rose-500">비밀번호가 일치하지 않습니다.</p>
        )}

        <div className="mt-1 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default PasswordChange;
