import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { withAuth, withMethods } from '../../../lib/middleware/auth';
import { getCOSService } from '../../../lib/services/cos';
import { generateUniqueFileName, isSupportedImageFormat } from '../../../lib/utils/file';
import { ApiResponse } from '../../../types';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<{ url: string }>>) {
  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: '未选择文件'
      });
    }

    // 检查文件类型
    if (!isSupportedImageFormat(file.originalFilename || '')) {
      return res.status(400).json({
        success: false,
        message: '不支持的文件格式'
      });
    }

    // 生成唯一文件名
    const uniqueFileName = generateUniqueFileName(file.originalFilename || 'image.jpg');

    // 读取文件内容
    const fileBuffer = await fs.readFile(file.filepath);

    // 上传到COS
    const cosService = getCOSService();
    const url = await cosService.uploadFile(uniqueFileName, fileBuffer);

    // 清理临时文件
    await fs.unlink(file.filepath);

    return res.status(200).json({
      success: true,
      message: '上传成功',
      data: { url }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '文件上传失败'
    });
  }
}

export default withMethods(['POST'])(withAuth(handler)); 