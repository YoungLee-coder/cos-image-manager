import COS from 'cos-nodejs-sdk-v5';
import { readSettings, validateCosConfig } from '../config/settings';
import { ImageFile, AppSettings } from '../../types';

/**
 * COS服务类
 */
export class COSService {
  private cos: COS;
  private settings: AppSettings;

  constructor() {
    this.settings = readSettings();
    
    if (!validateCosConfig(this.settings.cosConfig)) {
      throw new Error('COS配置不完整');
    }

    this.cos = new COS({
      SecretId: this.settings.cosConfig.secretId,
      SecretKey: this.settings.cosConfig.secretKey,
    });
  }

  /**
   * 获取基础URL
   */
  private getBaseUrl(): string {
    const { customDomain, useCustomDomain, cosConfig } = this.settings;
    
    return useCustomDomain && customDomain
      ? `https://${customDomain}`
      : `https://${cosConfig.bucket}.cos.${cosConfig.region}.myqcloud.com`;
  }

  /**
   * 获取图片列表
   */
  async listImages(prefix = '', maxKeys = 1000): Promise<ImageFile[]> {
    const result = await this.cos.getBucket({
      Bucket: this.settings.cosConfig.bucket,
      Region: this.settings.cosConfig.region,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    // 过滤图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const images = result.Contents?.filter(item => {
      const extension = item.Key?.toLowerCase().split('.').pop();
      return extension && imageExtensions.includes('.' + extension);
    }) || [];

    const baseUrl = this.getBaseUrl();

    // 格式化响应数据
    return images.map(item => ({
      key: item.Key!,
      url: `${baseUrl}/${item.Key}`,
      size: Number(item.Size!),
      lastModified: item.LastModified!,
      etag: item.ETag?.replace(/"/g, '') || '',
    }));
  }

  /**
   * 上传文件
   */
  async uploadFile(key: string, body: Buffer): Promise<string> {
    await this.cos.putObject({
      Bucket: this.settings.cosConfig.bucket,
      Region: this.settings.cosConfig.region,
      Key: key,
      Body: body,
    });

    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/${key}`;
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<void> {
    await this.cos.deleteObject({
      Bucket: this.settings.cosConfig.bucket,
      Region: this.settings.cosConfig.region,
      Key: key,
    });
  }

  /**
   * 重命名文件（复制+删除）
   */
  async renameFile(oldKey: string, newKey: string): Promise<void> {
    // 复制文件
    await this.cos.putObjectCopy({
      Bucket: this.settings.cosConfig.bucket,
      Region: this.settings.cosConfig.region,
      Key: newKey,
      CopySource: `${this.settings.cosConfig.bucket}.cos.${this.settings.cosConfig.region}.myqcloud.com/${oldKey}`,
    });

    // 删除原文件
    await this.deleteFile(oldKey);
  }

  /**
   * 生成缩略图URL
   */
  generateThumbnailUrl(originalUrl: string, size = 200): string {
    return `${originalUrl}?imageMogr2/thumbnail/!${size}x${size}r/gravity/center/crop/${size}x${size}`;
  }
}

/**
 * 获取COS服务实例
 */
export function getCOSService(): COSService {
  return new COSService();
} 