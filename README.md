# COS 图床管理系统

基于 Next.js 和腾讯云 COS 的图床管理面板，提供安全、便捷的图片存储和管理功能。

## ✨ 功能特性

- 🔐 **安全验证** - 初始化时设置密码，支持密码修改
- 📱 **响应式设计** - 支持桌面端和移动端访问
- ⚡ **快速上传** - 支持图片文件拖拽和点击上传
- 🖼️ **图片管理** - 图片列表、预览、删除、重命名功能
- 📋 **一键复制** - 快速复制图片链接到剪贴板
- ✏️ **文件重命名** - 支持在线重命名图片文件
- 🌐 **自定义域名** - 支持配置自定义域名，灵活切换访问方式
- ⚙️ **Web配置** - 所有配置通过Web界面管理，无需修改代码
- 🎨 **现代 UI** - 基于 Tailwind CSS 的美观界面

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm/yarn
- 腾讯云 COS 存储桶

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动项目

```bash
# 开发环境
pnpm dev

# 生产环境
pnpm build
pnpm start
```

### 4. 初始化设置

首次访问系统时，会自动跳转到初始化页面 `/setup`，需要配置：

1. **登录密码**：设置系统登录密码（至少6位）
2. **腾讯云 COS 配置**：
   - Secret ID：腾讯云 API 密钥 ID
   - Secret Key：腾讯云 API 密钥
   - 存储桶名称：COS 存储桶名称
   - 地域：存储桶所在地域
3. **自定义域名**（可选）：如果有自定义域名，可以配置

### 5. 获取腾讯云 COS 配置

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 [对象存储 COS](https://console.cloud.tencent.com/cos5)
3. 创建存储桶或使用现有存储桶
4. 在 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 获取 SecretId 和 SecretKey

## ⚙️ 配置管理

系统启动后，所有配置都可以通过Web界面管理：

### 登录系统
- 使用初始化时设置的密码登录
- 登录后可在设置中修改密码

### 系统设置
在主界面点击设置按钮，可以管理：

1. **域名设置**
   - 启用/禁用自定义域名
   - 配置自定义域名

2. **COS 存储配置**
   - 修改 Secret ID 和 Secret Key
   - 更改存储桶和地域设置

3. **密码设置**
   - 修改登录密码
   - 需要验证当前密码

## 📁 项目结构

```
├── pages/
│   ├── api/
│   │   ├── setup/
│   │   │   ├── check.ts          # 检查初始化状态
│   │   │   └── initialize.ts     # 初始化配置
│   │   ├── cos/
│   │   │   ├── upload.ts         # 上传图片
│   │   │   ├── list.ts           # 获取图片列表
│   │   │   ├── delete.ts         # 删除图片
│   │   │   └── rename.ts         # 重命名图片
│   │   ├── login.ts              # 登录接口
│   │   ├── logout.ts             # 登出接口
│   │   └── settings.ts           # 系统设置接口
│   ├── setup.tsx                 # 初始化设置页面
│   ├── index.tsx                 # 主页面 (图床管理界面)
│   └── login.tsx                 # 登录页面
├── components/                   # React 组件
├── styles/                       # 样式文件
├── settings.json                 # 系统配置文件
└── README.md                     # 项目说明
```

## 🔒 安全说明

- 使用 bcrypt 进行密码加密存储
- JWT 身份验证，token 存储在 HTTP-only cookie 中
- 所有 API 接口都需要验证用户身份
- 敏感配置信息存储在服务器本地
- 支持密码修改，需要验证当前密码

## 🔧 部署说明

### 开发环境
```bash
pnpm dev
```

### 生产环境
```bash
pnpm build
pnpm start
```

### 使用 PM2 部署
```bash
npm install -g pm2
pnpm build
pm2 start "pnpm start" --name cos-image-manager
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## ⚠️ 注意事项

1. **存储桶权限**: 确保您的腾讯云 COS 存储桶允许读写操作
2. **跨域配置**: 如果需要从其他域名访问图片，请配置 COS 的跨域设置
3. **备份**: 建议定期备份重要图片和 `settings.json` 配置文件
4. **安全**: 请使用强密码，定期更换密码
5. **初始化**: 首次部署需要通过 `/setup` 页面进行初始化设置

## 🆕 更新说明

### v2.0 主要更新
- ✅ 移除对环境变量的依赖
- ✅ 新增 Web 界面初始化流程
- ✅ 支持在线修改 COS 配置
- ✅ 支持在线修改登录密码
- ✅ 使用 bcrypt 加密密码存储
- ✅ 优化设置界面，分类管理配置项
- ✅ 自动初始化检查和跳转

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📄 许可证

MIT License

## 🔗 相关链接

- [腾讯云 COS 官方文档](https://cloud.tencent.com/document/product/436)
- [腾讯云 COS Node.js SDK](https://github.com/tencentyun/cos-nodejs-sdk-v5)
- [Next.js 官方文档](https://nextjs.org/docs)
