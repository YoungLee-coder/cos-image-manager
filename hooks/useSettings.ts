import { useState, useCallback } from 'react';
import { AppSettings, PasswordChangeForm } from '../types';
import { useMessage } from './useMessage';

interface SettingsData {
  customDomain: string;
  useCustomDomain: boolean;
  cosConfig: {
    secretId: string;
    secretKey: string;
    bucket: string;
    region: string;
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    customDomain: '',
    useCustomDomain: false,
    cosConfig: {
      secretId: '',
      secretKey: '',
      bucket: '',
      region: 'ap-guangzhou'
    }
  });
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();

  // 加载设置
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        showMessage('加载设置失败', 'error');
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      showMessage('网络错误', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // 保存设置
  const saveSettings = useCallback(async (
    newSettings: Partial<SettingsData>,
    passwordForm?: PasswordChangeForm
  ) => {
    setLoading(true);
    try {
      const requestData: Record<string, unknown> = {
        ...newSettings
      };

      // 添加密码更改（如果有）
      if (passwordForm?.currentPassword && passwordForm?.newPassword) {
        requestData.currentPassword = passwordForm.currentPassword;
        requestData.newPassword = passwordForm.newPassword;
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('设置保存成功', 'success');
        await loadSettings(); // 重新加载设置
        return true;
      } else {
        showMessage(data.message || '设置保存失败', 'error');
        return false;
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      showMessage('保存设置失败', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadSettings, showMessage]);

  return {
    settings,
    loading,
    loadSettings,
    saveSettings,
    setSettings
  };
} 