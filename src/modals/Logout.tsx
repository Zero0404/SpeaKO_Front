import { useState } from "react";
import { CircleAlert } from "lucide-react";
import ConfirmShell from "./ConfirmShell";
import { logoutApi } from "../apis/apiclient";
import { useAuthStore } from "../store/authStore";

interface LogoutProps {
  onClose: () => void;
  /** 로그아웃 성공 후 부모에서 로그인 페이지로 이동시켜주세요 */
  onConfirm?: () => void;
}

const Logout = ({ onClose, onConfirm }: LogoutProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await logoutApi();
    } catch (err) {
      console.warn(
        "[Logout] 서버 로그아웃 요청이 실패했지만, 로컬 로그인 상태는 그대로 정리합니다:",
        err,
      );
    } finally {
      useAuthStore.getState().logout();
      onConfirm?.();
      onClose();
    }
  };

  return (
    <ConfirmShell
      icon={<CircleAlert size={40} className="text-rose-500" strokeWidth={2} />}
      title="로그아웃 하시겠습니까?"
      description="로그아웃하시면 서비스 이용을 위해 다시 로그인해야 합니다"
      confirmLabel={isSubmitting ? "로그아웃 중..." : "로그아웃"}
      onCancel={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={isSubmitting}
    />
  );
};

export default Logout;
