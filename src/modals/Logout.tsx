import { CircleAlert } from "lucide-react";
import ConfirmShell from "./ConfirmShell";

interface LogoutProps {
  onClose: () => void;
  /** TODO: 실제 API 연동 시 여기서 로그아웃 처리 + 로그인 페이지 이동 */
  onConfirm?: () => void;
}

const Logout = ({ onClose, onConfirm }: LogoutProps) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <ConfirmShell
      icon={<CircleAlert size={40} className="text-rose-500" strokeWidth={2} />}
      title="로그아웃 하시겠습니까?"
      description="로그아웃하시면 서비스 이용을 위해 다시 로그인해야 합니다"
      confirmLabel="로그아웃"
      onCancel={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default Logout;
