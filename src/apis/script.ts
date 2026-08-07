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

export function createScript(
  params: CreateScriptParams
): Promise<ScriptResponse> {
  const formData = new FormData();

  if (params.file) {
    formData.append("file", params.file);
  }

  const request = {
    topic: params.title,
    duration: params.duration,
    tone: params.style,
    guideline: params.guideline ?? "",
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(request)], {
      type: "application/json",
    })
  );

  return apiFetch<ScriptResponse>("/api/presentations", {
    method: "POST",
    body: formData,
  });
}