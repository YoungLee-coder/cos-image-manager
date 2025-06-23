import fs from 'fs';
import path from 'path';
import { AppSettings } from '../../types';
import { encryptSensitiveConfig, decryptSensitiveConfig } from '../encryption';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// 默认配置
const DEFAULT_SETTINGS: AppSettings = {
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

/**
 * 读取原始设置（未解密）
 */
export function readRawSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('读取设置失败:', error);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * 读取设置（自动解密敏感信息）
 */
export function readSettings(): AppSettings {
  const rawSettings = readRawSettings();
  
  try {
    return decryptSensitiveConfig(rawSettings, rawSettings.jwtSecret);
  } catch (error) {
    console.error('解密设置失败:', error);
    return rawSettings;
  }
}

/**
 * 保存设置（自动加密敏感信息）
 */
export function saveSettings(settings: AppSettings): void {
  try {
    const encryptedSettings = encryptSensitiveConfig(settings, settings.jwtSecret);
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(encryptedSettings, null, 2));
  } catch (error) {
    console.error('保存设置失败:', error);
    throw new Error('保存设置失败');
  }
}

/**
 * 检查系统是否已初始化
 */
export function isSystemInitialized(): boolean {
  const settings = readRawSettings();
  return settings.isInitialized;
}

/**
 * 验证COS配置是否完整
 */
export function validateCosConfig(cosConfig: Partial<AppSettings['cosConfig']>): boolean {
  return !!(
    cosConfig?.secretId &&
    cosConfig?.secretKey &&
    cosConfig?.bucket &&
    cosConfig?.region
  );
} 