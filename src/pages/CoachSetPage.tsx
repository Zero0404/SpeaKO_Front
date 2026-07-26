import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 공통 컴포넌트 불러오기
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput';

// 에셋 불러오기
import bgSvg from '../assets/select-page-background.svg';

// 페이지 불러오기
export const CoachSetPage: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [file, setFile] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState('');

  // 필수 조건: 파일 업로드 또는 대본 텍스트 입력 중 하나만 있으면 됨
  const isFormValid = Boolean(file) || scriptText.trim() !== '';

  // [발음 코칭 받기] 버튼 클릭 시 → 로딩 페이지로 이동
  const handleStartCoach = () => {
    if (!isFormValid) {
      return;
    }
    navigate('/coach-loading');
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-cover bg-center bg-no-repeat font-sans overflow-x-hidden"
      style={{
        backgroundImage: `url(${bgSvg})`,
        backgroundColor: '#F3F4F6',
      }}
    >
      <div className="flex flex-col items-center xl:items-start max-w-[1520px] w-full">

        {/* 상단 스텝 배너 */}
        <div
          style={{
            maxWidth: '686px',
            height: '38px',
            opacity: 1,
          }}
          className="w-full flex items-center justify-between gap-4 md:gap-[45px] mb-6 md:mb-8 pl-1 select-none overflow-x-auto"
        >
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              style={{ backgroundImage: 'var(--gradient-brand-active)' }}
              className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm"
            >
              1
            </div>
            <span className="font-bold text-[var(--color-text-heading)] text-sm md:text-base whitespace-nowrap">
              코칭 대본 업로드
            </span>
          </div>

          <span className="text-gray-400 font-light text-base shrink-0">≫</span>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full border-2 border-gray-400 text-gray-500 font-medium flex items-center justify-center text-sm">
              2
            </div>
            <span className="font-medium text-gray-500 text-sm md:text-base whitespace-nowrap">
              실시간 발음 코칭
            </span>
          </div>

          <span className="text-gray-400 font-light text-base shrink-0">≫</span>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full border-2 border-gray-400 text-gray-500 font-medium flex items-center justify-center text-sm">
              3
            </div>
            <span className="font-medium text-gray-500 text-sm md:text-base whitespace-nowrap">
              코칭 리포트
            </span>
          </div>
        </div>

        {/* 메인 컨테이너 */}
        <div className="flex flex-col items-end gap-6 w-full">
          <main className="w-full max-w-[1520px] bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10 flex flex-col justify-between box-border min-h-[670px] xl:h-[670px]">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-heading)] mb-1">
                발음 코칭 대본 설정
              </h1>
              <p className="text-xs md:text-sm text-[var(--color-text-body)]">
                연습할 대본을 넣고 스피치 가이드라인을 세팅하세요.
              </p>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-center gap-6 w-full h-full">

              {/* 좌측: FileUpload */}
              <div className="w-full xl:w-[530px] flex justify-center">
                <FileUpload
                  type="docx"
                  file={file}
                  onFileSelect={(selectedFile: File) => setFile(selectedFile)}
                />
              </div>

              {/* 우측: 대본 입력창 */}
              <style>{`
                .script-input-wrapper > div {
                  border: none !important;
                  box-shadow: none !important;
                  outline: none !important;
                }
                .script-input-wrapper textarea,
                .script-input-wrapper input {
                  width: 100% !important;
                  height: 100% !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: transparent !important;
                  outline: none !important;
                  resize: none !important;
                  color: var(--color-text-heading) !important;
                  font-size: 0.875rem !important;
                  line-height: 1.625 !important;
                }
                .script-input-wrapper ::placeholder {
                  color: #9CA3AF !important;
                }
              `}</style>
              <div
                style={{
                  width: '882px',
                  height: '472px',
                  borderRadius: '12px',
                  border: '1px solid rgba(128, 136, 146, 1)',
                  padding: '25px',
                  gap: '10px',
                  opacity: 1,
                }}
                className="box-border bg-white flex flex-col focus-within:border-[#7A5CFF] transition-colors script-input-wrapper"
              >
                <TextInput
                  label=""
                  value={scriptText}
                  onChange={setScriptText}
                  placeholder="발표 연습을 진행할 대본 전체를 입력하거나 붙여넣기 해주세요."
                />
              </div>

            </div>
          </main>

          {/* 하단 오른쪽 [발음 코칭 받기] 버튼 */}
          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={handleStartCoach}
              style={{
                width: '250px',
                height: '60px',
                borderRadius: '16px',
                paddingTop: '16px',
                paddingRight: '20px',
                paddingBottom: '16px',
                paddingLeft: '20px',
                opacity: 1,
                background: isFormValid ? 'var(--gradient-brand-active)' : 'var(--color-inactive-bg)',
                color: isFormValid ? 'var(--color-white)' : '#9CA3AF',
              }}
              className={`flex items-center justify-between font-semibold text-base shadow-sm border border-gray-100 transition-all duration-300 box-border ${
                isFormValid ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed pointer-events-none'
              }`}
            >
              <span className="text-base font-semibold">발음 코칭 받기</span>
              <span className="text-xl font-light">&gt;</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoachSetPage;