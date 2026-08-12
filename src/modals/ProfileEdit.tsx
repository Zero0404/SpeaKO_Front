// ProfileEdit.tsx
import { useState } from "react";
import ModalShell from "./ModalShell";
import TextInput from "../components/TextInput";
import { patchNameApi, ApiError } from "../apis/apiclient";

interface ProfileEditProps {
  onClose: () => void;
  currentName?: string;
  onSave?: (name: string) => void;
}

const ProfileEdit = ({ onClose, currentName = "", onSave }: ProfileEditProps) => {
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmed = name.trim();
  const isLengthValid = trimmed.length >= 2 && trimmed.length <= 15;
  const canSubmit = isLengthValid && !isSubmitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await patchNameApi(trimmed);
      onSave?.(trimmed);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "닉네임 변경에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="개인정보 수정" description="서비스에서 사용할 프로필 이름을 설정하세요.">
      <div className="flex flex-col gap-6">
        <TextInput
          label="이름(닉네임)"
          value={name}
          onChange={setName}
          placeholder="새 이름을 입력하세요 (2~15자)"
        />

        {name.length > 0 && !isLengthValid && (
          <p className="-mt-4 text-sm text-rose-500">닉네임은 2자 이상 15자 이하로 입력해주세요.</p>
        )}
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

export default ProfileEdit;