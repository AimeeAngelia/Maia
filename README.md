# Maia - 河南大学网站工作室


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
└── README.md                        # 项目文档
```

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