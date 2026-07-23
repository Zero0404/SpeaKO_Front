import React, { useRef } from 'react';
import featureScriptIllustration from '../assets/feature-script-illustration.svg';

export type FileUploadType = 'ppt' | 'docx' | 'mp3';

interface FileUploadConfig {
  accept: string;
  subText: string;
  width: string;
  height: string;
}

const TYPE_CONFIG: Record<FileUploadType, FileUploadConfig> = {
  ppt: {
    accept: '.ppt, .pptx, .pdf',
    subText: 'PPT, PPTX, PDF 지원 · 최대 20MB',
    width: '530px',
    height: '472px',
  },
  docx: {
    accept: '.docx, .txt, .pdf',
    subText: 'DOCX, TXT, PDF 지원 · 최대 20MB',
    width: '530px',
    height: '472px',
  },
  mp3: {
    accept: '.mp3, .wav, .m4a',
    subText: '음성 파일 선택 (MP3 / WAV / M4A) · 최대 20MB',
    width: '1440px',
    height: '472px',
  },
};

interface FileUploadProps {
  type: FileUploadType;
  file?: File | null;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type = 'ppt',
  file = null,
  onFileSelect,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = TYPE_CONFIG[type];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect?.(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect?.(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#C7D2FE] bg-[#F5F7FF] transition-all duration-300 hover:border-indigo-400 max-w-full ${className}`}
      style={{
        width: config.width,
        height: config.height,
      }}
    >
      {/* 3D 로고 일러스트 */}
      <div className="mb-4 flex items-center justify-center">
        <img
          src={featureScriptIllustration}
          alt="File Upload Icon"
          className="h-28 w-28 object-contain drop-shadow-sm select-none"
        />
      </div>

      {/* 안내 문구 */}
      <h3
        className="text-[17px] font-bold tracking-tight mb-1.5"
        style={{ color: 'var(--color-text-heading)' }}
      >
        파일을 여기에 끌어다 놓거나 클릭하세요
      </h3>

      <p
        className="text-[13px] font-normal mb-6"
        style={{ color: 'var(--color-text-body)' }}
      >
        {file ? file.name : config.subText}
      </p>

      {/* 숨겨진 파일 Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 💡 요청 스펙: 파일 선택 상자 (width: 220, height: 48, radius: 100px, padding: 12px 40px 12px 28px, gap: 8px) */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="hover-effect-btn is-active flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        style={{
          width: '220px',
          height: '48px',
          borderRadius: '100px',
          paddingTop: '12px',
          paddingRight: '40px',
          paddingBottom: '12px',
          paddingLeft: '28px',
          gap: '8px',
        }}
      >
        <svg
          className="w-4 h-4 text-white shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span className="text-sm font-semibold">{file ? '파일 변경' : '파일 선택'}</span>
      </button>
    </div>
  );
};

export default FileUpload;