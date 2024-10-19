export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }
  
export interface ChatResponse {
    response: string;
  }