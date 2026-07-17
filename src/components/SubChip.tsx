import React from 'react';

interface SubChipProps {
  text: string;
  scale?: number; 
  className?: string;
}

const SubChip: React.FC<SubChipProps> = ({ text, scale = 1, className = "" }) => {
  return (
    <div 
      className={`px-4 py-2 bg-[#9FA0FD]/10 backdrop-blur-[10px] rounded-lg border border-white/10 inline-flex items-center justify-center ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <span className="text-center text-[#5B6CFB] text-lg font-semibold font-['Pretendard'] leading-normal whitespace-nowrap">
        {text}
      </span>
    </div>
  );
};

export default SubChip;