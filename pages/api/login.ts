import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withMethods, withInitialized } from '../../lib/middleware/auth';
import { readRawSettings } from '../../lib/config/settings';
import { ApiResponse } from '../../types';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: '请输入密码'
      });
    }

    const settings = readRawSettings();

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
        success: true,
        message: '登录成功'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}

export default withMethods(['POST'])(withInitialized(handler)); 