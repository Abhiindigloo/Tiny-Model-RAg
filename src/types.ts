export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
