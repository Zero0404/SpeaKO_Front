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
    <ModalShell onClose={onClose} title="이름 수정" description="프로필에 표시될 이름을 변경합니다.">
      <div className="flex flex-col gap-6">
        <TextInput
          label="이름"
          value={name}
          onChange={setName}
          placeholder="새 이름을 입력하세요"
        />

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
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ProfileEdit;
