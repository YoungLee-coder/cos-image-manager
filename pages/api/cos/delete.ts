import { NextApiRequest, NextApiResponse } from 'next';
import COS from 'cos-nodejs-sdk-v5';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 创建 COS 实例
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: '仅支持 DELETE 请求' });
  }

  // 验证用户身份
  if (!verifyAuth(req)) {
    return res.status(401).json({ message: '未授权访问' });
  }

  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: '缺少文件键名' });
    }

    // 从 COS 删除文件
    await cos.deleteObject({
      Bucket: process.env.COS_BUCKET!,
      Region: process.env.COS_REGION!,
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