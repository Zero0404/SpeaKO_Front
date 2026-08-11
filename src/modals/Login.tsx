import { useState } from "react";
import TextInput from "../components/TextInput";
import Logo from "../assets/Logo.png";
import { loginApi } from "../apis/auth.api";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../utils/getErrorMessage";

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

        useAuthStore.getState().setAccessToken(accessToken);

        onClose();
        window.location.reload();
      } else {
        // 백엔드가 401/400 같은 에러 상태코드가 아니라 200 OK + success:false로
        // "이메일/비밀번호 불일치"를 내려주는 경우 여기로 들어옵니다.
        // (에러가 throw되지 않아 catch 블록까지 못 가므로 별도로 처리해야 함)
        // 백엔드가 실패 사유를 어떤 필드명으로 주는지 몰라도 되도록 여러 후보를 시도합니다.
        setErrorMessage(getErrorMessage(result, "이메일 또는 비밀번호가 일치하지 않습니다."));
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(getErrorMessage(error.response.data, "로그인에 실패했습니다."));
      } else {
        setErrorMessage("서버와 통신 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-6 sm:py-10">
        <div
          className="w-full max-w-[450px] max-h-[85vh] overflow-y-auto rounded-3xl bg-white px-6 py-6 sm:px-10 sm:py-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center">
            <img src={Logo} alt="logo" className="mb-3 h-12 w-12 object-contain sm:mb-4 sm:h-16 sm:w-16" />
            <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">SpeaKO 로그인</h2>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <TextInput label="이메일" type="email" placeholder="이메일 주소를 입력해주세요." value={email} onChange={setEmail} />
            <TextInput label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요." value={password} onChange={setPassword} />
          </div>

          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="mt-4 whitespace-pre-line text-center text-sm text-red-500">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-6 h-12 w-full rounded-xl hover-effect-btn is-active font-semibold transition hover:brightness-105 disabled:bg-gray-300 sm:mt-8"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="mt-6 text-center text-gray-500 sm:mt-8">
            아직 회원이 아니신가요?
            <button className="ml-2 font-semibold text-blue-500 hover:underline" onClick={onSignupClick}>
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
