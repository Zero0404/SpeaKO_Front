import type { FC } from "react";

interface SetModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 사용자가 선택한 발표 시간 (예: "5분") */
  time: string;
  /** 사용자가 선택한 말투 스타일 (예: "편안한 말투") */
  tone: string;
  /** "다시 확인하기" 클릭 시 (모달 닫고 설정 화면으로 복귀) */
  onRecheck: () => void;
  /** "네, 맞습니다" 클릭 시 (다음 단계 진행) */
  onConfirm: () => void;
}


const SetModal: FC<SetModalProps> = ({
  isOpen,
  time,
  tone,
  onRecheck,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-layer="AI 대본 생성_최종 확인 화면 (팝업)"
      className="Ai fixed inset-0 z-50 overflow-hidden"
    >
      {/* Rectangle 134 : 배경 오버레이 */}
      <div
        data-layer="Rectangle 134"
        className="Rectangle134 w-full h-full left-0 top-0 absolute bg-zinc-800/60 backdrop-blur-xs"
        onClick={onRecheck}
        aria-hidden="true"
      />

      {/* Frame 1380 : 모달 카드 (원본은 left-[755px] top-[394px] 절대좌표 → 반응형을 위해 중앙 정렬로 변경) */}
      <div
        data-layer="Frame 1380"
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-modal-title"
        className="Frame1380 w-96 h-72 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[20px] inline-flex flex-col justify-center items-center gap-6 "
      >
        <div
          data-layer="Frame 1379"
          className="Frame1379 w-67 flex flex-col justify-start items-center gap-4"
        >
          <div data-svg-wrapper data-layer="info" className="Info relative">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_245_193)">
                <path
                  d="M22.0005 3.66669C11.8805 3.66669 3.66718 11.88 3.66718 22C3.66718 32.12 11.8805 40.3334 22.0005 40.3334C32.1205 40.3334 40.3338 32.12 40.3338 22C40.3338 11.88 32.1205 3.66669 22.0005 3.66669ZM22.0005 31.1667C20.9922 31.1667 20.1672 30.3417 20.1672 29.3334V22C20.1672 20.9917 20.9922 20.1667 22.0005 20.1667C23.0088 20.1667 23.8338 20.9917 23.8338 22V29.3334C23.8338 30.3417 23.0088 31.1667 22.0005 31.1667ZM23.8338 16.5H20.1672V12.8334H23.8338V16.5Z"
                  fill="#222222"
                />
              </g>
              <defs>
                <clipPath id="clip0_245_193">
                  <rect width="44" height="44" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div
            data-layer="Frame 1376"
            className="Frame1376 self-stretch flex flex-col justify-start items-center gap-4"
          >
            <div
              id="set-modal-title"
              data-layer="발표 주제, 발표 시간, 말투 스타일 모두 알맞게 설정하셨습니까?"
              className="self-stretch text-center justify-start text-black text-xl font-semibold font-['Pretendard'] leading-7"
            >
              발표 주제, 발표 시간, 말투 스타일
              <br />
              모두 알맞게 설정하셨습니까?
            </div>
            <div
              data-layer="선택 값: 5분 / 편안한 말투"
              className="5 self-stretch text-center justify-start text-slate-500 text-base font-medium font-['Pretendard'] leading-6"
            >
              선택 값: {time} / {tone}
            </div>
          </div>
        </div>

        <div
          data-layer="Frame 1378"
          className="Frame1378 self-stretch inline-flex justify-center items-center gap-3"
        >
          <button
            type="button"
            data-layer="Frame 1377"
            onClick={onRecheck}
            className="Frame1377 w-40 px-2 py-4 bg-zinc-100 rounded-xl flex justify-center items-center gap-2"
          >
            <div
              data-layer="다시 확인하기"
              className="text-center justify-center text-slate-500 text-base font-semibold font-['Pretendard'] leading-4"
            >
              다시 확인하기
            </div>
          </button>
          <button
            type="button"
            data-layer="Frame 1342"
            onClick={onConfirm}
            className="Frame1342 w-36 px-8 py-4 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-xl flex justify-center items-center gap-2"
          >
            <div
              data-layer="네, 맞습니다"
              className="text-center justify-center text-white text-base font-semibold font-['Pretendard'] leading-4"
            >
              네, 맞습니다
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetModal;
