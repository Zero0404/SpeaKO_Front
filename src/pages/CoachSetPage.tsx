import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 공통 컴포넌트 불러오기
import FileUpload from '../components/FileUpload';

// 에셋 불러오기
import bgSvg from '../assets/select-page-background.svg';
import bgGradient from '../assets/background_gradiant.png';

export const CoachSetPage: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [file, setFile] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState('');
  
  // 로딩 화면 전환 상태 (백엔드 연동용)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // [발음 코칭 받기] 버튼 클릭 시
  const handleStartCoach = () => {
    if (!file && !scriptText.trim()) {
      return;
    }

    // 로딩 화면으로 전환
    setIsSubmitting(true);
  };

  // 사용자가 직접 [다음 페이지로 이동] 버튼 클릭 시 이동
  const handleNavigateNext = () => {
    navigate('/coach-view');
  };

  // =========================================================
  // 1. [발음 코칭 받기] 클릭 시 표시되는 로딩 화면
  // =========================================================
  if (isSubmitting) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 bg-cover bg-center bg-no-repeat font-sans select-none overflow-hidden"
        style={{
          backgroundImage: `url(${bgGradient})`,
          backgroundColor: '#F8FAFC',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full px-4">
          
          {/* 회전 스피너 */}
          <div className="relative flex items-center justify-center mb-8 md:mb-10">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[5px] border-gray-200/80 border-t-transparent animate-spin"
              style={{
                borderTopColor: 'rgba(91, 108, 251, 1)',
                borderRightColor: 'rgba(91, 108, 251, 0.8)',
              }}
            />
          </div>

          {/* 안내 문구 */}
          <div className="space-y-3 mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-heading)] tracking-tight">
              발음 하이라이팅을 적용하고 있어요
            </h2>
            <p className="text-sm md:text-base font-medium text-[var(--color-text-body)]">
              생성된 대본에서 정확한 발음 가이드를 분석 중입니다.
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              잠시만 기다려 주세요. 파일의 용량에 따라 최대 4분까지 소요될 수 있습니다.
            </p>
          </div>

          {/* 4단계 프로세스 위젯 */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
                1
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">대본 로드</span>
            </div>

            <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-md">
                2
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">텍스트 분석</span>
            </div>

            <span className="text-[#6E8BFF] font-light text-lg sm:text-xl pb-6">≫</span>

            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 border-t-[#6E8BFF] border-r-[#6E8BFF] animate-spin flex items-center justify-center" />
              <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1">하이라이팅 중</span>
            </div>

            <span className="text-gray-300 font-light text-xl pb-6">≫</span>

            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-400 text-gray-500 font-medium flex items-center justify-center text-xs sm:text-sm">
                4
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-400 mt-1">완료</span>
            </div>
          </div>

          {/* 클릭 시 넘어가는 [다음 페이지로 이동] 버튼 */}
          <button
            type="button"
            onClick={handleNavigateNext}
            style={{
              width: '250px',
              height: '60px',
              borderRadius: '16px',
              paddingTop: '16px',
              paddingRight: '20px',
              paddingBottom: '16px',
              paddingLeft: '20px',
            }}
            className="hover-effect-btn flex items-center justify-between font-semibold text-base shadow-md border border-gray-100 transition-all duration-300 cursor-pointer active:scale-95 box-border bg-white"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-brand-active)';
              e.currentTarget.style.color = 'var(--color-white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = 'var(--color-text-heading)';
            }}
          >
            <span className="text-base font-semibold">다음 페이지로 이동</span>
            <span className="text-xl font-light">&gt;</span>
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // 2. 대본 설정 및 파일 업로드 화면 (평소 화면)
  // =========================================================
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6E8BFF] to-[#7A5CFF] text-white font-bold flex items-center justify-center text-sm shadow-sm">
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

              {/* 💡 [완벽 해결] 사진속 피그마 규격대로 완벽하게 구현된 대본 입력창 */}
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
                className="box-border bg-white flex flex-col focus-within:border-[#7A5CFF] transition-colors"
              >
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="발표 연습을 진행할 대본 전체를 입력하거나 붙여넣기 해주세요."
                  className="w-full h-full resize-none border-none outline-none text-sm text-[var(--color-text-heading)] placeholder:text-gray-400 bg-transparent leading-relaxed"
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
              }}
              className="hover-effect-btn flex items-center justify-between font-semibold text-base shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer active:scale-95 box-border"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-brand-active)';
                e.currentTarget.style.color = 'var(--color-white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-inactive-bg)';
                e.currentTarget.style.color = 'var(--color-text-heading)';
              }}
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