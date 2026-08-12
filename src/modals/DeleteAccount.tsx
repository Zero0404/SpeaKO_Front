import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import ConfirmShell from "./ConfirmShell";
import TextInput from "../components/TextInput";
import { withdrawApi, ApiError } from "../apis/apiclient";

interface DeleteAccountProps {
  onClose: () => void;
  onConfirm?: () => void;
}

const DeleteAccount = ({ onClose, onConfirm }: DeleteAccountProps) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canConfirm = password.length > 0 && !isSubmitting;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await withdrawApi(password);
      onConfirm?.();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "회원 탈퇴에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmShell
      icon={<TriangleAlert size={40} className="text-rose-500" strokeWidth={2} />}
      title="정말로 탈퇴하시겠습니까?"
      description="탈퇴 시 기존의 모든 대본 데이터 및 AI 발표 분석 피드백 내역이 즉시 삭제되며, 이 작업은 복구할 수 없습니다."
      confirmLabel={isSubmitting ? "탈퇴 처리 중..." : "탈퇴하기"}
      onCancel={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!canConfirm}
    >
      <div className="flex flex-col gap-2">
        <TextInput
          label="비밀번호 확인"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="현재 비밀번호를 입력해주세요."
        />
        {errorMessage && <p className="text-sm text-rose-500">{errorMessage}</p>}
      </div>
    </ConfirmShell>
  );
};

export default DeleteAccount;