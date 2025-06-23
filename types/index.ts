// 应用配置相关类型
export interface COSConfig {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export interface AppSettings {
  customDomain: string;
  useCustomDomain: boolean;
  password: string;
  jwtSecret: string;
  cosConfig: COSConfig;
  isInitialized: boolean;
}

// 图片文件相关类型
export interface ImageFile {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  etag: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

// 表单数据类型
export interface LoginForm {
  password: string;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsForm {
  customDomain: string;
  useCustomDomain: boolean;
  cosConfig?: COSConfig;
  currentPassword?: string;
  newPassword?: string;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// UI相关类型
export type ViewMode = 'grid' | 'list';
export type MessageType = 'success' | 'error';

export interface Message {
  text: string;
  type: MessageType;
}

// 用户认证相关类型
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 上传相关类型
export interface UploadState {
  isUploading: boolean;
  progress?: number;
} 