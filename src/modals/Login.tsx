import { useState } from "react";
import TextInput from "../components/TextInput";
import Logo from "../assets/Logo.png";

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const Login = ({
  open,
  onClose,
  onSignupClick,
}: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[450px] rounded-3xl bg-white px-10 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <img
            src={Logo}
            alt="logo"
            className="mb-4 h-16 w-16 object-contain"
          />

          <h2 className="mb-8 text-3xl font-bold">
            SpeaKO 로그인
          </h2>
        </div>

        <div className="space-y-5">
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
        </div>

        <button
          className="mt-8 h-12 w-full rounded-xl bg-gray-100 font-semibold text-gray-500 transition hover:bg-gray-200"
        >
          로그인
        </button>

        <div className="mt-8 text-center text-gray-500">
          아직 회원이 아니신가요?

          <button
            className="ml-2 font-semibold text-blue-500 hover:underline"
            onClick={onSignupClick}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;