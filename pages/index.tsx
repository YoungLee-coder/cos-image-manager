import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Upload, Trash2, Copy, LogOut, RefreshCw, Image as ImageIcon, Edit3, Settings, Save, X, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageFile {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  etag: string;
}

interface Settings {
  customDomain: string;
  useCustomDomain: boolean;
}

type ViewMode = 'grid' | 'list';

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({ customDomain: '', useCustomDomain: false });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 检查登录状态并加载图片
  useEffect(() => {
    const initApp = async () => {
      await checkAuthAndLoadImages();
      await loadSettings();
    };
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndLoadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cos/list');
      if (response.ok) {
        const data = await response.json();
        setImages(data.data || []);
      } else if (response.status === 401) {
        router.push('/login');
        return;
      } else {
        showMessage('获取图片列表失败', 'error');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      showMessage('网络错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showMessage('请选择图片文件上传', 'error');
      return;
    }

    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showMessage('文件大小不能超过 10MB', 'error');
      return;
    }

    setUploading(true);
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
        // 重新加载图片列表
        checkAuthAndLoadImages();
      } else {
        showMessage(data.message || '上传失败', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('上传失败', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (key: string) => {
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
        setImages(images.filter(img => img.key !== key));
      } else {
        showMessage(data.message || '删除失败', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('删除失败', 'error');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showMessage('链接已复制到剪贴板', 'success');
    } catch {
      showMessage('复制失败', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      // 忽略登出错误，直接跳转到登录页
      router.push('/login');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch {
      // 忽略错误，使用默认设置
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('设置保存成功', 'success');
        setShowSettings(false);
        // 重新加载图片列表以应用新的域名设置
        checkAuthAndLoadImages();
      } else {
        showMessage(data.message || '设置保存失败', 'error');
      }
    } catch {
      showMessage('保存设置失败', 'error');
    }
  };

  const handleRename = async (oldKey: string, newKey: string) => {
    if (!newKey.trim() || newKey === oldKey) {
      setEditingKey(null);
      return;
    }

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
        setEditingKey(null);
        // 重新加载图片列表
        checkAuthAndLoadImages();
      } else {
        showMessage(data.message || '重命名失败', 'error');
      }
    } catch {
      showMessage('重命名失败', 'error');
    }
  };

  const startEdit = (key: string) => {
    setEditingKey(key);
    setNewFileName(key);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setNewFileName('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 生成缩略图URL - 使用腾讯云COS图片处理
  const getThumbnailUrl = (originalUrl: string, size: number = 200) => {
    // 腾讯云COS图片处理参数：
    // imageMogr2/thumbnail/!{size}x{size}r/gravity/center/crop/{size}x{size}
    // 这将生成指定尺寸的方形缩略图，大大减少流量
    return `${originalUrl}?imageMogr2/thumbnail/!${size}x${size}r/gravity/center/crop/${size}x${size}`;
  };



  const openPreview = (image: ImageFile) => {
    setPreviewImage(image);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  const navigatePreview = useCallback((direction: 'prev' | 'next') => {
    if (!previewImage) return;
    
    const currentIndex = images.findIndex(img => img.key === previewImage.key);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }
    
    setPreviewImage(images[newIndex]);
  }, [previewImage, images]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showPreview) return;
      
      switch (event.key) {
        case 'Escape':
          closePreview();
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
  }, [showPreview, previewImage, images, navigatePreview]);

  return (
    <>
      <Head>
        <title>COS 图床管理</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* 头部导航 */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <ImageIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">COS 图床管理</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={checkAuthAndLoadImages}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  设置
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 消息提示 */}
        {message && (
          <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 上传区域 */}
          <div className="px-4 py-6 sm:px-0">
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
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                {uploading && (
                  <div className="mt-4">
                    <div className="text-sm text-blue-600">上传中...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 图片列表 */}
          <div className="px-4 sm:px-0">
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
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 text-sm font-medium ${
                        viewMode === 'grid'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-500 hover:text-gray-700'
                      } rounded-l-md border-r border-gray-300`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
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
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="mt-2 text-sm text-gray-500">加载中...</div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 text-sm text-gray-500">暂无图片</div>
                </div>
              ) : viewMode === 'grid' ? (
                // 网格视图 (缩略图模式)
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <div key={image.key} className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div 
                        className="aspect-square relative overflow-hidden rounded-t-lg cursor-pointer"
                        onClick={() => openPreview(image)}
                      >
                        <Image
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                          src={getThumbnailUrl(image.url, 300)}
                          alt={image.key}
                          fill
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                      
                      {/* 文件信息 */}
                      <div className="p-2">
                        {editingKey === image.key ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              className="text-xs font-medium text-gray-900 border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleRename(image.key, newFileName);
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleRename(image.key, newFileName)}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-gray-900 truncate" title={image.key}>
                            {image.key}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatFileSize(image.size)}
                        </div>
                      </div>

                      {/* 操作按钮 - 悬停时显示 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => copyToClipboard(image.url)}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm border border-gray-200"
                            title="复制链接"
                          >
                            <Copy className="h-3 w-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => startEdit(image.key)}
                            disabled={editingKey !== null}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="重命名"
                          >
                            <Edit3 className="h-3 w-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(image.key)}
                            disabled={editingKey !== null}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="删除"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 列表视图
                <ul className="divide-y divide-gray-200">
                  {images.map((image) => (
                    <li key={image.key} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 cursor-pointer"
                            onClick={() => openPreview(image)}
                          >
                            <Image
                              className="h-20 w-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
                              src={getThumbnailUrl(image.url, 160)}
                              alt={image.key}
                              width={80}
                              height={80}
                                                              loading="lazy"
                                unoptimized
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            {editingKey === image.key ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRename(image.key, newFileName);
                                    } else if (e.key === 'Escape') {
                                      cancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRename(image.key, newFileName)}
                                  className="p-1 text-green-600 hover:text-green-800"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {image.key}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                            </div>
                            <div className="text-xs text-gray-400 font-mono truncate max-w-md">
                              {image.url}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(image.url)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            复制链接
                          </button>
                          <button
                            onClick={() => startEdit(image.key)}
                            disabled={editingKey !== null}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            重命名
                          </button>
                          <button
                            onClick={() => handleDelete(image.key)}
                            disabled={editingKey !== null}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            删除
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>

        {/* 设置弹窗 */}
        {showSettings && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">系统设置</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.useCustomDomain}
                        onChange={(e) => setSettings({ ...settings, useCustomDomain: e.target.checked })}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">使用自定义域名</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      启用后将使用自定义域名生成图片链接，否则使用腾讯云默认域名
                    </p>
                  </div>

                  {settings.useCustomDomain && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        自定义域名
                      </label>
                      <input
                        type="text"
                        value={settings.customDomain}
                        onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
                        placeholder="例如：img.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        请输入已绑定到 COS 存储桶的自定义域名（不包含 https://）
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      保存设置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 图片预览模态框 */}
        {showPreview && previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            {/* 关闭按钮 */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-60 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            {/* 导航按钮 - 上一张 */}
            {images.length > 1 && (
              <button
                onClick={() => navigatePreview('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {/* 导航按钮 - 下一张 */}
            {images.length > 1 && (
              <button
                onClick={() => navigatePreview('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* 图片容器 */}
            <div className="relative max-w-full max-h-full p-4">
              <div className="relative max-w-screen-lg max-h-screen">
                <Image
                  src={previewImage.url}
                  alt={previewImage.key}
                  className="max-w-full max-h-full object-contain"
                  width={1200}
                  height={800}
                  unoptimized
                />
              </div>
              
              {/* 图片信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 rounded-b-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium truncate">{previewImage.key}</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {formatFileSize(previewImage.size)} • {formatDate(previewImage.lastModified)}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(previewImage.url)}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
                    >
                      复制链接
                    </button>
                    <button
                      onClick={() => {
                        startEdit(previewImage.key);
                        closePreview();
                      }}
                      disabled={editingKey !== null}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      重命名
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(previewImage.key);
                        closePreview();
                      }}
                      disabled={editingKey !== null}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 点击背景关闭 */}
            <div 
              className="absolute inset-0 -z-10"
              onClick={closePreview}
            />
          </div>
        )}
      </div>
    </>
  );
}
