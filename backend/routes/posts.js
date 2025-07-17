import express from 'express';
import { postsDAO, commentsDAO } from '../dao/index.js';

const router = express.Router();

// 获取所有帖子 (支持分页和筛选)
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            sort = 'newest',
            search,
            author
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            category: category && category !== 'all' ? category : null,
            sort,
            search,
            author
        };

        const result = await postsDAO.getPosts(options);

        res.json({
            success: true,
            data: result.posts,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                pages: result.pages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev
            }
        });
    } catch (error) {
        console.error('获取帖子列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取帖子列表失败'
        });
    }
});

// 获取单个帖子
router.get('/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        const post = await postsDAO.getPostById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: '帖子不存在'
            });
        }

        // 增加浏览量
        await postsDAO.incrementViews(postId);

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('获取帖子详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取帖子详情失败'
        });
    }
});

// 创建新帖子
router.post('/', async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            tags,
            author,
            authorId,
            avatar
        } = req.body;

        // 验证必填字段
        if (!title || !content || !category || !author || !authorId) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段',
                required: ['title', 'content', 'category', 'author', 'authorId']
            });
        }

        // 验证标题长度
        if (title.length > 100) {
            return res.status(400).json({
                success: false,
                message: '标题长度不能超过100个字符'
            });
        }

        // 验证分类
        const validCategories = ['题解', '求助', '讨论', '灌水'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: '无效的分类',
                validCategories
            });
        }

        const postData = {
            title,
            content,
            category,
            tags: tags || [],
            author,
            authorId,
            avatar: avatar || '/default-avatar.png'
        };

        const postId = await postsDAO.createPost(postData);
        const newPost = await postsDAO.getPostById(postId);

        res.status(201).json({
            success: true,
            data: newPost,
            message: '帖子创建成功'
        });
    } catch (error) {
        console.error('创建帖子失败:', error);
        res.status(500).json({
            success: false,
            message: '创建帖子失败'
        });
    }
});

// 更新帖子
router.put('/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const updateData = req.body;

        const success = await postsDAO.updatePost(postId, updateData);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: '帖子不存在'
            });
        }

        const updatedPost = await postsDAO.getPostById(postId);

        res.json({
            success: true,
            data: updatedPost,
            message: '帖子更新成功'
        });
    } catch (error) {
        console.error('更新帖子失败:', error);
        res.status(500).json({
            success: false,
            message: '更新帖子失败'
        });
    }
});

// 删除帖子
router.delete('/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        const success = await postsDAO.deletePost(postId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: '帖子不存在'
            });
        }

        res.json({
            success: true,
            message: '帖子删除成功'
        });
    } catch (error) {
        console.error('删除帖子失败:', error);
        res.status(500).json({
            success: false,
            message: '删除帖子失败'
        });
    }
});

// 点赞帖子
router.post('/:id/like', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        const success = await postsDAO.incrementLikes(postId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: '帖子不存在'
            });
        }

        const post = await postsDAO.getPostById(postId);

        res.json({
            success: true,
            data: { likes: post.likes },
            message: '点赞成功'
        });
    } catch (error) {
        console.error('点赞失败:', error);
        res.status(500).json({
            success: false,
            message: '点赞失败'
        });
    }
});

// 获取帖子的评论
router.get('/:id/comments', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        const result = await commentsDAO.getCommentsByPostId(postId);

        res.json({
            success: true,
            data: result.comments
        });
    } catch (error) {
        console.error('获取评论失败:', error);
        res.status(500).json({
            success: false,
            message: '获取评论失败'
        });
    }
});

// 获取热门帖子
router.get('/hot/posts', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const hotPosts = await postsDAO.getHotPosts(parseInt(limit));

        res.json({
            success: true,
            data: hotPosts
        });
    } catch (error) {
        console.error('获取热门帖子失败:', error);
        res.status(500).json({
            success: false,
            message: '获取热门帖子失败'
        });
    }
});

// 获取推荐帖子
router.get('/recommended/posts', async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const recommendedPosts = await postsDAO.getRecommendedPosts(parseInt(limit));

        res.json({
            success: true,
            data: recommendedPosts
        });
    } catch (error) {
        console.error('获取推荐帖子失败:', error);
        res.status(500).json({
            success: false,
            message: '获取推荐帖子失败'
        });
    }
});

// 获取论坛统计信息
router.get('/stats/overview', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 获取今日帖子数量
        const todayPosts = await postsDAO.getPostsByDateRange(today, new Date());

        // 获取昨日帖子数量
        const yesterdayPosts = await postsDAO.getPostsByDateRange(yesterday, today);

        // 获取总帖子数
        const totalPosts = await postsDAO.getTotalPostsCount();

        // 获取总浏览量和回复数
        const totalViews = await postsDAO.getTotalViews();
        const totalReplies = await postsDAO.getTotalReplies();

        // 获取分类统计
        const categoriesStats = await postsDAO.getCategoriesStats();

        // 获取热门帖子
        const hotPosts = await postsDAO.getHotPosts(5);

        const stats = {
            totalPosts,
            todayPosts: todayPosts.length,
            yesterdayPosts: yesterdayPosts.length,
            totalViews,
            totalReplies,
            categories: categoriesStats,
            hotPosts: hotPosts.map(post => ({
                id: post.id,
                title: post.title,
                replies: post.replies,
                views: post.views
            }))
        };

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取统计信息失败'
        });
    }
});

export default router;
