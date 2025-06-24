import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Header } from '../components/layout/Header';
import { ImageUpload } from '../components/features/ImageUpload';
import { ImageList } from '../components/features/ImageList';
import { ImagePreview } from '../components/features/ImagePreview';
import { SettingsModal } from '../components/features/SettingsModal';
import { Message } from '../components/ui/Message';
import { useImages } from '../hooks/useImages';
import { useMessage } from '../hooks/useMessage';
import { useClipboard } from '../hooks/useClipboard';
import { useViewMode } from '../hooks/useViewMode';
import { ImageFile } from '../types';

export default function Home() {
  const router = useRouter();
  const { images, loading, loadImages, deleteImage, renameImage } = useImages();
  const { message } = useMessage();
  const { copyToClipboard } = useClipboard();
  const { viewMode, setViewMode } = useViewMode();
  
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [previewRequests, setPreviewRequests] = useState<Array<{key: string, url: string, timestamp: Date}>>([]);

  // 初始化加载
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const openPreview = (image: ImageFile) => {
    console.log('🔍 打开预览:', image.key, '完整图片URL:', image.url);
    
    // 记录预览请求用于调试
    setPreviewRequests(prev => [...prev, {
      key: image.key,
      url: image.url,
      timestamp: new Date()
    }]);
    
    setPreviewImage(image);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  return (
    <>
      <Head>
        <title>COS 图床管理</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* 头部导航 */}
        <Header
          onRefresh={loadImages}
          onShowSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
          loading={loading}
        />

        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
            >
              🔧 调试信息 (已预览 {previewRequests.length} 张图片)
            </button>
            {showDebugInfo && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <h4 className="font-medium text-yellow-800 mb-2">预览记录 (完整图片加载):</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {previewRequests.slice(-10).map((req, index) => (
                    <div key={index} className="text-yellow-700">
                      <span className="text-gray-500">{req.timestamp.toLocaleTimeString()}</span> - 
                      <span className="text-red-600">完整图片</span>: {req.key}
                    </div>
                  ))}
                  {previewRequests.length === 0 && (
                    <div className="text-gray-500">还没有预览任何图片</div>
                  )}
                </div>
                <button
                  onClick={() => setPreviewRequests([])}
                  className="mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                >
                  清空记录
                </button>
                <div className="mt-2 text-xs text-yellow-700">
                  💡 提示：现在只有点击预览时才会加载完整图片，列表中显示的都是缩略图
                </div>
              </div>
            )}
          </div>
        )}

        {/* 消息提示 */}
        {message && (
          <Message message={message} />
        )}

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 上传区域 */}
          <div className="px-4 py-6 sm:px-0">
            <ImageUpload onUploadSuccess={loadImages} />
          </div>

          {/* 图片列表 */}
          <div className="px-4 sm:px-0">
            <ImageList
              images={images}
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onDelete={deleteImage}
              onRename={renameImage}
              onCopy={copyToClipboard}
              onPreview={openPreview}
            />
          </div>
        </main>

        {/* 图片预览 */}
        <ImagePreview
          image={previewImage}
          images={images}
          isOpen={showPreview}
          onClose={closePreview}
        />

        {/* 设置模态框 */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={loadImages}
        />
      </div>
    </>
  );
} 