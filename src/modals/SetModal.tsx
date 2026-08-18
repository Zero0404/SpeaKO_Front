import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ChevronRight,
  Cloud,
  CreditCard,
  Eye,
  FileText,
  Mic,
  User,
  UserX,
} from "lucide-react";
import ModalShell from "./ModalShell";
import ProfileEdit from "./ProfileEdit";
import EmailChange from "./EmailChange";
import PasswordChange from "./PasswordChange";
import { useAuthStore } from "../store/authStore";

export type SettingsTab = "profile" | "plan" | "records";
type FieldModal = "name" | "email" | "password" | null;

interface UserInfo {
  name: string;
  email: string;
}

interface PlanInfo {
  name: string;
  usagePercent: number;
}

interface SetModalProps {
  onClose: () => void;
  initialTab?: SettingsTab;
  /** authStore에 아직 값이 없을 때(예: 마이그레이션 전 세션)만 쓰이는 fallback */
  user: UserInfo;
  plan?: PlanInfo;
  onSaveProfile?: (data: { nickname: string; email: string }) => void;
  onScriptHistoryClick?: () => void;
  onCoachHistoryClick?: () => void;
  onDeleteAccountClick?: () => void;
}

const TABS: { key: SettingsTab; label: string; icon: ReactNode }[] = [
  { key: "profile", label: "개인 정보", icon: <User size={20} /> },
  { key: "plan", label: "요금제", icon: <CreditCard size={20} /> },
  { key: "records", label: "기록", icon: <Cloud size={20} /> },
];

const TAB_META: Record<SettingsTab, { title: string; description: string }> = {
  profile: { title: "개인정보", description: "개인 정보를 관리하세요." },
  plan: { title: "요금제", description: "요금제를 관리하세요." },
  records: { title: "기록 관리", description: "사용한 기록과 내역을 확인하세요." },
};

const CONTENT_MIN_HEIGHT = "md:min-h-[450px]";
const PASSWORD_MASK = "•".repeat(14);

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  onChangeClick: () => void;
  trailingIcon?: ReactNode;
}

const ReadOnlyField = ({ label, value, onChangeClick, trailingIcon }: ReadOnlyFieldProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
        {label}
      </span>
      <button
        type="button"
        onClick={onChangeClick}
        className="text-xs font-semibold leading-3 text-indigo-500 transition hover:underline font-['Pretendard']"
      >
        변경하기
      </button>
    </div>
    <div className="flex h-11 items-center justify-between rounded-lg border border-stone-300 px-4 text-sm text-slate-500">
      <span className="truncate">{value}</span>
      {trailingIcon}
    </div>
  </div>
);

