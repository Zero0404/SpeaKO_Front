import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface TextInputProps {
  label: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  value: string;
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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-800">
        {label}
      </label>

      <div className="relative">
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
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
        />

        {isPassword && (
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