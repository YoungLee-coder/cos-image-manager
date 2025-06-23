import { useCallback } from 'react';
import { useMessage } from './useMessage';

export function useClipboard() {
  const { showMessage } = useMessage();

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('链接已复制到剪贴板', 'success');
    } catch (error) {
      console.error('复制失败:', error);
      showMessage('复制失败', 'error');
    }
  }, [showMessage]);

  return { copyToClipboard };
} 