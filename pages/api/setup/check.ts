import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '仅支持 GET 请求' });
  }

  try {
    const settings = readSettings();
    
    return res.status(200).json({
      success: true,
      isInitialized: settings.isInitialized || false,
    });
  } catch (error) {
    console.error('检查初始化状态失败:', error);
    return res.status(500).json({ 
      success: false,
      message: '检查初始化状态失败' 
    });
  }
} 