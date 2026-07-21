import ModalShell from "./ModalShell";

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
    <ModalShell onClose={onClose} title="로그아웃" description="정말 로그아웃 하시겠습니까?">
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
          onClick={handleConfirm}
          className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
        >
          로그아웃
        </button>
      </div>
    </ModalShell>
  );
};

export default Logout;
