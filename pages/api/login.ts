import { NextApiRequest, NextApiResponse } from 'next';
// import bcrypt from 'bcryptjs'; // 目前使用简单密码验证，未来可升级为哈希验证
import jwt from 'jsonwebtoken';

const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '仅支持 POST 请求' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: '请输入密码' });
  }

  try {
    // 简单密码验证（实际项目中建议使用哈希密码）
    if (password === LOGIN_PASSWORD) {
      // 生成 JWT token
      const token = jwt.sign(
        { authenticated: true, timestamp: Date.now() },
        JWT_SECRET,
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