import { useState, useCallback } from 'react';
import { Message, MessageType } from '../types';

export function useMessage() {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback((text: string, type: MessageType = 'success') => {
    setMessage({ text, type });
    
    // 3秒后自动清除消息
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    showMessage,
    clearMessage,
  };
} 