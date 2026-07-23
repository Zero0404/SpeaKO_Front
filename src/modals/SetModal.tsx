import type { FC } from "react";
import { Info } from "lucide-react";
import ConfirmShell from "./ConfirmShell";

interface SetModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 사용자가 선택한 발표 시간 (예: "5분") */
  time: string;
  /** 사용자가 선택한 말투 스타일 (예: "편안한 말투") */
  tone: string;
  /** "다시 확인하기" 클릭 시 (모달 닫고 설정 화면으로 복귀) */
  onRecheck: () => void;
  /** "네, 맞습니다" 클릭 시 (다음 단계 진행) */
  onConfirm: () => void;
}

const SetModal: FC<SetModalProps> = ({
  isOpen,
  time,
  tone,
  onRecheck,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <ConfirmShell
      icon={<Info size={40} className="text-zinc-800" strokeWidth={2} />}
      title={"발표 주제, 발표 시간, 말투 스타일\n모두 알맞게 설정하셨습니까?"}
      description={`선택 값: ${time} / ${tone}`}
      cancelLabel="다시 확인하기"
      confirmLabel="네, 맞습니다"
      confirmVariant="primary"
      onCancel={onRecheck}
      onConfirm={onConfirm}
    />
  );
};

export default SetModal;
