import { useState } from "react";
import SetModal from "../modals/SetModal";

function AiSetPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>모달 테스트</button>

      <SetModal
        isOpen={isOpen}
        time="5분"
        tone="편안한 말투"
        onRecheck={() => setIsOpen(false)}
        onConfirm={() => {
          alert("확인 완료");
          setIsOpen(false);
        }}
      />
    </div>
  );
}

export default AiSetPage;