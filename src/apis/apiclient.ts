import axios from "axios";
import { useAuthStore } from "../store/authStore";

// 배포(Vercel, https)에서는 vercel.json의 rewrites가 "/api/..."를
// http://15.164.171.107:8080/api/...로 서버 쪽에서 중계해주므로 상대경로("")를 씁니다.
// (브라우저가 http://로 직접 요청하면 mixed content로 막히기 때문)
// 로컬 개발(localhost, http)에서는 mixed content 문제가 없으니 백엔드로 바로 요청합니다.
const baseURL = import.meta.env.PROD ? "" : "http://15.164.171.107:8080";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 로그인되어 있으면 모든 요청에 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractAccessToken(responseData: any): string | null {
  return responseData?.result?.accessToken ?? null;
}

function extractUserInfo(responseData: any): { email?: string; name?: string } {
  const email = responseData?.result?.email;
  const name = responseData?.result?.name;
  return {
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
  };
}

// 회원가입
export const signupApi = async (data: {
  name: string;
  email: string;
  password: string;
  passwordCheck: string;
}) => {
  const response = await apiClient.post("/api/auth/signup", data);
  useAuthStore.getState().setUser({ name: data.name, email: data.email });
  return response.data;
};

// 로그인
export const loginApi = async (data: { email: string; password: string }) => {
  const response = await apiClient.post("/api/auth/login", data);

  const token = extractAccessToken(response.data);
  if (token) {
    useAuthStore.getState().setAccessToken(token);
  } else {
    console.warn(
      "[loginApi] 응답에서 accessToken을 찾지 못했습니다. 실제 응답 구조를 확인해주세요:",
      response.data
    );
  }

  const { email, name } = extractUserInfo(response.data);
  useAuthStore.getState().setUser({
    email: email ?? data.email,
    name: name ?? useAuthStore.getState().user?.name ?? "",
  });

  return response.data;
};

// ── 공통 응답 언래핑 (code/message/result/success 형태) ──────────
interface ApiResponse<T = null> {
  code: string;
  message: string;
  result: T;
  success: boolean;
}

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function request<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const { data } = await promise;
    if (!data.success) {
      throw new ApiError(data.code, data.message);
    }
    return data.result;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const body = err.response.data as ApiResponse<T>;
      throw new ApiError(body.code ?? "UNKNOWN_ERROR", body.message ?? "요청에 실패했습니다.");
    }
    throw err;
  }
}

// ── MyPage: 개인정보 변경 ────────────────────────────────────────
export const patchNameApi = (name: string) =>
  request(apiClient.patch<ApiResponse>("/api/auth/name", { name }));

export const patchEmailApi = (newEmail: string, currentPassword: string) =>
  request(apiClient.patch<ApiResponse>("/api/auth/email", { newEmail, currentPassword }));

export const patchPasswordApi = (
  currentPassword: string,
  newPassword: string,
  newPasswordCheck: string
) =>
  request(
    apiClient.patch<ApiResponse>("/api/auth/password", {
      currentPassword,
      newPassword,
      newPasswordCheck,
    })
  );

// ── 로그아웃 / 회원탈퇴 ───────────────────────────────────────────
export const logoutApi = () => request(apiClient.post<ApiResponse>("/api/auth/logout"));

export const withdrawApi = (password: string) =>
  request(
    apiClient.delete<ApiResponse>("/api/auth/withdraw", {
      data: { password },
    })
  );

export default apiClient;
