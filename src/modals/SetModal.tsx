import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronRight,
  Cloud,
  CreditCard,
  FileText,
  Mic,
  User,
  UserX,
} from "lucide-react";
import TextInput from "../components/TextInput";
import ModalShell from "./ModalShell";

export type SettingsTab = "profile" | "plan" | "records";

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
  /** 어떤 탭을 열어둔 채로 시작할지 (드롭다운의 "계정 설정" / "요금제 업그레이드"에서 각각 다르게 진입) */
  initialTab?: SettingsTab;
  user: UserInfo;
  /** 없으면 Free 플랜 기본값으로 표시 */
  plan?: PlanInfo;
  onSaveProfile?: (data: { nickname: string; email: string; password: string }) => void;
  onPlanClick?: () => void;
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

// "개인 정보" 탭(가장 내용이 긴 탭) 기준으로 실측한 콘텐츠 높이.
// 요금제/기록 탭도 이 높이를 유지해서 탭을 바꿔도 모달 크기가 흔들리지 않게 합니다.
const CONTENT_MIN_HEIGHT = "min-h-[450px]";

const SetModal = ({
  onClose,
  initialTab = "profile",
  user,
  plan = { name: "Free 플랜", usagePercent: 20 },
  onSaveProfile,
  onPlanClick,
  onScriptHistoryClick,
  onCoachHistoryClick,
  onDeleteAccountClick,
}: SetModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  const [nickname, setNickname] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");

  const handleSave = () => {
    onSaveProfile?.({ nickname, email, password });
  };

  return (
    <ModalShell onClose={onClose} maxWidthClassName="max-w-[668px]" paddingClassName="p-6">
      <div className="flex items-stretch gap-6">
        {/* 사이드바 (오른쪽 콘텐츠 높이에 맞춰 늘어나도록 self-stretch) */}
        <div className="flex w-48 shrink-0 flex-col gap-4 self-stretch">
          <h2 className="pl-1 text-xl font-bold leading-7 text-black font-['Pretendard']">
            설정
          </h2>

          <div className="flex flex-1 flex-col justify-between">
            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-10 items-center gap-2 rounded-lg p-3 text-left transition ${
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

        {/* 구분선 */}
        <div className="w-px shrink-0 self-stretch bg-slate-500/25" />

        {/* 콘텐츠 — 탭이 바뀌어도 모달 크기가 그대로이도록 최소 높이 고정 */}
        <div className={`flex flex-1 flex-col gap-4 pr-6 ${CONTENT_MIN_HEIGHT}`}>
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
                    {user.name}
                  </span>
                  <span className="text-xs font-medium leading-3 text-slate-500 font-['Pretendard']">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <TextInput label="닉네임" value={nickname} onChange={setNickname} />
                <TextInput label="이메일" type="email" value={email} onChange={setEmail} />
                <TextInput
                  label="비밀번호"
                  type="password"
                  placeholder="변경하려면 새 비밀번호를 입력하세요"
                  value={password}
                  onChange={setPassword}
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-8 py-4 text-sm font-semibold text-slate-500 transition hover:bg-zinc-200"
              >
                변경 사항 저장
              </button>
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
                  onClick={onPlanClick}
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
                onClick={onScriptHistoryClick}
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
                onClick={onCoachHistoryClick}
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
  );
};

export default SetModal;
