# 老婆宝 API Key 测试工具

一个API Key 有效性测试工具，支持 Gemini API 和自定义 API 服务的全面测试。采用现代化设计，兼容 PC 端和移动端。献给我的粉丝宝宝们

## ✨ 功能特性

### 🔍 Gemini API 测试
- **双环境测试**：同时进行客户端和服务端环境测试，以确定是否是自身网络问题
- **多模型支持**：支持使用 Gemini 2.0 Flash、2.5 Flash、2.5 Pro进行测试，其他的也支持但没必要
- **智能诊断**：提供较为详细的错误码解释和针对性解决方案
- **安全保护**：API Key 仅在客户端处理，不存储在服务器

### 🛠️ 自定义 API 测试（轮询）
- **双轮询支持**：
  - **Hajimi 轮询**：支持 Hajimi 轮询服务测试
  - **Gemini-Balance 轮询**：支持 Gemini-Balance 轮询服务测试
- **智能模型获取**：自动连接并获取可用模型列表
- **灵活模型选择**：支持下拉选择或自定义输入模型名称
- **流式响应处理**：完整支持流式 API 响应解析
- **专业故障排除**：针对不同轮询类型提供详细的故障排除指南
- **面板链接生成**：自动生成轮询面板访问链接，免得又要回去找

### 🎨 设计特色
- **现代化 UI**：采用卡片化设计，简约美观
- **响应式布局**：完美适配 PC 端和移动端
- **深色模式**：支持自动深色模式切换
- **交互友好**：丰富的状态反馈和加载动画

## 🚀 技术栈

- **前端框架**：Next.js 14 (App Router)
- **开发语言**：TypeScript
- **样式框架**：Tailwind CSS
- **图标库**：Lucide React
- **运行环境**：Node.js 18+
- **部署平台**：Vercel (推荐)

## 📦 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd api-tester
```

2. **安装依赖**
```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

3. **启动开发服务器**
```bash
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
npm run build
npm start
```

### 部署到 Vercel

1. **推送代码到 GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **一键部署**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/api-tester)

3. **手动部署**
- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 点击 "New Project"
- 导入您的 GitHub 仓库
- 点击 "Deploy"


## 🏗️ 项目结构

```
api-tester/
├── app/
│   ├── api/
│   │   ├── gemini-test/
│   │   │   └── route.ts              # Gemini API 代理接口
│   │   └── custom-api-test/
│   │       └── route.ts              # 自定义 API 代理接口
│   ├── components/
│   │   ├── GeminiTester.tsx          # Gemini API 测试组件
│   │   └── CustomApiTester.tsx       # 自定义 API 测试组件
│   ├── globals.css                   # 全局样式和主题
│   ├── layout.tsx                    # 根布局组件
│   └── page.tsx                      # 主页面和标签切换
├── public/                           # 静态资源目录
├── .gitignore                        # Git 忽略文件
├── next.config.js                    # Next.js 配置
├── package.json                      # 项目依赖和脚本
├── postcss.config.js                 # PostCSS 配置
├── tailwind.config.js                # Tailwind CSS 配置
├── tsconfig.json                     # TypeScript 配置
├── 开发说明.md                       # 开发需求文档
└── README.md                         # 项目说明文档
```

## 🔧 核心功能实现

### API 代理服务
- **Gemini API 代理**：`/api/gemini-test` - 处理 Gemini API 调用
- **自定义 API 代理**：`/api/custom-api-test` - 处理轮询服务调用
- **流式响应处理**：完整支持 Server-Sent Events (SSE) 流式响应
- **错误处理**：详细的错误捕获和用户友好的错误信息

### 安全特性
- **客户端处理**：所有 API Key 仅在客户端处理
- **无服务器存储**：不在服务器端存储任何敏感信息
- **HTTPS 强制**：生产环境强制使用 HTTPS
- **CORS 配置**：合理的跨域资源共享配置


## 🌍 环境要求

- **Node.js**：18.0.0 或更高版本
- **npm**：9.0.0 或更高版本
- **浏览器**：支持现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)


### 开发规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 组件采用函数式组件和 Hooks
- 样式使用 Tailwind CSS 实用类
- 提交信息遵循 Conventional Commits 规范

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。


## 🔄 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🔍 Gemini API 双环境测试
- 🛠️ 自定义 API 轮询测试
- 🎨 现代化响应式 UI
- 🔒 安全的客户端 API Key 处理
- 📱 完整的移动端适配

---

**Made with ❤️ for API testing**