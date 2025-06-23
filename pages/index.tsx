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