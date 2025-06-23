import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { readRawSettings } from '../config/settings';
import { ApiResponse } from '../../types';

/**
 * 验证用户是否已登录
 */
export function verifyAuth(req: NextApiRequest): boolean {
  const token = req.cookies['auth-token'];
  if (!token) return false;

  try {
    const settings = readRawSettings();
    jwt.verify(token, settings.jwtSecret);
    return true;
  } catch {
    return false;
  }
}

/**
 * 认证中间件装饰器
 */
export function withAuth<T = unknown>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    if (!verifyAuth(req)) {
      return res.status(401).json({ 
        success: false, 
        message: '未授权访问' 
      });
    }

    return handler(req, res);
  };
}

/**
 * 方法限制中间件
 */
export function withMethods(allowedMethods: string[]) {
  return function<T = unknown>(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
      if (!allowedMethods.includes(req.method || '')) {
        return res.status(405).json({
          success: false,
          message: `仅支持 ${allowedMethods.join(', ')} 请求`
        });
      }

      return handler(req, res);
    };
  };
}

/**
 * 初始化检查中间件
 */
export function withInitialized<T = unknown>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    const settings = readRawSettings();
    
    if (!settings.isInitialized) {
      return res.status(400).json({
        success: false,
        message: '系统未初始化，请先进行初始化设置',
        data: { redirect: '/setup' } as T
      });
    }

    return handler(req, res);
  };
}

/**
 * 组合中间件
 */
export function withMiddleware(
  middlewares: Array<(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => (req: NextApiRequest, res: NextApiResponse) => Promise<void>>,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return middlewares.reduce((acc, middleware) => middleware(acc), handler);
} 