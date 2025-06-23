import { NextApiRequest, NextApiResponse } from 'next';
import COS from 'cos-nodejs-sdk-v5';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
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

// 配置文件上传处理
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '仅支持 POST 请求' });
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

    // 解析表单数据
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 最大 10MB
      filter: (part) => {
        // 只允许图片文件
        return Boolean(part.mimetype && part.mimetype.includes('image'));
      }
    });

    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ message: '未选择文件' });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'unknown';
    const extension = path.extname(originalName);
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}${extension}`;
    
    // 读取文件内容
    const fileContent = fs.readFileSync(file.filepath);

    // 上传到 COS
    await cos.putObject({
      Bucket: settings.cosConfig.bucket,
      Region: settings.cosConfig.region,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype || 'application/octet-stream',
    });

    // 生成访问URL
    const baseUrl = settings.useCustomDomain && settings.customDomain
      ? `https://${settings.customDomain}`
      : `https://${settings.cosConfig.bucket}.cos.${settings.cosConfig.region}.myqcloud.com`;
    const url = `${baseUrl}/${fileName}`;

    // 清理临时文件
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: '上传成功',
      data: {
        key: fileName,
        url: url,
        size: file.size,
        originalName: originalName,
      },
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    return res.status(500).json({ 
      success: false,
      message: '文件上传失败' 
    });
  }
} 