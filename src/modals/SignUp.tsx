import { useState } from "react";
import logo from "../assets/Logo.png";
import TextInput from "../components/TextInput";
import { signupApi } from "../apis/apiclient";

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

  const passwordsMatch = password.length > 0 && password === passwordCheck;
  const canSubmit = passwordsMatch && !isLoading;

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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-6 sm:py-10">
        <div
          className="w-full max-w-[500px] max-h-[85vh] overflow-y-auto rounded-[32px] bg-white px-6 py-6 sm:px-10 sm:py-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex flex-col items-center sm:mb-8">
            <img src={logo} alt="SpeaKO" className="mb-3 h-12 w-12 object-contain sm:h-16 sm:w-16" />
            <h2 className="text-[20px] font-bold text-gray-900">SpeaKO 회원가입</h2>
          </div>

          <div className="space-y-4 sm:space-y-5">
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
            disabled={!canSubmit}
            className={`mt-6 h-12 w-full rounded-xl font-semibold transition sm:mt-8 ${
              canSubmit
                ? "hover-effect-btn is-active hover:brightness-105"
                : "cursor-not-allowed bg-gray-300 text-white"
            }`}
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
    </div>
  );
};

export default SignUp;
