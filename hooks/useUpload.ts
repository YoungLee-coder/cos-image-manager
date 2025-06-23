import { useState, useCallback, useRef } from 'react';
import { UploadState } from '../types';
import { useMessage } from './useMessage';
import { isImageFile, validateFileSize } from '../lib/utils/file';

interface UseUploadOptions {
  onUploadSuccess?: () => void;
  maxFileSize?: number;
}

export function useUpload(options: UseUploadOptions = {}) {
  const { onUploadSuccess, maxFileSize = 10 * 1024 * 1024 } = options;
  const [uploadState, setUploadState] = useState<UploadState>({ isUploading: false });
  const { showMessage } = useMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    // 验证文件类型
    if (!isImageFile(file)) {
      showMessage('请选择图片文件上传', 'error');
      return;
    }

    // 验证文件大小
    if (!validateFileSize(file, maxFileSize)) {
      showMessage(`文件大小不能超过 ${Math.round(maxFileSize / 1024 / 1024)}MB`, 'error');
      return;
    }

    setUploadState({ isUploading: true });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/cos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showMessage('上传成功', 'success');
        onUploadSuccess?.();
      } else {
        showMessage(data.message || '上传失败', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('上传失败', 'error');
    } finally {
      setUploadState({ isUploading: false });
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [maxFileSize, onUploadSuccess, showMessage]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    uploadFile(files[0]);
  }, [uploadFile]);

  return {
    uploadState,
    fileInputRef,
    uploadFile,
    handleFileSelect,
  };
} 