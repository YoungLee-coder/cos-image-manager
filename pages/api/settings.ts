import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { decryptSensitiveConfig, encryptSensitiveConfig } from '../../lib/encryption';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// 读取设置
function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取设置失败:', error);
  }
  
  return {
    customDomain: '',
    useCustomDomain: false,
    password: 'admin123',
    jwtSecret: 'your-jwt-secret-key-here',
    cosConfig: {
      secretId: '',
      secretKey: '',
      bucket: '',
      region: 'ap-guangzhou'
    },
    isInitialized: false
  };
}

// 保存设置
function saveSettings(settings: unknown) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('保存设置失败:', error);
    return false;
  }
}

// 中间件：验证用户是否已登录
function verifyAuth(req: NextApiRequest): boolean {
  const token = req.cookies['auth-token'];
  if (!token) return false;

  try {
    const settings = readSettings();
    jwt.verify(token, settings.jwtSecret);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 验证用户身份
  if (!verifyAuth(req)) {
    return res.status(401).json({ message: '未授权访问' });
  }

  const rawSettings = readSettings();
  const settings = decryptSensitiveConfig(rawSettings, rawSettings.jwtSecret);

  if (req.method === 'GET') {
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
  } 
  
  if (req.method === 'POST') {
    // 更新设置
    try {
      const { customDomain, useCustomDomain, cosConfig, currentPassword, newPassword } = req.body;
      
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
      
      if (saveSettings(encryptedSettings)) {
        return res.status(200).json({
          success: true,
          message: '设置保存成功',
        });
      } else {
        return res.status(500).json({
          success: false,
          message: '设置保存失败',
        });
      }
    } catch (error) {
      console.error('更新设置失败:', error);
      return res.status(500).json({
        success: false,
        message: '设置更新失败',
      });
    }
  }

  return res.status(405).json({ message: '不支持的请求方法' });
} 