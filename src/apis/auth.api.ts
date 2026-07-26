import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://15.164.171.107:8080", 
  headers: {
    "Content-Type": "application/json",
  },
});

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
  return response.data;
};