import { useState } from "react";
import TextInput from "../components/TextInput";
import Logo from "../assets/Logo.png";
import { loginApi } from "../apis/auth.api";

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const Login = ({ open, onClose, onSignupClick }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await loginApi({
        email,
        password,
      });

      if (result.success) {
        const { accessToken } = result.result;
        // 토큰 저장 (추후 인증 필요한 페이지에서 사용)
        localStorage.setItem("accessToken", accessToken);

        alert("로그인에 성공하였습니다.");
        onClose();
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "로그인에 실패했습니다.");
      } else {
        setErrorMessage("서버와 통신 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <img src={Logo} alt="logo" className="mb-4 h-16 w-16 object-contain" />
          <h2 className="mb-8 text-3xl font-bold">SpeaKO 로그인</h2>
        </div>

        <div className="space-y-5">
          <TextInput label="이메일" type="email" placeholder="이메일 주소를 입력해주세요." value={email} onChange={setEmail} />
          <TextInput label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요." value={password} onChange={setPassword} />
        </div>

        {/* 에러 메시지 표시 */}
        {errorMessage && (
          <div className="mt-4 text-sm text-red-550 text-center text-red-500">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="mt-8 h-12 w-full rounded-xl bg-[#6E8BFF] font-semibold text-white transition hover:bg-[#5a75e6] disabled:bg-gray-300"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>

        <div className="mt-8 text-center text-gray-500">
          아직 회원이 아니신가요?
          <button className="ml-2 font-semibold text-blue-500 hover:underline" onClick={onSignupClick}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;