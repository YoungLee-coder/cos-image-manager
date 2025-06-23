import { NextApiRequest, NextApiResponse } from 'next';
import { withMethods } from '../../lib/middleware/auth';
import { ApiResponse } from '../../types';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    // 清除认证cookie
    res.setHeader('Set-Cookie', 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
    
    return res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}

export default withMethods(['POST'])(handler); 