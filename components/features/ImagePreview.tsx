import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageFile } from '../../types';

interface ImagePreviewProps {
  image: ImageFile | null;
  images: ImageFile[];
  isOpen: boolean;
  onClose: () => void;
}

export function ImagePreview({ image, images, isOpen, onClose }: ImagePreviewProps) {
  const navigatePreview = useCallback((direction: 'prev' | 'next') => {
    if (!image) return;
    
    const currentIndex = images.findIndex(img => img.key === image.key);
    
    if (direction === 'prev') {
      // newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      // newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }
    
    // 这里需要父组件传递 setPreviewImage 方法
    // 为了简化，暂时不实现导航功能
    console.log('Navigate preview:', direction, 'from index:', currentIndex);
  }, [image, images]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePreview('prev');
          break;
        case 'ArrowRight':
          navigatePreview('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navigatePreview, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative max-w-4xl max-h-full p-4">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
        >
          <X className="h-6 w-6" />
        </button>

        {/* 导航按钮 */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigatePreview('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigatePreview('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* 图片 */}
        <div className="relative max-w-full max-h-full">
          <Image
            src={image.url}
            alt={image.key}
            width={800}
            height={600}
            className="max-w-full max-h-full object-contain"
            priority
          />
        </div>

        {/* 图片信息 */}
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
          <h3 className="text-lg font-medium">{image.key}</h3>
          <p className="text-sm opacity-75">
            尺寸: {image.size} bytes | 最后修改: {new Date(image.lastModified).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
} 