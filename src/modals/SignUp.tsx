import { useState } from "react";
import logo from "../assets/Logo.png";
import TextInput from "../components/TextInput";

interface SignupProps {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const Signup = ({
  open,
  onClose,
  onLoginClick,
}: SignupProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[500px] rounded-[32px] bg-white px-10 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 로고 */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src={logo}
            alt="SpeaKO"
            className="mb-3 h-16 w-16 object-contain"
          />

          <h2 className="text-[20px] font-bold text-gray-900">
            SpeaKO 회원가입
          </h2>
        </div>

        {/* 입력 */}
        <div className="space-y-5">
          <TextInput
            label="이름"
            placeholder="이름을 입력해주세요."
            value={name}
            onChange={setName}
          />

          <TextInput
            label="이메일"
            type="email"
            placeholder="이메일 주소를 입력해주세요."
            value={email}
            onChange={setEmail}
          />

          <TextInput
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={setPassword}
          />

          <TextInput
            label="비밀번호 재입력"
            type="password"
            placeholder="비밀번호를 한번 더 입력해주세요."
            value={passwordCheck}
            onChange={setPasswordCheck}
          />
        </div>

        {/* 버튼 */}
        <button
          className="mt-8 h-12 w-full rounded-xl bg-gray-100 text-base font-semibold text-gray-500 transition hover:bg-gray-200"
        >
          SpeaKO 시작하기
        </button>

        {/* 로그인으로 이동 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          이미 회원이신가요?

          <button
            onClick={onLoginClick}
            className="ml-2 font-semibold text-[#6E8BFF] hover:underline"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;