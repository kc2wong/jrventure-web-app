export type MessageType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  type: MessageType;
  text: string;
}
