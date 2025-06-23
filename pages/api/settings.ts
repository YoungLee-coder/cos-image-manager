import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withAuth, withMethods } from '../../lib/middleware/auth';
import { readSettings, saveSettings } from '../../lib/config/settings';
import { encryptSensitiveConfig } from '../../lib/encryption';
import { ApiResponse } from '../../types';

async function getHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const settings = readSettings();
    
    // 获取设置（不返回敏感信息）
    const safeSettings = {
      customDomain: settings.customDomain,
      useCustomDomain: settings.useCustomDomain,
      cosConfig: {
        secretId: settings.cosConfig?.secretId ? '***已配置***' : '',
        secretKey: settings.cosConfig?.secretKey ? '***已配置***' : '',
        bucket: settings.cosConfig?.bucket || '',
        region: settings.cosConfig?.region || 'ap-guangzhou'
      }
    };
    
    return res.status(200).json({
      success: true,
      data: safeSettings,
    });
  } catch (error) {
    console.error('获取设置失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取设置失败'
    });
  }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { customDomain, useCustomDomain, cosConfig, currentPassword, newPassword } = req.body;
    
    const settings = readSettings();
    const updatedSettings = { ...settings };

    // 更新域名设置
    if (customDomain !== undefined || useCustomDomain !== undefined) {
      updatedSettings.customDomain = customDomain || '';
      updatedSettings.useCustomDomain = Boolean(useCustomDomain);
    }

    // 更新COS配置
    if (cosConfig) {
      updatedSettings.cosConfig = {
        ...updatedSettings.cosConfig,
        ...cosConfig
      };
    }

    // 更新密码
    if (currentPassword && newPassword) {
      // 验证当前密码
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, settings.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误',
        });
      }

      // 验证新密码长度
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新密码长度至少需要6位',
        });
      }

      // 加密新密码
      updatedSettings.password = await bcrypt.hash(newPassword, 10);
    }

    // 加密敏感信息后保存
    const encryptedSettings = encryptSensitiveConfig(updatedSettings, updatedSettings.jwtSecret);
    
    saveSettings(encryptedSettings);
    
    return res.status(200).json({
      success: true,
      message: '设置保存成功',
    });
  } catch (error) {
    console.error('更新设置失败:', error);
    return res.status(500).json({
      success: false,
      message: '设置更新失败',
    });
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  }
}

export default withMethods(['GET', 'POST'])(withAuth(handler)); 