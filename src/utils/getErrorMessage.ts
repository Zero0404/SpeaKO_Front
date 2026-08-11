/**
 * 백엔드가 실패 응답을 어떤 필드명으로 내려주는지(message/error/msg 등)
 * 매번 확인하지 않아도 되도록, 흔히 쓰는 필드명들을 순서대로 시도해보고
 * 하나도 없으면 기본 문구를 반환합니다.
 *
 * - axios 에러의 경우: getErrorMessage(error.response?.data, fallback)
 * - HTTP 200 + { success: false, ... } 형태의 실패 응답의 경우: getErrorMessage(result, fallback)
 */
export const getErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== "object") return fallback;

  const candidates = ["message", "error", "msg", "errorMessage", "detail"] as const;

  for (const key of candidates) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return formatValidationMessage(value);
    }
  }

  return fallback;
};

// 백엔드가 "입력값 검증 실패: [email: 올바른 이메일 형식이 아닙니다.]" 같은
// 개발자용 raw 포맷으로 메시지를 내려줄 때, "필드명:" 같은 내부 구현 디테일은
// 걷어내고 사람이 읽을 문장만 뽑아서 보여줍니다. 이 패턴이 아니면 원본 그대로 반환합니다.
const VALIDATION_PREFIX_PATTERN = /^입력값\s*검증\s*실패:\s*\[(.+)\]$/;

const formatValidationMessage = (raw: string): string => {
  const match = raw.match(VALIDATION_PREFIX_PATTERN);
  if (!match) return raw;

  // "email: 메시지1, password: 메시지2"처럼 필드가 여러 개 섞여 있어도
  // "다음 필드명:" 앞에서만 끊어서 필드별 메시지만 추출합니다.
  const messages = match[1]
    .split(/,\s*(?=[a-zA-Z0-9_]+:\s)/)
    .map((entry) => entry.replace(/^[a-zA-Z0-9_]+:\s*/, "").trim())
    .filter(Boolean);

  return messages.length > 0 ? messages.join("\n") : raw;
};
