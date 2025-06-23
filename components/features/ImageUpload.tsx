import React from 'react';
import { Upload } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

interface ImageUploadProps {
  onUploadSuccess?: () => void;
}

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const { uploadState, fileInputRef, handleFileSelect } = useUpload({
    onUploadSuccess,
  });

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              点击选择图片文件上传
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              支持 JPG、PNG、GIF、WebP 等格式，最大 10MB
            </span>
          </label>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploadState.isUploading}
          />
        </div>
        {uploadState.isUploading && (
          <div className="mt-4">
            <div className="text-sm text-blue-600">上传中...</div>
          </div>
        )}
      </div>
    </div>
  );
} 