import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// 中间件：验证用户是否已登录
function verifyAuth(req: NextApiRequest): boolean {
  const token = req.cookies['auth-token'];
  if (!token) return false;

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
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
  
  // 返回默认设置
  return {
    customDomain: '',
    useCustomDomain: false,
  };
}

// 保存设置
function saveSettings(settings: { customDomain: string; useCustomDomain: boolean }) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('保存设置失败:', error);
    return false;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 验证用户身份
  if (!verifyAuth(req)) {
    return res.status(401).json({ message: '未授权访问' });
  }

  if (req.method === 'GET') {
    // 获取设置
    const settings = readSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } 
  
  if (req.method === 'POST') {
    // 更新设置
    try {
      const { customDomain, useCustomDomain } = req.body;
      
      const settings = {
        customDomain: customDomain || '',
        useCustomDomain: Boolean(useCustomDomain),
      };

      if (saveSettings(settings)) {
        return res.status(200).json({
          success: true,
          message: '设置保存成功',
          data: settings,
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