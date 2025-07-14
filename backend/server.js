import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// 导入路由
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-domain.com']
        : ['http://localhost:4321', 'http://localhost:3000'],
    credentials: true
}));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 每个 IP 15分钟内最多 100 次请求
    message: {
        error: '请求过于频繁，请稍后再试'
    }
});
app.use('/api/', limiter);

// 解析 JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 处理
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.path
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 论坛后端 API 运行在 http://localhost:${PORT}`);
    console.log(`📚 API 文档: http://localhost:${PORT}/api/health`);
});

export default app;
