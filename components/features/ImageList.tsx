import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Copy, Edit3, Grid3X3, List } from 'lucide-react';
import { ImageFile, ViewMode } from '../../types';
import { formatFileSize, formatDate } from '../../lib/utils/file';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ImageListProps {
  images: ImageFile[];
  loading: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDelete: (key: string) => void;
  onRename: (oldKey: string, newKey: string) => void;
  onCopy: (url: string) => void;
  onPreview?: (image: ImageFile) => void;
}

export function ImageList({
  images,
  loading,
  viewMode,
  onViewModeChange,
  onDelete,
  onRename,
  onCopy,
  onPreview,
}: ImageListProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const startEdit = (key: string) => {
    setEditingKey(key);
    setNewFileName(key);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setNewFileName('');
  };

  const confirmEdit = (oldKey: string) => {
    onRename(oldKey, newFileName);
    setEditingKey(null);
  };

  // 生成缩略图URL
  const getThumbnailUrl = (originalUrl: string, size = 200) => {
    return `${originalUrl}?imageMogr2/thumbnail/!${size}x${size}r/gravity/center/crop/${size}x${size}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            图片列表 ({images.length} 张)
          </h3>
          <p className="text-xs text-green-600 mt-1">
            💡 已启用缩略图优化，大幅减少流量消耗
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1 text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-l-md border-r border-gray-300`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-r-md`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无图片</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
          {images.map((image) => (
            <div key={image.key} className="relative group bg-gray-50 rounded-lg overflow-hidden">
              <div 
                className="aspect-square relative cursor-pointer"
                onClick={() => onPreview?.(image)}
              >
                <Image
                  src={getThumbnailUrl(image.url)}
                  alt={image.key}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all">
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => onCopy(image.url)}
                      className="p-1 bg-white rounded-full hover:bg-gray-100"
                      title="复制链接"
                    >
                      <Copy className="h-3 w-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => startEdit(image.key)}
                      className="p-1 bg-white rounded-full hover:bg-gray-100"
                      title="重命名"
                    >
                      <Edit3 className="h-3 w-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(image.key)}
                      className="p-1 bg-white rounded-full hover:bg-gray-100"
                      title="删除"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {editingKey === image.key && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2">
                  <div className="bg-white rounded-lg p-3 w-full">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-1 mt-2">
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => confirmEdit(image.key)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {images.map((image) => (
            <li key={image.key} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => onPreview?.(image)}
                >
                  <Image
                    src={getThumbnailUrl(image.url, 80)}
                    alt={image.key}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {editingKey === image.key ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => confirmEdit(image.key)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        确定
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900 truncate">{image.key}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onCopy(image.url)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="复制链接"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => startEdit(image.key)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="重命名"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(image.key)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 