import { NextApiRequest, NextApiResponse } from 'next';
import COS from 'cos-nodejs-sdk-v5';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { decryptSensitiveConfig } from '../../../lib/encryption';

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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: '仅支持 DELETE 请求' });
  }

  // 验证用户身份
  if (!verifyAuth(req)) {
    return res.status(401).json({ message: '未授权访问' });
  }

  try {
    const rawSettings = readSettings();
    const settings = decryptSensitiveConfig(rawSettings, rawSettings.jwtSecret);
    
    // 检查COS配置
    if (!settings.cosConfig?.secretId || !settings.cosConfig?.secretKey || !settings.cosConfig?.bucket) {
      return res.status(500).json({ message: 'COS配置不完整，请在设置中配置' });
    }

    // 创建 COS 实例
    const cos = new COS({
      SecretId: settings.cosConfig.secretId,
      SecretKey: settings.cosConfig.secretKey,
    });

    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: '缺少文件键名' });
    }

    // 从 COS 删除文件
    await cos.deleteObject({
      Bucket: settings.cosConfig.bucket,
      Region: settings.cosConfig.region,
      Key: key,
    });

    return res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('文件删除失败:', error);
    return res.status(500).json({ 
      success: false,
      message: '文件删除失败' 
    });
  }
} 