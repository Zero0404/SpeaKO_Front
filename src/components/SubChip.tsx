import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SubChipProps {
  text: string;
  icon?: LucideIcon;
  scale?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    wrapper: 'px-2.5 py-1.5 gap-1',
    text: 'text-sm',
    icon: 12,
  },
  md: {
    wrapper: 'px-4 py-2 gap-1.5',
    text: 'text-lg',
    icon: 16,
  },
};

const SubChip: React.FC<SubChipProps> = ({ text, icon: Icon, scale = 1, size = 'md', className = "" }) => {
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={`${styles.wrapper} bg-[#9FA0FD]/10 backdrop-blur-[10px] rounded-lg border border-white/10 inline-flex items-center justify-center ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      {Icon && <Icon size={styles.icon} className="shrink-0 text-[#5B6CFB]" />}
      <span className={`text-center text-[#5B6CFB] ${styles.text} font-semibold font-['Pretendard'] leading-normal whitespace-nowrap`}>
        {text}
      </span>
    </div>
  );
};

export default SubChip;