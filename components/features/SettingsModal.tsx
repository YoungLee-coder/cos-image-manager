import React, { useState, useEffect } from 'react';
import { X, Settings, Globe, Key, Database, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { PasswordChangeForm } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
}

type TabType = 'domain' | 'cos' | 'password';

export function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const { settings, loading, loadSettings, saveSettings, setSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('domain');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCosSection, setShowCosSection] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  // 密码表单状态
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 地域选项
  const regions = [
    { value: 'ap-beijing', label: '北京' },
    { value: 'ap-shanghai', label: '上海' },
    { value: 'ap-guangzhou', label: '广州' },
    { value: 'ap-chengdu', label: '成都' },
    { value: 'ap-nanjing', label: '南京' },
    { value: 'ap-hongkong', label: '香港' },
    { value: 'ap-singapore', label: '新加坡' },
    { value: 'ap-tokyo', label: '东京' },
    { value: 'na-siliconvalley', label: '硅谷' },
    { value: 'na-toronto', label: '多伦多' },
    { value: 'eu-frankfurt', label: '法兰克福' }
  ];

  // 加载设置
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  // 关闭时重置状态
  const handleClose = () => {
    setShowPasswordSection(false);
    setShowCosSection(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    onClose();
  };

  // 保存设置
  const handleSave = async () => {
    // 验证密码更改
    if (showPasswordSection && (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword)) {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        alert('请填写完整的密码信息');
        return;
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('新密码与确认密码不一致');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        alert('新密码长度至少需要6位');
        return;
      }
    }

    const settingsToSave: Record<string, unknown> = {
      customDomain: settings.customDomain,
      useCustomDomain: settings.useCustomDomain,
    };

    // 添加COS配置（如果有更改）
    if (showCosSection) {
      settingsToSave.cosConfig = settings.cosConfig;
    }

    const passwordToSave = showPasswordSection && passwordForm.currentPassword && passwordForm.newPassword
      ? passwordForm
      : undefined;

    const success = await saveSettings(settingsToSave, passwordToSave);
    
    if (success) {
      setShowPasswordSection(false);
      setShowCosSection(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onSettingsChange?.();
      handleClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'domain' as TabType, label: '域名设置', icon: Globe },
    { id: 'cos' as TabType, label: 'COS配置', icon: Database },
    { id: 'password' as TabType, label: '密码设置', icon: Key }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">系统设置</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* 域名设置 */}
              {activeTab === 'domain' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">自定义域名设置</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="useCustomDomain"
                          checked={settings.useCustomDomain}
                          onChange={(e) => setSettings({
                            ...settings,
                            useCustomDomain: e.target.checked
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="useCustomDomain" className="ml-2 block text-sm text-gray-700">
                          启用自定义域名
                        </label>
                      </div>
                      
                      {settings.useCustomDomain && (
                        <div>
                          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                            自定义域名
                          </label>
                          <input
                            type="text"
                            id="customDomain"
                            value={settings.customDomain}
                            onChange={(e) => setSettings({
                              ...settings,
                              customDomain: e.target.value
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="例如：cos.example.com"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            请确保域名已经正确配置了 CNAME 到 COS 存储桶域名
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* COS配置 */}
              {activeTab === 'cos' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">腾讯云 COS 配置</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="showCosSection"
                          checked={showCosSection}
                          onChange={(e) => setShowCosSection(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showCosSection" className="ml-2 block text-sm text-gray-700">
                          修改 COS 配置
                        </label>
                      </div>

                      {showCosSection && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Secret ID
                              </label>
                              <input
                                type="text"
                                value={settings.cosConfig.secretId}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  cosConfig: {
                                    ...settings.cosConfig,
                                    secretId: e.target.value
                                  }
                                })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="腾讯云 API 密钥 ID"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Secret Key
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecretKey ? 'text' : 'password'}
                                  value={settings.cosConfig.secretKey}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    cosConfig: {
                                      ...settings.cosConfig,
                                      secretKey: e.target.value
                                    }
                                  })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="腾讯云 API 密钥"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecretKey(!showSecretKey)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showSecretKey ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                存储桶名称
                              </label>
                              <input
                                type="text"
                                value={settings.cosConfig.bucket}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  cosConfig: {
                                    ...settings.cosConfig,
                                    bucket: e.target.value
                                  }
                                })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="存储桶名称"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                所属地域
                              </label>
                              <select
                                value={settings.cosConfig.region}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  cosConfig: {
                                    ...settings.cosConfig,
                                    region: e.target.value
                                  }
                                })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                {regions.map((region) => (
                                  <option key={region.value} value={region.value}>
                                    {region.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!showCosSection && (
                        <div className="text-sm text-gray-500">
                          <p>当前配置状态：</p>
                          <ul className="mt-2 space-y-1">
                            <li>Secret ID: {settings.cosConfig.secretId || '未配置'}</li>
                            <li>Secret Key: {settings.cosConfig.secretKey || '未配置'}</li>
                            <li>存储桶: {settings.cosConfig.bucket || '未配置'}</li>
                            <li>地域: {regions.find(r => r.value === settings.cosConfig.region)?.label || settings.cosConfig.region}</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 密码设置 */}
              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">修改登录密码</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="showPasswordSection"
                          checked={showPasswordSection}
                          onChange={(e) => setShowPasswordSection(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showPasswordSection" className="ml-2 block text-sm text-gray-700">
                          修改登录密码
                        </label>
                      </div>

                      {showPasswordSection && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              当前密码
                            </label>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                currentPassword: e.target.value
                              })}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="请输入当前密码"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              新密码
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value
                              })}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="请输入新密码（至少6位）"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              确认新密码
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value
                              })}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="请再次输入新密码"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 