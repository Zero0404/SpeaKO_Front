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
          placeholder="기존 비밀번호를 입력해주세요."
        />
        <TextInput
          label="새 비밀번호 (8자 이상)"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="새 비밀번호를 입력해주세요."
        />
        {/* NOTE: 참조 이미지엔 이 필드 라벨이 "이름(닉네임)"으로 돼있었는데,
            ProfileEdit 라벨을 복사하다 안 고친 실수로 보여서 "새 비밀번호 확인"으로 바로잡았어요. */}
        <TextInput
          label="새 비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="새 비밀번호를 한번 더 입력해주세요."
        />
        {isMismatched && (
          <p className="-mt-3 text-sm text-rose-500">비밀번호가 일치하지 않습니다.</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 rounded-xl bg-[var(--color-brand-primary)] py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default PasswordChange;
