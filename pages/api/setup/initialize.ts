import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { encryptSensitiveConfig } from '../../../lib/encryption';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// 生成随机的JWT密钥
function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '仅支持 POST 请求' });
  }

  try {
    const { password, cosConfig, customDomain, useCustomDomain } = req.body;

    // 验证必要参数
    if (!password || !cosConfig || !cosConfig.secretId || !cosConfig.secretKey || !cosConfig.bucket) {
      return res.status(400).json({ 
        success: false,
        message: '缺少必要的配置参数' 
      });
    }

    // 检查是否已经初始化
    const currentSettings = readSettings();
    if (currentSettings.isInitialized) {
      return res.status(400).json({ 
        success: false,
        message: '系统已经初始化，无法重复初始化' 
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成JWT密钥
    const jwtSecret = generateJWTSecret();

    // 构建新的设置
    const rawSettings = {
      customDomain: customDomain || '',
      useCustomDomain: Boolean(useCustomDomain),
      password: hashedPassword,
      jwtSecret: jwtSecret,
      cosConfig: {
        secretId: cosConfig.secretId,
        secretKey: cosConfig.secretKey,
        bucket: cosConfig.bucket,
        region: cosConfig.region || 'ap-guangzhou'
      },
      isInitialized: true
    };

    // 加密敏感信息后保存
    const encryptedSettings = encryptSensitiveConfig(rawSettings, jwtSecret);
    
    // 保存设置
    if (saveSettings(encryptedSettings)) {
      return res.status(200).json({
        success: true,
        message: '初始化完成',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '保存配置失败',
      });
    }
  } catch (error) {
    console.error('初始化失败:', error);
    return res.status(500).json({
      success: false,
      message: '初始化失败',
    });
  }
} 