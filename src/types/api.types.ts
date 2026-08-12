/**
 * 백엔드 공통 응답 규격.
 * 전달받은 API 명세(POST /api/presentations, POST /api/evaluations/record)의
 * 에러 응답과 evaluations/record의 성공 응답이 모두 이 형태를 따르고 있어서 공통 타입으로 뺐습니다.
 */
export interface ApiSuccessResponse<T> {
  code: string;
  message: string;
  result: T;
  success: true;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  result: null;
  success: false;
}
