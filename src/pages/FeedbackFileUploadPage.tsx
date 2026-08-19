import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import bgSvg from '../assets/select-page-background.png';
import FileUpload from '../components/FileUpload';
import { useAuthStore } from '../store/authStore';

/**
 * ⚠️ 이 페이지는 단독으로 쓰이지 않습니다. "파일로 평가받기"는 CoachViewPage에 이미
 * 로드되어 있는 대본을 기준으로 업로드한 음성을 비교 평가하는 기능이라, 항상
 * CoachViewPage에서 presentationId를 들고 이동해와야 합니다. (실시간 평가받기와
 * 마찬가지로, "대본 없이 음성만으로" 평가받는 흐름은 이 서비스에 없습니다.)
 *
 * ⚠️ scriptId → presentationId로 필드명이 바뀌었습니다. POST /api/evaluations/record의
 * 실제 스펙에는 scriptId라는 필드가 없고, "이미 등록된 발표 자료"를 가리킬 땐
 * presentationId를 보내야 합니다.
 */
interface FeedbackFileUploadState {
  presentationId?: number;
  /**
   * CoachViewPage가 들고 있던 실제 대본(하이라이팅 포함) 원본. 이 페이지는 이 값을 쓰지
   * 않고, /feedback-loading을 거쳐 최종적으로 FeedbackPage("최종 평가 결과")의 "원본
   * 텍스트" 박스가 CoachViewPage와 동일한 하이라이팅을 그리는 데 쓴다. 그래서 이 페이지는
   * 타입을 알 필요 없이 unknown으로 받아뒀다가 손대지 않고 그대로 넘겨준다.
   */
  presentation?: unknown;
}

