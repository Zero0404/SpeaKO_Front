import React from 'react';

interface HoverButtonProps {
  label: string;
  isActive?: boolean;
  isParentHovered?: boolean; // 카드 호버 여부
  onClick?: () => void;
  className?: string;
}

const HoverButton: React.FC<HoverButtonProps> = ({ 
  label, 
  isActive = false, 
  isParentHovered = false,
  onClick, 
  className = "w-72" 
}) => {
  // 활성화 조건: 외부에서 강제하거나, 카드가 호버되거나, 버튼 자체를 호버할 때
  const active = isActive || isParentHovered;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`${className} px-5 py-4 rounded-2xl flex justify-between items-center transition-all duration-300 cursor-pointer ${
        active ? "bg-gradient-to-br from-indigo-300 to-indigo-500" : "bg-white/80"
      }`}
    >
      <span className={`text-center text-xl font-semibold font-['Pretendard'] leading-5 transition-colors duration-300 ${
        active ? "text-white" : "text-zinc-800"
      }`}>
        {label}
      </span>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0" aria-hidden="true">
        <path
          d="M10.5 7L17.5 14L10.5 21"
          className={`transition-colors duration-300 ${active ? "stroke-white" : "stroke-zinc-800"}`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default HoverButton;