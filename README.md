# COS 图床管理系统

基于 Next.js 和腾讯云 COS 的图床管理面板，提供安全、便捷的图片存储和管理功能。

## ✨ 功能特性

- 🔐 **安全验证** - 密码登录保护，确保数据安全
- 📱 **响应式设计** - 支持桌面端和移动端访问
- ⚡ **快速上传** - 支持图片文件拖拽和点击上传
- 🖼️ **图片管理** - 图片列表、预览、删除、重命名功能
- 📋 **一键复制** - 快速复制图片链接到剪贴板
- ✏️ **文件重命名** - 支持在线重命名图片文件
- 🌐 **自定义域名** - 支持配置自定义域名，灵活切换访问方式
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

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填入您的配置：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置以下环境变量：

```env
# 腾讯云 COS 配置
COS_SECRET_ID=your_secret_id_here
COS_SECRET_KEY=your_secret_key_here
COS_BUCKET=your_bucket_name_here
COS_REGION=ap-guangzhou

# 登录密码 (请修改为您的密码)
LOGIN_PASSWORD=your_secure_password_here

# JWT 密钥 (用于会话管理，请使用强密码)
JWT_SECRET=your_jwt_secret_key_here

# NextAuth 配置 (可选，用于扩展功能)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. 获取腾讯云 COS 配置

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 [对象存储 COS](https://console.cloud.tencent.com/cos5)
3. 创建存储桶或使用现有存储桶
4. 在 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 获取 SecretId 和 SecretKey

**重要配置说明：**
- `COS_SECRET_ID`: 腾讯云 API 密钥 ID
- `COS_SECRET_KEY`: 腾讯云 API 密钥 Key
- `COS_BUCKET`: 存储桶名称，格式为 `bucket-name-appid`
- `COS_REGION`: 存储桶地域，如 `ap-guangzhou`、`ap-beijing` 等

### 5. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 访问应用。

### 6. 生产部署

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

## 📖 使用说明

### 登录
- 访问网站后会自动跳转到登录页面
- 输入在环境变量中设置的密码进行登录
- 登录状态会保持 24 小时

### 上传图片
- 在主界面点击上传区域选择图片文件
- 支持 JPG、PNG、GIF、WebP、BMP、SVG 格式
- 单个文件最大支持 10MB
- 上传成功后会自动刷新图片列表

### 管理图片
- 查看所有已上传的图片
- 点击"复制链接"按钮将图片URL复制到剪贴板
- 点击"重命名"按钮修改图片文件名
- 点击"删除"按钮删除不需要的图片
- 图片列表会显示文件名、大小、上传时间等信息

### 系统设置
- 点击顶部导航栏的"设置"按钮打开设置面板
- **自定义域名配置**：如果您为 COS 存储桶绑定了自定义域名，可以在设置中启用
- 启用自定义域名后，所有图片链接将使用您的自定义域名生成
- 设置会自动保存到本地文件中

## 🔧 技术栈

- **框架**: Next.js 15
- **前端**: React 19, TypeScript
- **样式**: Tailwind CSS 4
- **云存储**: 腾讯云 COS (cos-nodejs-sdk-v5)
- **身份验证**: JWT + HTTP-only Cookies
- **文件上传**: Formidable
- **图标**: Lucide React

## 📁 项目结构

```
cos-image-manager/
├── pages/
│   ├── api/
│   │   ├── cos/
│   │   │   ├── list.ts      # 获取图片列表
│   │   │   ├── upload.ts    # 上传图片
│   │   │   ├── delete.ts    # 删除图片
│   │   │   └── rename.ts    # 重命名图片
│   │   ├── login.ts         # 登录接口
│   │   ├── logout.ts        # 登出接口
│   │   └── settings.ts      # 系统设置接口
│   ├── index.tsx            # 主页面 (图床管理界面)
│   └── login.tsx            # 登录页面
├── styles/
│   └── globals.css          # 全局样式
├── .env.example             # 环境变量示例
└── README.md               # 项目说明
```

## 🔒 安全说明

- 使用 JWT 进行身份验证，token 存储在 HTTP-only cookie 中
- 所有 API 接口都需要验证用户身份
- 密码验证在服务端进行，不会暴露给客户端
- 建议在生产环境中使用强密码和安全的 JWT 密钥

## ⚠️ 注意事项

1. **存储桶权限**: 确保您的腾讯云 COS 存储桶允许读写操作
2. **跨域配置**: 如果需要从其他域名访问图片，请配置 COS 的跨域设置
3. **备份**: 建议定期备份重要图片，避免意外丢失
4. **安全**: 请不要将包含敏感信息的 `.env.local` 文件提交到版本控制系统

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📄 许可证

MIT License

## 🔗 相关链接

- [腾讯云 COS 官方文档](https://cloud.tencent.com/document/product/436)
- [腾讯云 COS Node.js SDK](https://github.com/tencentyun/cos-nodejs-sdk-v5)
- [Next.js 官方文档](https://nextjs.org/docs)
