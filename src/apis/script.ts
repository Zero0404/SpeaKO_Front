import { apiFetch } from './client';

export interface SlideDto {
  page: number;
  text: string;
}

export interface ScriptResponse {
  scriptId: number;
  slides: SlideDto[];
}

export interface CreateScriptParams {
  file?: File | null;
  guideline?: string;
  title: string;
  duration: number;
  style: 'formal' | 'casual';
}

export function createScript(params: CreateScriptParams) {
  const formData = new FormData();

  if (params.file) {
    formData.append("file", params.file);
  }
  console.log("file =", params.file);
  // 👇 이 부분 추가
  const request = {
    topic: params.title,
    duration: params.duration,
    tone: params.style,
    guideline: params.guideline ?? "",
  };

  console.log("전송할 request =", request);

  formData.append(
    "request",
    new Blob(
      [
        JSON.stringify(request),
      ],
      { type: "application/json" }
    )
  );

  return apiFetch("/api/presentations", {
    method: "POST",
    body: formData,
  });
}