import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, withMethods } from '../../../lib/middleware/auth';
import { getCOSService } from '../../../lib/services/cos';
import { ApiResponse } from '../../../types';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { oldKey, newKey } = req.body;

    if (!oldKey || !newKey) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    if (oldKey === newKey) {
      return res.status(400).json({
        success: false,
        message: '新文件名与原文件名相同'
      });
    }

    const cosService = getCOSService();
    await cosService.renameFile(oldKey, newKey);

    return res.status(200).json({
      success: true,
      message: '重命名成功'
    });
  } catch (error) {
    console.error('重命名文件失败:', error);
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : '重命名文件失败'
    });
  }
}

export default withMethods(['PUT'])(withAuth(handler)); 