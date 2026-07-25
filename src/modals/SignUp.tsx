import { useState } from "react";
import logo from "../assets/Logo.png";
import TextInput from "../components/TextInput";
import { signupApi } from "../apis/auth.api";

interface SignupProps {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const SignUp = ({ open, onClose, onLoginClick }: SignupProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleSignup = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await signupApi({
        name,
        email,
        password,
        passwordCheck,
      });

      if (result.success) {
        alert("회원가입이 완료되었습니다. 로그인해주세요.");
        onLoginClick();
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "회원가입에 실패했습니다.");
      } else {
        setErrorMessage("서버와 통신 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[500px] rounded-[32px] bg-white px-10 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="SpeaKO" className="mb-3 h-16 w-16 object-contain" />
          <h2 className="text-[20px] font-bold text-gray-900">SpeaKO 회원가입</h2>
        </div>

        <div className="space-y-5">
          <TextInput label="이름" placeholder="이름을 입력해주세요." value={name} onChange={setName} />
          <TextInput label="이메일" type="email" placeholder="이메일 주소를 입력해주세요." value={email} onChange={setEmail} />
          <TextInput label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요." value={password} onChange={setPassword} />
          <TextInput label="비밀번호 재입력" type="password" placeholder="비밀번호를 한번 더 입력해주세요." value={passwordCheck} onChange={setPasswordCheck} />
        </div>

        {/* 에러 메시지 표시 */}
        {errorMessage && (
          <div className="mt-4 text-sm text-red-500 whitespace-pre-wrap">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={isLoading}
          className="mt-8 h-12 w-full rounded-xl bg-[#6E8BFF] text-base font-semibold text-white transition hover:bg-[#5a75e6] disabled:bg-gray-300"
        >
          {isLoading ? "처리 중..." : "SpeaKO 시작하기"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          이미 회원이신가요?
          <button onClick={onLoginClick} className="ml-2 font-semibold text-[#6E8BFF] hover:underline">
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;