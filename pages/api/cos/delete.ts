import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, withMethods } from '../../../lib/middleware/auth';
import { getCOSService } from '../../../lib/services/cos';
import { ApiResponse } from '../../../types';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: '缺少文件键名'
      });
    }

    const cosService = getCOSService();
    await cosService.deleteFile(key);

    return res.status(200).json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : '删除文件失败'
    });
  }
}

export default withMethods(['DELETE'])(withAuth(handler)); 