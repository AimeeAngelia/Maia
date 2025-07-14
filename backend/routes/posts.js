import express from 'express';
import { posts, generateId } from '../data/index.js';

const router = express.Router();

// 获取所有帖子 (支持分页和筛选)
router.get('/', (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            sort = 'newest',
            search,
            author
        } = req.query;

        let filteredPosts = [...posts];

        // 按分类筛选
        if (category && category !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }

        // 按作者筛选
        if (author) {
            filteredPosts = filteredPosts.filter(post =>
                post.author.toLowerCase().includes(author.toLowerCase())
            );
        }

        // 搜索功能
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // 排序
        switch (sort) {
            case 'newest':
                filteredPosts.sort((a, b) => new Date(b.postTime) - new Date(a.postTime));
                break;
            case 'oldest':
                filteredPosts.sort((a, b) => new Date(a.postTime) - new Date(b.postTime));
                break;
            case 'mostViewed':
                filteredPosts.sort((a, b) => b.views - a.views);
                break;
            case 'mostReplied':
                filteredPosts.sort((a, b) => b.replies - a.replies);
                break;
            case 'mostLiked':
                filteredPosts.sort((a, b) => b.likes - a.likes);
                break;
        }

        // 置顶帖子优先
        filteredPosts.sort((a, b) => {
            if (a.isTop && !b.isTop) return -1;
            if (!a.isTop && b.isTop) return 1;
            return 0;
        });

        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        // 统计信息
        const stats = {
            total: filteredPosts.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(filteredPosts.length / limit),
            hasNext: endIndex < filteredPosts.length,
            hasPrev: page > 1
        };

        res.json({
            success: true,
            data: paginatedPosts,
            pagination: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取帖子列表失败',
            message: error.message
        });
    }
});

// 获取单个帖子
router.get('/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: '帖子不存在'
            });
        }

        // 增加浏览量
        post.views += 1;

        res.json({
            success: true,
            data: post,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取帖子失败',
            message: error.message
        });
    }
});

// 创建新帖子
router.post('/', (req, res) => {
    try {
        const {
            title,
            content,
            category,
            tags = [],
            author,
            authorId,
            avatar,
            anonymous = false
        } = req.body;

        // 验证必填字段
        if (!title || !content || !category || !author) {
            return res.status(400).json({
                success: false,
                error: '缺少必填字段',
                required: ['title', 'content', 'category', 'author']
            });
        }

        // 验证标题长度
        if (title.length > 100) {
            return res.status(400).json({
                success: false,
                error: '标题长度不能超过100个字符'
            });
        }

        // 验证分类
        const validCategories = ['题解', '求助', '讨论', '灌水'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: '无效的分类',
                validCategories
            });
        }

        const newPost = {
            id: generateId(posts),
            title: title.trim(),
            content: content.trim(),
            author: anonymous ? '匿名用户' : author,
            authorId: anonymous ? 'anonymous' : authorId,
            avatar: anonymous ? '/default-avatar.png' : avatar,
            tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
            postTime: new Date().toISOString(),
            lastReply: new Date().toISOString(),
            category,
            views: 0,
            replies: 0,
            likes: 0,
            isTop: false,
            isGood: false,
            status: 'published'
        };

        posts.unshift(newPost);

        res.status(201).json({
            success: true,
            data: newPost,
            message: '帖子发布成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '发布帖子失败',
            message: error.message
        });
    }
});

// 更新帖子
router.put('/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '帖子不存在'
            });
        }

        const { title, content, tags, category } = req.body;
        const post = posts[postIndex];

        // 更新字段
        if (title) post.title = title.trim();
        if (content) post.content = content.trim();
        if (tags) post.tags = Array.isArray(tags) ? tags.slice(0, 5) : [];
        if (category) post.category = category;

        posts[postIndex] = { ...post, lastReply: new Date().toISOString() };

        res.json({
            success: true,
            data: posts[postIndex],
            message: '帖子更新成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '更新帖子失败',
            message: error.message
        });
    }
});

// 点赞帖子
router.post('/:id/like', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: '帖子不存在'
            });
        }

        post.likes += 1;

        res.json({
            success: true,
            data: { likes: post.likes },
            message: '点赞成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '点赞失败',
            message: error.message
        });
    }
});

// 删除帖子
router.delete('/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '帖子不存在'
            });
        }

        const deletedPost = posts.splice(postIndex, 1)[0];

        res.json({
            success: true,
            data: deletedPost,
            message: '帖子删除成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '删除帖子失败',
            message: error.message
        });
    }
});

// 获取论坛统计信息
router.get('/stats/overview', (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayPosts = posts.filter(post =>
            new Date(post.postTime) >= today
        );

        const yesterdayPosts = posts.filter(post => {
            const postDate = new Date(post.postTime);
            return postDate >= yesterday && postDate < today;
        });

        const stats = {
            totalPosts: posts.length,
            todayPosts: todayPosts.length,
            yesterdayPosts: yesterdayPosts.length,
            totalViews: posts.reduce((sum, post) => sum + post.views, 0),
            totalReplies: posts.reduce((sum, post) => sum + post.replies, 0),
            categories: {
                '题解': posts.filter(p => p.category === '题解').length,
                '求助': posts.filter(p => p.category === '求助').length,
                '讨论': posts.filter(p => p.category === '讨论').length,
                '灌水': posts.filter(p => p.category === '灌水').length,
            },
            hotPosts: posts
                .sort((a, b) => b.replies - a.replies)
                .slice(0, 5)
                .map(post => ({
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
        res.status(500).json({
            success: false,
            error: '获取统计信息失败',
            message: error.message
        });
    }
});

export default router;