export const FeedbackFileUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestState = location.state as FeedbackFileUploadState | null;

  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const hasScript = Boolean(requestState?.presentationId);

  // 파일 업로드 여부 확인 (+ CoachViewPage에서 scriptId를 들고 왔는지도 같이 확인)
  const isFormValid = Boolean(file) && hasScript;

  // [평가 시작하기] 버튼 클릭 시 -> 실제 평가 요청은 여기서 하지 않고, 필요한 값만 들고
  // /feedback-loading으로 넘어간다. recordEvaluation() 호출 자체는 그 페이지가 진행하면서
  // 실제 로딩 상태(성공/실패)를 화면에 그대로 보여준다.
  //
  // ⚠️ 이전에는 이 버튼을 누르는 순간 여기서 recordEvaluation()을 직접 호출하고 끝날 때까지
  // 기다렸다가, 결과를 다 받은 뒤에야 /feedback-loading으로 이동했습니다. 그러다 보니
  // /feedback-loading 화면은 이미 끝난 요청을 놓고 정해진 시간만큼 타이머만 돌리는
  // "가짜 로딩"이었고, 업로드 페이지에서만 실제 대기 시간이 흘렀습니다.
  const handleStartFeedback = () => {
    setErrorMessage('');

    if (!file) {
      setErrorMessage('음성 파일을 업로드해주세요.');
      return;
    }

    if (!requestState?.presentationId) {
      setErrorMessage(
        '평가할 대본 정보가 없어요. 코칭 화면(CoachView)에서 "파일로 평가받기"로 다시 들어와주세요.',
      );
      return;
    }

    // 로그인한 사용자의 실제 userId를 authStore에서 가져옵니다.
    const userId = useAuthStore.getState().user?.userId;
    if (!userId) {
      setErrorMessage('로그인이 필요합니다. 다시 로그인한 뒤 시도해주세요.');
      return;
    }

    // presentationId는 CoachViewPage가 지금 화면에 띄워놓은 실제 발표 자료의 ID다. 그래야
    // recordEvaluation이 "이 음성 파일 vs 그 대본"으로 정확히 비교 평가할 수 있다.
    // presentation은 그대로 다음 페이지(FeedbackLoading)로 전달만 한다 — 결국
    // FeedbackPage의 "원본 텍스트" 박스가 하이라이팅을 그리는 데 쓴다.
    // ⚠️ entry: 'file'도 같이 실어 보낸다. FeedbackPage의 "다시 테스트" 버튼이 이 값을 보고
    // "파일로 평가받기"로 들어온 흐름인지, "실시간 평가받기"로 들어온 흐름인지 구분해서
    // 각각 다른 화면(파일 재업로드 화면 / CoachViewPage)으로 돌아가야 하기 때문이다.
    navigate('/feedback-loading', {
      state: {
        userId,
        presentationId: requestState.presentationId,
        file,
        presentation: requestState.presentation,
        entry: 'file',
      },
    });
  };

  return (
    <div
      style={{ backgroundImage: `url(${bgSvg})` }}
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 font-sans box-border"
    >
      <div className="w-full max-w-[1240px] flex flex-col items-center">

        {/* 메인 평가 카드 패널 (반응형 패딩 및 높이 설정) */}
        <div
          className="bg-white shadow-lg flex flex-col justify-start box-border w-full min-h-[450px] sm:min-h-[520px] md:min-h-[600px] p-6 sm:p-8 md:p-[48px]"
          style={{
            borderRadius: '24px',
          }}
        >
          {/* 타이틀 영역 (화면 폭에 맞춘 반응형 폰트 크기) */}
          <h2
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text-heading, #27272a)' }}
          >
            발음 평가
          </h2>
          <p
            className="text-xs sm:text-sm mb-6 sm:mb-8"
            style={{ color: 'var(--color-text-body, #64748b)' }}
          >
            음성 파일을 업로드해주세요.
          </p>

          {!hasScript && (
            <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-500 sm:text-sm">
              평가할 대본 정보가 없어요. 코칭 화면(CoachView)의 "파일로 평가받기" 버튼으로
              들어와야 대본과 비교해서 평가할 수 있어요.
            </p>
          )}

          {/* 중앙 음성 파일 업로드 영역 및 TextInput 컴포넌트 활용 */}
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-6 overflow-hidden">
            <FileUpload
              type="mp3"
              file={file}
              onFileSelect={(selectedFile) => {
                setErrorMessage('');
                setFile(selectedFile);
              }}
              onError={(message) => setErrorMessage(message)}
            />
          </div>
        </div>

        {/* 하단 평가 시작하기 버튼 (모바일 풀사이즈 / 데스크톱 고정너비 대응) */}
        <div className="w-full flex flex-col items-center sm:items-end mt-6">
          {errorMessage && (
            <p className="text-xs font-bold text-red-500 mb-2 text-center sm:text-right">{errorMessage}</p>
          )}
          <button
            type="button"
            onClick={handleStartFeedback}
            disabled={!isFormValid}
            style={{
              width: '250px',
              height: '60px',
              borderRadius: '16px',
              paddingTop: '16px',
              paddingRight: '20px',
              paddingBottom: '16px',
              paddingLeft: '20px',
              opacity: 1,
              background: isFormValid ? 'var(--gradient-brand-active)' : 'var(--color-inactive-bg, #f3f4f6)',
              color: isFormValid ? 'var(--color-white, #ffffff)' : '#9CA3AF',
            }}
            className={`group flex items-center justify-between shadow-md transition-all duration-300 box-border border border-slate-200 ${
              isFormValid
                ? 'cursor-pointer hover:shadow-xl hover:border-transparent'
                : 'cursor-not-allowed pointer-events-none'
            }`}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.currentTarget.style.background = 'var(--gradient-brand-active)';
                e.currentTarget.style.color = 'var(--color-white)';
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                e.currentTarget.style.background = 'var(--gradient-brand-active)';
                e.currentTarget.style.color = 'var(--color-white)';
              }
            }}
          >
            <span className="text-sm sm:text-base font-bold transition-colors">
              평가 시작하기
            </span>
            <svg
              className={`w-5 h-5 transition-colors shrink-0 ${
                isFormValid ? 'text-white group-hover:text-white' : 'text-slate-400'
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeedbackFileUploadPage;
