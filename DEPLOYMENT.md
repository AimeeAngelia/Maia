# 洛谷论坛 API 部署指南

## 本地开发环境搭建

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 启动后端服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

后端服务将运行在 `http://localhost:3001`

### 3. 启动前端服务

```bash
# 在项目根目录
npm run dev
```

前端服务将运行在 `http://localhost:4321`

## API 接口文档

### 基础配置

- 开发环境：`http://localhost:3001/api`
- 生产环境：`https://your-domain.com/api`

### 帖子相关接口

#### 获取帖子列表
```
GET /api/posts
```

查询参数：
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20）
- `category`: 分类筛选
- `sort`: 排序方式（newest, oldest, mostViewed, mostReplied, mostLiked）
- `search`: 搜索关键词
- `author`: 作者筛选

#### 获取单个帖子
```
GET /api/posts/:id
```

#### 创建新帖子
```
POST /api/posts
```

请求体：
```json
{
  "title": "帖子标题",
  "content": "帖子内容",
  "category": "分类",
  "tags": ["标签1", "标签2"],
  "author": "作者名",
  "authorId": "作者ID",
  "avatar": "头像URL",
  "anonymous": false
}
```

#### 点赞帖子
```
POST /api/posts/:id/like
```

#### 获取论坛统计
```
GET /api/posts/stats/overview
```

### 评论相关接口

#### 获取帖子评论
```
GET /api/comments/post/:postId
```

查询参数：
- `page`: 页码
- `limit`: 每页数量
- `sort`: 排序方式

#### 创建评论
```
POST /api/comments
```

请求体：
```json
{
  "postId": 1,
  "content": "评论内容",
  "author": "作者名",
  "authorId": "作者ID",
  "avatar": "头像URL",
  "parentId": null
}
```

#### 点赞评论
```
POST /api/comments/:id/like
```

## 云端部署

### 推荐部署平台

1. **Vercel** (前端 + 后端 API)
2. **Railway** (后端服务)
3. **Heroku** (后端服务)
4. **阿里云/腾讯云** (服务器部署)

### Vercel 部署步骤

#### 1. 部署前端

```bash
# 在项目根目录
npm run build
```

将 `dist` 目录上传到 Vercel

#### 2. 部署后端 API

在 Vercel 中创建新项目，设置：
- Build Command: `cd backend && npm install`
- Output Directory: `backend`
- Install Command: `npm install`

环境变量设置：
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Railway 部署步骤

1. 连接 GitHub 仓库
2. 选择 `backend` 目录
3. 设置环境变量
4. 自动部署

### 环境变量配置

```env
# 必需的环境变量
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com

# 可选的环境变量
DATABASE_URL=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
```

## 数据库集成

### MongoDB 集成 (推荐)

1. 安装 MongoDB 驱动：
```bash
npm install mongodb
```

2. 创建数据库连接：
```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.DATABASE_URL);
await client.connect();
const db = client.db('maia-forum');
```

3. 替换内存数据存储为数据库操作

### PostgreSQL 集成

1. 安装驱动：
```bash
npm install pg
```

2. 创建表结构和数据操作

## 功能扩展

### 用户认证系统

1. 添加 JWT 认证
2. 用户注册/登录接口
3. 权限管理

### 文件上传

1. 添加图片上传功能
2. 集成云存储服务

### 实时通知

1. WebSocket 集成
2. 消息推送

### 搜索优化

1. 全文搜索
2. Elasticsearch 集成

## 性能优化

### 缓存策略

1. Redis 缓存热门帖子
2. CDN 静态资源缓存

### 数据库优化

1. 索引优化
2. 查询优化
3. 分页优化

### 监控和日志

1. 错误监控 (Sentry)
2. 性能监控
3. 访问日志

## 安全考虑

1. 输入验证和清理
2. SQL/NoSQL 注入防护
3. XSS 防护
4. CSRF 防护
5. 速率限制
6. 内容审核

## 维护和监控

1. 健康检查端点
2. 日志收集
3. 性能监控
4. 自动备份
5. 故障恢复

## 常见问题

### CORS 错误
确保后端 CORS 配置包含前端域名

### API 请求失败
检查网络连接和 API 端点是否正确

### 部署失败
检查环境变量和依赖项是否正确配置
