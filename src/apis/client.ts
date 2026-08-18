import { useAuthStore } from '../store/authStore';


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '' : 'http://13.209.87.115:8080');

function mapStatusToMessage(status: number, fallback: string): string {
  switch (status) {
    case 400:
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
