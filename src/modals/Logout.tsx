import { useState } from "react";
import { CircleAlert } from "lucide-react";
import ConfirmShell from "./ConfirmShell";
import { logoutApi, ApiError } from "../apis/apiclient";
import { useAuthStore } from "../store/authStore";

interface LogoutProps {
  onClose: () => void;
  /** 로그아웃 성공 후 부모에서 로그인 페이지로 이동시켜주세요 */
  onConfirm?: () => void;
}

const Logout = ({ onClose, onConfirm }: LogoutProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await logoutApi();
      useAuthStore.getState().logout();
      onConfirm?.();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "로그아웃에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmShell
      icon={<CircleAlert size={40} className="text-rose-500" strokeWidth={2} />}
      title="로그아웃 하시겠습니까?"
      description={errorMessage || "로그아웃하시면 서비스 이용을 위해 다시 로그인해야 합니다"}
      confirmLabel={isSubmitting ? "로그아웃 중..." : "로그아웃"}
      onCancel={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={isSubmitting}
    />
  );
};

export default Logout;