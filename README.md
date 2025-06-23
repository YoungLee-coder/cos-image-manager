# COS 图床管理系统

这是一个基于 Next.js 的腾讯云 COS 图床管理系统，采用现代化的架构设计，具有良好的可维护性和扩展性。

## 🏗️ 系统架构

### 重构后的目录结构

```
├── components/
│   ├── features/           # 功能模块组件
│   │   ├── ImageUpload.tsx
│   │   ├── ImageList.tsx
│   │   └── ImagePreview.tsx
│   ├── layout/             # 布局组件
│   │   └── Header.tsx
│   └── ui/                 # 基础UI组件
│       ├── Message.tsx
│       └── LoadingSpinner.tsx
├── hooks/                  # 自定义hooks
│   ├── useImages.ts
│   ├── useMessage.ts
│   ├── useUpload.ts
│   ├── useClipboard.ts
│   └── useViewMode.ts
├── lib/                    # 核心业务逻辑
│   ├── config/
│   │   └── settings.ts     # 配置管理
│   ├── middleware/
│   │   └── auth.ts         # 认证中间件
│   ├── services/
│   │   └── cos.ts          # COS服务层
│   ├── utils/
│   │   └── file.ts         # 文件处理工具
│   └── encryption.ts       # 加密工具
├── types/
│   └── index.ts            # 类型定义
└── pages/
    ├── api/                # API路由
    └── index.tsx           # 页面组件（精简）
```

### 🎯 架构优势

#### 1. **模块化设计**
- **功能组件**：将大型页面拆分为独立的功能组件
- **自定义Hooks**：抽离状态管理逻辑，提高复用性
- **服务层**：统一业务逻辑处理，便于维护

#### 2. **中间件架构**
- **认证中间件**：统一处理API认证逻辑
- **方法限制中间件**：统一HTTP方法验证
- **组合中间件**：支持中间件组合使用

#### 3. **类型安全**
- **统一类型定义**：所有接口和数据结构都有明确类型
- **API响应类型**：统一的API响应格式
- **严格类型检查**：避免运行时错误

#### 4. **代码复用**
- **自定义Hooks**：状态逻辑复用
- **UI组件库**：基础组件复用
- **工具函数**：通用功能复用

## 🔧 主要改进

### 重构前的问题
- ❌ 单个文件超过1000行代码
- ❌ 所有逻辑混在一起
- ❌ 大量重复代码
- ❌ 缺乏抽象层
- ❌ 难以维护和扩展

### 重构后的优势
- ✅ 组件化架构，职责清晰
- ✅ 自定义Hooks抽离状态逻辑
- ✅ 服务层统一业务处理
- ✅ 中间件统一横切关注点
- ✅ 完整的类型系统
- ✅ 良好的代码复用性
- ✅ 易于测试和维护

## 🚀 功能特性

- 📁 图片上传管理
- 🖼️ 图片预览和编辑
- 🎯 缩略图优化
- 🔐 用户认证系统
- ⚙️ 配置管理
- 📱 响应式设计
- 🎨 现代化UI

## 🛠️ 技术栈

- **前端框架**：Next.js 15.3.4
- **UI组件**：React 19
- **样式方案**：Tailwind CSS 4
- **图标库**：Lucide React
- **语言**：TypeScript 5
- **云存储**：腾讯云COS
- **认证**：JWT + bcryptjs

## 📦 安装运行

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start
```

## 🔒 环境配置

首次运行需要进行系统初始化：

1. 访问 `/setup` 页面
2. 配置腾讯云COS信息
3. 设置管理员密码
4. 完成系统初始化

## 📝 开发指南

### 添加新功能

1. **创建类型定义**：在 `types/index.ts` 中添加相关类型
2. **创建服务层**：在 `lib/services/` 中添加业务逻辑
3. **创建Hooks**：在 `hooks/` 中添加状态管理逻辑
4. **创建组件**：在 `components/` 中添加UI组件
5. **创建API**：在 `pages/api/` 中添加API路由

### 代码规范

- 使用TypeScript严格模式
- 组件采用函数式组件 + Hooks
- 统一使用统一的错误处理
- API返回统一的响应格式
- 遵循RESTful API设计原则

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## 🔗 相关链接

- [腾讯云 COS 官方文档](https://cloud.tencent.com/document/product/436)
- [腾讯云 COS Node.js SDK](https://github.com/tencentyun/cos-nodejs-sdk-v5)
- [Next.js 官方文档](https://nextjs.org/docs)
