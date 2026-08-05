import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: "http://15.164.171.107:8080",
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

// 응답에서 토큰을 꺼내는 헬퍼
// 실제 백엔드 응답 필드명을 몰라서 흔히 쓰이는 후보를 순서대로 확인합니다.
// 응답 구조를 확인하시면 이 함수 하나만 정확한 필드로 교체하면 됩니다.
function extractAccessToken(responseData: any): string | null {
  return (
    responseData?.accessToken ??
    responseData?.token ??
    responseData?.access_token ??
    responseData?.data?.accessToken ??
    null
  );
}

// 회원가입 API
export const signupApi = async (data: {
  name: string;
  email: string;
  password: string;
  passwordCheck: string;
}) => {
  const response = await apiClient.post("/api/auth/signup", data);
  return response.data;
};

// 로그인 API
export const loginApi = async (data: {
  email: string;
  password: string;
}) => {
  const response = await apiClient.post("/api/auth/login", data);

  const token = extractAccessToken(response.data);
  if (token) {
    useAuthStore.getState().setAccessToken(token);
  } else {
    // 응답에서 토큰을 못 찾았다면, 실제 구조를 콘솔에서 확인할 수 있도록 로그를 남깁니다.
    console.warn(
      '[loginApi] 응답에서 accessToken을 찾지 못했습니다. 실제 응답 구조를 확인해주세요:',
      response.data
    );
  }

  return response.data;
};

export default apiClient;