import { TriangleAlert } from "lucide-react";
import ConfirmShell from "./ConfirmShell";

interface DeleteAccountProps {
  onClose: () => void;
  /** TODO: 실제 API 연동 시 여기서 탈퇴 처리 + 로그인 페이지 이동 */
  onConfirm?: () => void;
}

const DeleteAccount = ({ onClose, onConfirm }: DeleteAccountProps) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <ConfirmShell
      icon={<TriangleAlert size={40} className="text-rose-500" strokeWidth={2} />}
      title="정말로 탈퇴하시겠습니까?"
      description="탈퇴 시 기존의 모든 대본 데이터 및 AI 발표 분석 피드백 내역이 즉시 삭제되며, 이 작업은 복구할 수 없습니다."
      confirmLabel="탈퇴하기"
      onCancel={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default DeleteAccount;
