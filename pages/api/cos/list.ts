import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, withMethods } from '../../../lib/middleware/auth';
import { getCOSService } from '../../../lib/services/cos';
import { ApiResponse, ImageFile } from '../../../types';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<ImageFile[]>>) {
  try {
    const { prefix = '', maxKeys = 1000 } = req.query;
    
    const cosService = getCOSService();
    const images = await cosService.listImages(
      prefix as string,
      parseInt(maxKeys as string)
    );

    return res.status(200).json({
      success: true,
      data: images,
      total: images.length,
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : '获取文件列表失败'
    });
  }
}

export default withMethods(['GET'])(withAuth(handler)); 