import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '仅支持 POST 请求' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: '请输入密码' });
  }

  try {
    const rawSettings = readSettings();
    
    // 检查是否已初始化
    if (!rawSettings.isInitialized) {
      return res.status(400).json({ 
        message: '系统未初始化，请先进行初始化设置',
        redirect: '/setup'
      });
    }

    // 注意：解密配置时需要JWT密钥，但密码验证不需要解密敏感配置
    const settings = rawSettings;

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, settings.password);
    
    if (isValidPassword) {
      // 生成 JWT token
      const token = jwt.sign(
        { authenticated: true, timestamp: Date.now() },
        settings.jwtSecret,
        { expiresIn: '24h' }
      );

      // 设置 HTTP-only cookie
      res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);
      
      return res.status(200).json({ 
        message: '登录成功',
        success: true 
      });
    } else {
      return res.status(401).json({ message: '密码错误' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
} 