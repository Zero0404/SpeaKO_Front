import { useNavigate } from "react-router-dom";

const CoachSetPage = () => {
  const navigate = useNavigate();

  const handleStartCoaching = () => {
    // 실제로는 대본 업로드/분석 완료 후 호출
    navigate("/coach-view");
  };

  return (
    <button
      type="button"
      onClick={handleStartCoaching}
      className="h-12 px-6 rounded-xl hover-effect-btn is-active text-lg font-semibold font-['Pretendard']"
    >
      발음 코칭 받기
    </button>
  );
};

export default CoachSetPage;
