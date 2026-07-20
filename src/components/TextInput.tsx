import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";


interface TextInputProps {
  // 입력창 위에 표시될 라벨
  label: string;

  // 입력창의 타입 (기본값은 text)
  type?: "text" | "password" | "email";

  // 입력창 안에 표시될 안내 문구
  placeholder?: string;

  // 현재 입력된 값
  value: string;

  // 입력값이 변경될 때 실행되는 함수
  onChange: (value: string) => void;
}


const TextInput = ({
  label,
  type = "text", 
  placeholder,
  value,
  onChange,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    // 라벨과 입력창을 세로로 배치
    <div className="flex flex-col gap-2">
      {/* 입력창 제목 */}
      <label className="text-sm font-semibold text-gray-800">
        {label}
      </label>

      {/* 아이콘을 입력창 위에 배치하기 위해 relative 사용 */}
      <div className="relative">
        <input
          // 비밀번호 입력창이라면
          // showPassword가 true → text(보이기)
          // showPassword가 false → password(숨기기)
          // 비밀번호가 아니라면 전달받은 type 그대로 사용
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }

          // 현재 입력값
          value={value}

          // 사용자가 입력할 때마다 부모 컴포넌트에 입력값 전달
          onChange={(e) => onChange(e.target.value)}

          // 안내 문구
          placeholder={placeholder}

          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
        />

        {/* 비밀번호 입력창인 경우에만 눈 아이콘 표시 */}
        {isPassword && (
          <button
            type="button"
            // 클릭할 때마다 true ↔ false로 변경
            onClick={() => setShowPassword(!showPassword)}
            // 입력창 오른쪽 가운데에 아이콘 배치
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {/* 
              showPassword가 true면 EyeOff(숨기기 아이콘)
              false면 Eye(보기 아이콘)
            */}
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};


export default TextInput;