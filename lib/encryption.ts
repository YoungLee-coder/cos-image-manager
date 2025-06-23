import crypto from 'crypto';

// 加密算法
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

// 从JWT密钥派生加密密钥
function deriveKey(jwtSecret: string): Buffer {
  return crypto.scryptSync(jwtSecret, 'cos-config-salt', KEY_LENGTH);
}

// 加密函数
export function encrypt(text: string, jwtSecret: string): string {
  try {
    const key = deriveKey(jwtSecret);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 返回格式: iv:encrypted
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
}

// 解密函数
export function decrypt(encryptedData: string, jwtSecret: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('无效的加密数据格式');
    }
    
    const [ivHex, encrypted] = parts;
    const key = deriveKey(jwtSecret);
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
}

// 检查字符串是否为加密格式
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') return false;
  const parts = data.split(':');
  return parts.length === 2 && 
         parts[0].length === IV_LENGTH * 2 && 
         parts[1].length > 0;
}

// 定义配置类型
export interface COSConfig {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export interface AppConfig {
  customDomain: string;
  useCustomDomain: boolean;
  password: string;
  jwtSecret: string;
  cosConfig: COSConfig;
  isInitialized: boolean;
}

// 安全地加密敏感配置
export function encryptSensitiveConfig(config: AppConfig, jwtSecret: string): AppConfig {
  const encrypted = { ...config };
  
  if (config.cosConfig) {
    encrypted.cosConfig = {
      ...config.cosConfig,
      secretId: config.cosConfig.secretId ? encrypt(config.cosConfig.secretId, jwtSecret) : '',
      secretKey: config.cosConfig.secretKey ? encrypt(config.cosConfig.secretKey, jwtSecret) : '',
    };
  }
  
  return encrypted;
}

// 安全地解密敏感配置
export function decryptSensitiveConfig(config: AppConfig, jwtSecret: string): AppConfig {
  const decrypted = { ...config };
  
  if (config.cosConfig) {
    decrypted.cosConfig = {
      ...config.cosConfig,
      secretId: config.cosConfig.secretId && isEncrypted(config.cosConfig.secretId) 
        ? decrypt(config.cosConfig.secretId, jwtSecret) 
        : config.cosConfig.secretId,
      secretKey: config.cosConfig.secretKey && isEncrypted(config.cosConfig.secretKey) 
        ? decrypt(config.cosConfig.secretKey, jwtSecret) 
        : config.cosConfig.secretKey,
    };
  }
  
  return decrypted;
} 