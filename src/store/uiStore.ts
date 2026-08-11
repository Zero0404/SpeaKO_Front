import { create } from "zustand";

// 로그인/회원가입 모달은 Navbar.tsx가 항상 마운트해서 들고 있으므로,
// HomePage 같은 다른 페이지/컴포넌트에서도 "로그인 모달을 열어달라"고
// 요청할 수 있도록 만든 전역 스토어입니다. (예: 비로그인 상태에서
// "파일 업로드하고 시작하기" 클릭 시 로그인 모달 오픈)
interface UIState {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoginOpen: false,
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
}));
