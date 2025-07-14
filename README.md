# Maia - 河南大学网站工作室论坛系统

一个模仿洛谷风格的现代化论坛系统，基于 Astro + Node.js 构建，支持帖子发布、评论回复、分类管理等完整论坛功能。

## ✨ 特性

- 🎨 **洛谷风格界面** - 精美的 UI 设计，符合用户习惯
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **高性能架构** - Astro SSR + Express API 服务器
- 🔥 **实时交互** - 点赞、回复、分类筛选等功能
- 🛡️ **安全可靠** - 输入验证、XSS 防护、速率限制
- 🚀 **易于部署** - 支持 Vercel、Railway 等云平台
- 📊 **数据统计** - 帖子数量、热门内容、用户活跃度

## 🏗️ 技术栈

### 前端
- **Astro** - 现代化的静态站点生成器（SSR模式）
- **TypeScript** - 类型安全的 JavaScript
- **CSS3** - 原生 CSS，洛谷风格样式

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - 高性能 Web 应用框架
- **CORS** - 跨域资源共享配置
- **Helmet** - 安全中间件
- **Express-rate-limit** - API 速率限制

## 📦 快速开始

### 前置要求
- Node.js 16+ 
- npm 或 yarn

### 一键启动开发环境

```bash
# Windows PowerShell
.\start-dev.ps1

# 或者手动启动
npm install
cd backend && npm install && npm run dev &
cd .. && npm run dev
```

访问地址：
- 🌐 前端: http://localhost:4321
- 🔗 API: http://localhost:3001
- 📚 论坛: http://localhost:4321/forum

```
Maia/
├── src/                             # 前端源码
│   ├── pages/
│   │   ├── index.astro              # 首页
│   │   ├── about.astro              # 关于我们
│   │   ├── departments/             # 部门页面
│   │   │   ├── index.astro          # 部门总览
│   │   │   ├── tech.astro           # 技术部
│   │   │   └── ...
│   │   └── forum/                   # 论坛系统
│   │       ├── index.astro          # 论坛首页
│   │       └── post/
│   │           ├── [id].astro       # 帖子详情页（SSR）
│   │           └── new.astro        # 发帖页
│   │
│   ├── components/                  # 组件
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ...
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro         # 基础布局
│   │
│   ├── data/                        # 示例数据
│   │   ├── posts.json               # 帖子数据
│   │   └── comments.json            # 评论数据
│   │
│   ├── utils/
│   │   └── api.js                   # API 客户端
│   │
│   └── styles/
│       └── global.css               # 全局样式
│
├── backend/                         # 后端 API 服务器
│   ├── server.js                    # Express 服务器
│   ├── routes/                      # API 路由
│   │   ├── posts.js                 # 帖子 API
│   │   └── comments.js              # 评论 API
│   ├── data/
│   │   └── index.js                 # 数据模型
│   ├── package.json
│   └── .env                         # 环境配置
│
├── start-dev.ps1                    # 开发启动脚本
├── DEPLOYMENT.md                    # 部署指南
└── README.md                        # 项目文档
```

## 🎯 功能特性

### 论坛系统
- ✅ **帖子管理** - 发布、编辑、删除、分类
- ✅ **评论系统** - 多层嵌套回复、点赞功能
- ✅ **分类筛选** - 按技术、问题、讨论等分类
- ✅ **热门排序** - 按浏览量、回复数、点赞数排序
- ✅ **统计数据** - 帖子数量、用户活跃度统计
- ✅ **响应式界面** - 完美适配各种设备

### API 服务
- ✅ **RESTful API** - 标准化的 API 接口
- ✅ **数据验证** - 输入参数验证和清理
- ✅ **错误处理** - 完善的错误处理机制
- ✅ **速率限制** - 防止 API 滥用
- ✅ **CORS 配置** - 跨域请求支持
- ✅ **安全中间件** - 防护常见 Web 攻击

### 开发特性
- ✅ **TypeScript** - 类型安全的开发体验
- ✅ **热重载** - 开发时自动刷新
- ✅ **代码规范** - 统一的代码风格
- ✅ **错误监控** - 详细的错误日志
- ✅ **一键部署** - 支持多种云平台

## 🚀 部署指南

详细的部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 推荐平台
- **Vercel** - 前端部署
- **Railway** - 后端部署
- **Netlify** - 静态资源托管

## 🔧 开发指南

### 添加新功能
1. 前端页面：在 `src/pages/` 下创建新的 `.astro` 文件
2. API 接口：在 `backend/routes/` 下添加新的路由文件
3. 样式：在 `src/styles/global.css` 中添加样式

### 数据库集成
项目当前使用内存存储，可以轻松替换为：
- **MongoDB** - 文档数据库
- **PostgreSQL** - 关系型数据库
- **MySQL** - 关系型数据库

## 📝 API 文档

### 帖子 API
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取单个帖子
- `POST /api/posts` - 创建新帖子
- `PUT /api/posts/:id/like` - 点赞帖子

### 评论 API
- `GET /api/comments/:postId` - 获取帖子评论
- `POST /api/comments` - 发表评论
- `PUT /api/comments/:id/like` - 点赞评论

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 📞 支持

如有问题或建议，请：
- 创建 Issue
- 发送邮件至 [contact@example.com](mailto:contact@example.com)
- 访问我们的论坛系统进行讨论

---

💡 **提示**: 这是一个学习项目，欢迎大家参与贡献和改进！
    └── global.css                   # 样式