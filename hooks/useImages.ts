import { useState, useCallback } from 'react';
import { ImageFile } from '../types';
import { useMessage } from './useMessage';

export function useImages() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();

  // 加载图片列表
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cos/list');
      if (response.ok) {
        const data = await response.json();
        setImages(data.data || []);
      } else if (response.status === 401) {
        // 未授权，需要重新登录
        window.location.href = '/login';
      } else {
        showMessage('获取图片列表失败', 'error');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      showMessage('网络错误', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // 删除图片
  const deleteImage = useCallback(async (key: string) => {
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
      const response = await fetch('/api/cos/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('删除成功', 'success');
        setImages(prev => prev.filter(img => img.key !== key));
      } else {
        showMessage(data.message || '删除失败', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('删除失败', 'error');
    }
  }, [showMessage]);

  // 重命名图片
  const renameImage = useCallback(async (oldKey: string, newKey: string) => {
    if (!newKey.trim() || newKey === oldKey) return;

    try {
      const response = await fetch('/api/cos/rename', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldKey, newKey }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('重命名成功', 'success');
        await loadImages(); // 重新加载列表
      } else {
        showMessage(data.message || '重命名失败', 'error');
      }
    } catch (error) {
      console.error('Rename error:', error);
      showMessage('重命名失败', 'error');
    }
  }, [loadImages, showMessage]);

  return {
    images,
    loading,
    loadImages,
    deleteImage,
    renameImage,
  };
} 