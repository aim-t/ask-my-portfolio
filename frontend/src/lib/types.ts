export interface ChatResponse {
  answer: string;
  provider: string;
  sources: string[];
}

export interface ChatErrorResponse {
  detail: string;
}

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  sources?: string[];
  provider?: string;
  isError?: boolean;
}
