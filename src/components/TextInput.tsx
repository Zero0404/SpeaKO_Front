import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface TextInputProps {
  label: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** 여러 줄 입력이 필요할 때(예: 대본 전체 붙여넣기) true로 주면 <textarea>로 렌더링됩니다. */
  multiline?: boolean;
  /** multiline일 때 초기 표시 줄 수 (기본 4줄). 부모가 height를 강제로 덮어쓰면 실제 표시 크기에는 영향 없음. */
  rows?: number;
}

const TextInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  multiline = false,
  rows = 4,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const sharedClassName = `w-full min-w-0 rounded-xl border border-gray-300 py-3 pl-4 text-base outline-none transition focus:border-blue-500 sm:text-sm ${
    isPassword ? "pr-11" : "pr-4"
  }`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}

      <div className="relative min-w-0">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`${sharedClassName} resize-none`}
          />
        ) : (
          <input
            type={
              isPassword
                ? showPassword
                  ? "text"
                  : "password"
                : type
            }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={sharedClassName}
          />
        )}

        {isPassword && !multiline && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TextInput;
