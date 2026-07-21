import { Link } from "react-router-dom";

interface LinkButtonProps {
  to: string;
  children: React.ReactNode;
}

const LinkButton = ({ to, children }: LinkButtonProps) => {
  return (
    <Link
      to={to}
      className="text-lg font-semibold text-gray-800 transition hover:text-[#7A5CFF]"
    >
      {children}
    </Link>
  );
};

export default LinkButton;