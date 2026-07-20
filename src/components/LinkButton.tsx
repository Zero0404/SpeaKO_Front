import { Link } from "react-router-dom";


interface LinkButtonProps {
  // 클릭했을 때 이동할 경로
  to: string;

  // 버튼 안에 들어갈 내용(텍스트, 아이콘 등)
  children: React.ReactNode;
}


const LinkButton = ({ to, children }: LinkButtonProps) => {
  return (
    // 페이지를 새로고침하지 않고 지정한 경로로 이동
    <Link
      to={to}
      className="text-lg font-semibold text-gray-800 transition hover:text-[#7A5CFF]"
    >
      {/* Link 태그 안에 전달받은 내용을 출력 */}
      {children}
    </Link>
  );
};

export default LinkButton;