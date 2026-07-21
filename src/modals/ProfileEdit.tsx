import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";

interface ProfileEditProps {
  onClose: () => void;
  currentName?: string;
  /** TODO: 실제 API 연동 시 여기서 이름 변경 요청 호출 */
  onSave?: (name: string) => void;
}

const ProfileEdit = ({ onClose, currentName = "", onSave }: ProfileEditProps) => {
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave?.(name.trim());
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title="개인정보 수정" description="서비스에서 사용할 프로필 이름을 설정하세요.">
      <div className="flex flex-col gap-6">
        <TextInput
          label="이름(닉네임)"
          value={name}
          onChange={setName}
          placeholder="새 이름을 입력하세요"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-[var(--color-brand-primary)] py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            변경 사항 저장
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ProfileEdit;
