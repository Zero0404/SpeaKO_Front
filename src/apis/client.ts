import { useAuthStore } from '../store/authStore';

// baseURL 결정 우선순위 (apiClient.ts / auth.api.ts와 동일한 규칙으로 맞춤):
// 1) VITE_API_BASE_URL 환경변수가 설정되어 있으면 그 값을 그대로 씁니다.
// 2) 환경변수가 없으면:
//    - 배포(Vercel, https) 빌드에서는 상대경로("")를 써서 vercel.json의
//      rewrites가 "/api/..."를 서버 쪽에서 http://13.209.87.115:8080/api/...로
//      대신 중계하게 합니다.
//
//      ⚠️ 이전 버전은 이 분기가 없어서 프로덕션(https://speakofront.vercel.app)에서도
//      계속 http://13.209.87.115:8080으로 직접 fetch를 시도했습니다. HTTPS 페이지에서
//      http:// 요청은 브라우저가 mixed content로 "조용히" 막아버리기 때문에(요청 자체가
//      네트워크 탭에 안 뜨거나 CORS 에러로만 보임), 실제로는 "음성 파일이 서버에 전혀
//      도착하지 못하는" 상태였을 가능성이 높습니다. auth.api.ts / apiClient.ts와 똑같이
//      PROD면 상대경로를 쓰도록 맞췄습니다.
//    - 로컬 개발(localhost, http)에서는 mixed content 문제가 없으니 백엔드로 바로 요청합니다.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '' : 'http://13.209.87.115:8080');

function mapStatusToMessage(status: number, fallback: string): string {
  switch (status) {
    case 400:
      // ⚠️ 이전에는 서버가 보낸 실제 메시지(fallback)를 버리고 항상 이 문자열로
      // 덮어썼습니다. 그래서 "업로드된 오디오 파일이 비어 있습니다.",
      // "해당 대본을 찾을 수 없습니다." 같은 evaluations/record 스펙의 구체적인
      // 400 에러 메시지가 화면에 전혀 반영되지 않았습니다. 서버 메시지를 그대로
      // 보여주도록 수정합니다.
      return fallback;
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return fallback;
    case 413:
      return '파일 용량은 최대 20MB까지 업로드할 수 있습니다.';
    default:
      return fallback;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    let serverMessage = `요청에 실패했습니다. (${res.status})`;
    try {
      const body = await res.json();
      serverMessage = body.message ?? serverMessage;
    } catch {
      /* 바디 없음 */
    }
    const error = new Error(mapStatusToMessage(res.status, serverMessage)) as Error & {
      status?: number;
    };
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  // JSON이 아니라면 text/plain 등은 문자열로 반환
  return (await res.text()) as T;
}