const SetModal = ({
  onClose,
  initialTab = "profile",
  user,
  plan = { name: "Free 플랜", usagePercent: 20 },
  onSaveProfile,
  onDeleteAccountClick,
}: SetModalProps) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [fieldModal, setFieldModal] = useState<FieldModal>(null);
  const [isUpdatingModalOpen, setIsUpdatingModalOpen] = useState(false);

  // authStore가 계정 정보의 단일 소스. 값이 없을 때만 부모가 넘긴 user prop으로 fallback.
  const storeUser = useAuthStore((state) => state.user);
  const updateStoreUser = useAuthStore((state) => state.updateUser);

  const nickname = storeUser?.name || user.name;
  const email = storeUser?.email || user.email;

  return (
    <>
      <ModalShell
        onClose={onClose}
        maxWidthClassName="max-w-[668px]"
        paddingClassName="p-4 sm:p-6"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          <div className="flex w-full flex-col gap-4 md:w-48 md:shrink-0 md:self-stretch">
            <h2 className="pl-1 text-xl font-bold leading-7 text-black font-['Pretendard']">
              설정
            </h2>

            <div className="flex flex-col gap-3 md:flex-1 md:justify-between">
              <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg p-3 text-left transition md:w-full ${
                      activeTab === tab.key ? "bg-neutral-100" : "hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-zinc-800">{tab.icon}</span>
                    <span className="text-sm font-medium leading-4 text-zinc-800 font-['Pretendard']">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </nav>

              <button
                type="button"
                onClick={onDeleteAccountClick}
                className="flex h-10 items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-left transition hover:bg-rose-500/20"
              >
                <UserX size={20} className="text-rose-500" />
                <span className="text-sm font-medium leading-4 text-rose-500 font-['Pretendard']">
                  회원 탈퇴
                </span>
              </button>
            </div>
          </div>

          <div className="h-px w-full shrink-0 bg-slate-500/25 md:h-auto md:w-px md:self-stretch" />

          <div className={`flex flex-1 flex-col gap-4 md:pr-6 ${CONTENT_MIN_HEIGHT}`}>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold leading-6 text-black font-['Pretendard']">
                {TAB_META[activeTab].title}
              </h3>
              <p className="text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
                {TAB_META[activeTab].description}
              </p>
            </div>

            {activeTab === "profile" && (
              <>
                <div className="flex items-center gap-4">
                  <div className="glass-icon-box flex size-16 shrink-0 items-center justify-center rounded-full">
                    <User size={28} className="text-[color:var(--color-brand-primary)]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
                      {nickname}
                    </span>
                    <span className="text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
                      {email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <ReadOnlyField
                    label="닉네임"
                    value={nickname}
                    onChangeClick={() => setFieldModal("name")}
                  />
                  <ReadOnlyField
                    label="이메일"
                    value={email}
                    onChangeClick={() => setFieldModal("email")}
                  />
                  <ReadOnlyField
                    label="비밀번호"
                    value={PASSWORD_MASK}
                    onChangeClick={() => setFieldModal("password")}
                    trailingIcon={<Eye size={16} className="shrink-0 text-slate-400" />}
                  />
                </div>
              </>
            )}

            {activeTab === "plan" && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
                    현재 플랜
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/pricing");
                    }}
                    className="flex h-11 items-center justify-between rounded-lg bg-gradient-to-br from-indigo-300 to-indigo-500 px-4 text-left text-white transition hover:brightness-105"
                  >
                    <span className="text-sm font-semibold font-['Pretendard']">{plan.name}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
                      사용량
                    </span>
                    <span className="text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
                      {plan.usagePercent}% 사용함
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-br from-indigo-300 to-indigo-500"
                      style={{ width: `${Math.min(100, Math.max(0, plan.usagePercent))}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "records" && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdatingModalOpen(true)}
                  className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 text-left transition hover:bg-neutral-50"
                >
                  <span className="glass-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <FileText size={18} className="text-[color:var(--color-brand-primary)]" />
                  </span>

                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
                      대본 생성 기록
                    </span>
                    <span className="text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
                      작성했던 대본을 다시 확인합니다.
                    </span>
                  </span>

                  <ChevronRight size={16} className="shrink-0 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsUpdatingModalOpen(true)}
                  className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 text-left transition hover:bg-neutral-50"
                >
                  <span className="glass-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Mic size={18} className="text-[color:var(--color-brand-primary)]" />
                  </span>

                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold leading-4 text-zinc-800 font-['Pretendard']">
                      발표 코칭 내역
                    </span>
                    <span className="text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
                      AI 발음 피드백 결과를 확인합니다.
                    </span>
                  </span>

                  <ChevronRight size={16} className="shrink-0 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </ModalShell>

      {fieldModal === "name" && (
        <ProfileEdit
          currentName={nickname}
          onClose={() => setFieldModal(null)}
          onSave={(name) => {
            updateStoreUser({ name });
            onSaveProfile?.({ nickname: name, email });
            setFieldModal(null);
          }}
        />
      )}

      {fieldModal === "email" && (
        <EmailChange
          currentEmail={email}
          onClose={() => setFieldModal(null)}
          onSave={(newEmail) => {
            updateStoreUser({ email: newEmail });
            onSaveProfile?.({ nickname, email: newEmail });
            setFieldModal(null);
          }}
        />
      )}

      {fieldModal === "password" && (
        <PasswordChange
          onClose={() => setFieldModal(null)}
          onSave={() => {
            // 비밀번호 자체는 화면에 표시되는 계정 정보가 아니라 store에 반영할 게 없음
            setFieldModal(null);
          }}
        />
      )}

      {isUpdatingModalOpen && (
        <ModalShell
          onClose={() => setIsUpdatingModalOpen(false)}
          maxWidthClassName="max-w-[400px]"
          paddingClassName="p-6"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="glass-icon-box flex size-14 items-center justify-center rounded-full">
              <Cloud
                size={26}
                className="text-[color:var(--color-brand-primary)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-zinc-800 font-['Pretendard']">
                업데이트 중인 기능입니다
              </h3>

              <p className="text-sm leading-5 text-slate-500 font-['Pretendard']">
                해당 기능은 현재 준비 중입니다.
                <br />
                조금만 기다려주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsUpdatingModalOpen(false)}
              className="w-full rounded-xl bg-gradient-to-br from-indigo-300 to-indigo-500 py-3 text-sm font-semibold text-white transition hover:brightness-105"
            >
              확인
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
};

export default SetModal;