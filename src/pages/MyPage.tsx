import { useState } from "react";
import {
  User,
  FileText,
  Mic,
  Pencil,
  MailCheck,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import TaskChip from "../components/TaskChip";
import ProfileEdit from "../modals/ProfileEdit";
import EmailChange from "../modals/EmailChange";
import PasswordChange from "../modals/PasswordChange";
import Logout from "../modals/Logout";
import DeleteAccount from "../modals/DeleteAccount";
import ViewPageBackground from "../assets/background_gradiant.png";

// ─────────────────────────────────────────────
// 모달 종류 (실제 모달 컴포넌트는 이따가 modals/ 에 추가 예정)
// ─────────────────────────────────────────────
type ModalType = "name" | "email" | "password" | "logout" | "withdraw" | null;

// TODO: 실제 유저 데이터는 apis/auth.api.ts 연동 후 교체
const MOCK_USER = {
  name: "홍길동",
  email: "Honggildong1234@naver.com",
  grade: "일반 회원",
};

const MyPage = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white"
        style={{
        backgroundImage: `url(${ViewPageBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
      >
      <main className="relative mx-auto w-full max-w-[1519px] px-6 pb-24 pt-16 sm:px-10">
        {/* 타이틀 + 상단 버튼 */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2.5">
            <h1 className="text-3xl font-extrabold leading-8 text-zinc-800 font-['Pretendard']">
              마이페이지
            </h1>
            <p className="text-xl font-medium leading-8 text-slate-500 font-['Pretendard']">
              계정 정보와 활동 내역을 관리할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TaskChip
              icon={LogOut}
              label="로그아웃"
              onClick={() => openModal("logout")}
            />

            <button
              type="button"
              onClick={() => openModal("withdraw")}
              className="flex h-12 items-center gap-2 rounded-xl bg-rose-500/10 pl-4 pr-5 text-lg font-medium font-['Pretendard'] leading-4 text-rose-500 transition hover:bg-rose-500/20"
            >
              <LogOut size={22} />
              회원 탈퇴
            </button>
          </div>
        </div>

        {/* 프로필 정보 */}
        <div className="mt-14 flex w-full items-center gap-7 rounded-[20px] bg-white p-10 shadow-[0px_0px_15px_0px_rgba(120,165,250,0.10)]">
          {/* 홍길동 옆 사각 아이콘 박스 */}
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[20px] glass-icon-box">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-indigo-500/10" />
            <User
              size={44}
              className="relative text-indigo-500 drop-shadow-sm"
              fill="currentColor"
            />
          </div>

          <div className="flex flex-1 flex-col items-start gap-3 pl-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold leading-7 text-zinc-800 font-['Pretendard']">
                {MOCK_USER.name}님
              </span>
              {/* 일반 회원 뱃지 */}
              <span className="relative flex h-9 items-center gap-2 overflow-hidden rounded-lg px-4 py-2.5 glass-badge">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-indigo-500/10" />
                <span className="relative text-center text-lg font-semibold leading-4 text-indigo-500 font-['Pretendard']">
                  {MOCK_USER.grade}
                </span>
              </span>
            </div>
            <span className="text-xl font-medium leading-5 text-slate-500 font-['Pretendard']">
              {MOCK_USER.email}
            </span>
          </div>
        </div>

        {/* 기능 미구현 — 표시만) */}
        <section className="mt-14">
          <h2 className="pl-1 text-3xl font-bold leading-7 text-zinc-800 font-['Pretendard']">
            개인 워크스페이스
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-2">
            <ManageCard
              icon={<FileText size={44} className="text-indigo-500" />}
              title="대본 생성 기록"
              description="작성했던 대본을 다시 확인합니다."
            />
            <ManageCard
              icon={<Mic size={44} className="text-indigo-500" />}
              title="발표 코칭 내역"
              description="AI 발음 피드백 결과를 확인합니다."
            />
          </div>
        </section>

        {/* 계정 관리 */}
        <section className="mt-14">
          <h2 className="pl-1 text-3xl font-bold leading-7 text-zinc-800 font-['Pretendard']">
            계정 관리
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-3">
            <ManageCard
              icon={<Pencil size={44} className="text-indigo-500" />}
              title="이름 수정"
              description="프로필 이름을 변경합니다."
              onClick={() => openModal("name")}
            />
            <ManageCard
              icon={<MailCheck size={44} className="text-indigo-500" />}
              title="이메일 변경"
              description="로그인 이메일을 수정합니다."
              onClick={() => openModal("email")}
            />
            <ManageCard
              icon={<Lock size={44} className="text-indigo-500" />}
              title="비밀번호 변경"
              description="보안 비밀번호를 갱신합니다."
              onClick={() => openModal("password")}
            />
          </div>
        </section>
      </main>

      {/* activeModal 값에 따라 5개 모달을 분기 렌더링 */}
      {activeModal === "name" && (
        <ProfileEdit
          currentName={MOCK_USER.name}
          onClose={closeModal}
          onSave={(name) => {
            // TODO: apis/auth.api.ts 연동 후 실제 이름 변경 요청으로 교체
            console.log("이름 변경:", name);
          }}
        />
      )}

      {activeModal === "email" && (
        <EmailChange
          currentEmail={MOCK_USER.email}
          onClose={closeModal}
          onSave={(email) => {
            // TODO: apis/auth.api.ts 연동 후 실제 이메일 변경 요청으로 교체
            console.log("이메일 변경:", email);
          }}
        />
      )}

      {activeModal === "password" && (
        <PasswordChange
          onClose={closeModal}
          onSave={(currentPassword, newPassword) => {
            // TODO: apis/auth.api.ts 연동 후 실제 비밀번호 변경 요청으로 교체
            console.log("비밀번호 변경 요청", { currentPassword, newPassword });
          }}
        />
      )}

      {activeModal === "logout" && (
        <Logout
          onClose={closeModal}
          onConfirm={() => {
            // TODO: 실제 로그아웃 처리(토큰 제거 등) + 로그인 페이지로 이동
            console.log("로그아웃 처리");
          }}
        />
      )}

      {activeModal === "withdraw" && (
        <DeleteAccount
          onClose={closeModal}
          onConfirm={() => {
            // TODO: 실제 탈퇴 처리 + 로그인/랜딩 페이지로 이동
            console.log("회원 탈퇴 처리");
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// 카드 하나 (아이콘 + 제목 + 설명 + 화살표)
// onClick이 없으면 클릭 불가능한 정적 카드로 렌더링
// ─────────────────────────────────────────────
interface ManageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const ManageCard = ({ icon, title, description, onClick }: ManageCardProps) => {
  const isInteractive = !!onClick;

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick?.();
            }
          : undefined
      }
      className={`flex w-full items-center gap-7 rounded-[20px] bg-white p-5 shadow-[0px_0px_15px_0px_rgba(120,165,250,0.10)] transition ${
        isInteractive
          ? "cursor-pointer hover:shadow-[0px_0px_20px_0px_rgba(120,165,250,0.20)]"
          : ""
      }`}
    >
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[20px] glass-icon-box backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-indigo-300/0" />
        <div className="relative drop-shadow-sm">{icon}</div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-3 pl-1">
        <span className="text-2xl font-bold leading-6 text-zinc-800 font-['Pretendard']">
          {title}
        </span>
        <span className="text-lg font-medium leading-4 text-slate-500 font-['Pretendard']">
          {description}
        </span>
      </div>

      {isInteractive && (
        <ChevronRight size={32} className="shrink-0 text-[#808892]" />
      )}
    </div>
  );
};

export default MyPage;
