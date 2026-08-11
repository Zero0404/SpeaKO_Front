import { Link } from "react-router-dom";

interface LinkButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const LinkButton = ({ to, children, className = "" }: LinkButtonProps) => {
  return (
    <Link
      to={to}
      className={`font-semibold text-gray-800 transition hover:text-[#7A5CFF] ${className}`}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
