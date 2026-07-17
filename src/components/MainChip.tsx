import React from 'react';

interface MainChipProps {
  text: string;
  scale?: number; 
  className?: string;
}

const MainChip: React.FC<MainChipProps> = ({ text, scale = 1, className = "" }) => {
  return (
    <div 
      className={`px-4 py-2.5 bg-gradient-to-br from-white/25 to-indigo-300/25 rounded-[100px] outline outline-[0.80px] outline-offset-[-0.80px] outline-indigo-500/25 inline-flex items-center gap-2 ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <span className="text-center text-indigo-500 text-lg font-semibold font-['Pretendard'] leading-4">
        {text}
      </span>
    </div>
  );
};

export default MainChip;