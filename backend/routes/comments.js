import express from 'express';
import { comments, posts, generateId } from '../data/index.js';

const router = express.Router();

// 获取帖子的评论列表 (支持层级结构)
router.get('/post/:postId', (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { page = 1, limit = 20, sort = 'oldest', nested = 'false' } = req.query;

        // 检查帖子是否存在
        const post = posts.find(p => p.id === postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '帖子不存在'
            });
        }

        let postComments = comments.filter(comment => comment.postId === postId);

        // 排序
        switch (sort) {
            case 'newest':
                postComments.sort((a, b) => new Date(b.replyTime) - new Date(a.replyTime));
                break;
            case 'oldest':
                postComments.sort((a, b) => new Date(a.replyTime) - new Date(b.replyTime));
                break;
            case 'mostLiked':
                postComments.sort((a, b) => b.likes - a.likes);
                break;
        }

        // 如果需要嵌套结构
        if (nested === 'true') {
            // 构建评论树结构
            const commentMap = new Map();
            const rootComments = [];

            // 首先将所有评论加入map
            postComments.forEach(comment => {
                commentMap.set(comment.id, { ...comment, replies: [] });
            });

            // 构建树结构
            postComments.forEach(comment => {
                const commentNode = commentMap.get(comment.id);
                if (comment.parentId) {
                    const parent = commentMap.get(comment.parentId);
                    if (parent) {
                        parent.replies.push(commentNode);
                    }
                } else {
                    rootComments.push(commentNode);
                }
            });

            // 分页（只对根评论进行分页）
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedComments = rootComments.slice(startIndex, endIndex);

            // 统计信息
            const stats = {
                total: rootComments.length,
                totalComments: postComments.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(rootComments.length / limit),
                hasNext: endIndex < rootComments.length,
                hasPrev: page > 1
            };

            return res.json({
                success: true,
                data: paginatedComments,
                pagination: stats,
                nested: true,
                timestamp: new Date().toISOString()
            });
        }

        // 扁平结构的分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedComments = postComments.slice(startIndex, endIndex);

        // 统计信息
        const stats = {
            total: postComments.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(postComments.length / limit),
            hasNext: endIndex < postComments.length,
            hasPrev: page > 1
        };

        res.json({
            success: true,
            data: paginatedComments,
            pagination: stats,
            nested: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取评论列表失败',
            message: error.message
        });
    }
});

// 获取单个评论
router.get('/:id', (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const comment = comments.find(c => c.id === commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                error: '评论不存在'
            });
        }

        res.json({
            success: true,
            data: comment,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取评论失败',
            message: error.message
        });
    }
});

// 创建新评论
router.post('/', (req, res) => {
    try {
        const {
            postId,
            content,
            author,
            authorId,
            avatar,
            parentId = null,
            anonymous = false
        } = req.body;

        // 验证必填字段
        if (!postId || !content || !author) {
            return res.status(400).json({
                success: false,
                error: '缺少必填字段',
                required: ['postId', 'content', 'author']
            });
        }

        // 检查帖子是否存在
        const post = posts.find(p => p.id === parseInt(postId));
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '帖子不存在'
            });
        }

        // 验证内容长度
        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                error: '评论内容不能超过5000个字符'
            });
        }

        // 如果是回复评论，检查父评论是否存在
        if (parentId) {
            const parentComment = comments.find(c => c.id === parseInt(parentId));
            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    error: '被回复的评论不存在'
                });
            }
        }

        // 计算楼层号
        const postComments = comments.filter(c => c.postId === parseInt(postId));
        const floor = postComments.length + 1;

        const newComment = {
            id: generateId(comments),
            postId: parseInt(postId),
            content: content.trim(),
            author: anonymous ? '匿名用户' : author,
            authorId: anonymous ? 'anonymous' : authorId,
            avatar: anonymous ? '/default-avatar.png' : avatar,
            replyTime: new Date().toISOString(),
            floor,
            likes: 0,
            parentId: parentId ? parseInt(parentId) : null,
            status: 'published'
        };

        comments.push(newComment);

        // 更新帖子的回复数和最后回复时间
        post.replies += 1;
        post.lastReply = new Date().toISOString();

        res.status(201).json({
            success: true,
            data: newComment,
            message: '评论发布成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '发布评论失败',
            message: error.message
        });
    }
});

// 更新评论
router.put('/:id', (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const commentIndex = comments.findIndex(c => c.id === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '评论不存在'
            });
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: '评论内容不能为空'
            });
        }

        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                error: '评论内容不能超过5000个字符'
            });
        }

        comments[commentIndex].content = content.trim();
        comments[commentIndex].lastEditTime = new Date().toISOString();

        res.json({
            success: true,
            data: comments[commentIndex],
            message: '评论更新成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '更新评论失败',
            message: error.message
        });
    }
});

// 点赞评论
router.post('/:id/like', (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const comment = comments.find(c => c.id === commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                error: '评论不存在'
            });
        }

        comment.likes += 1;

        res.json({
            success: true,
            data: { likes: comment.likes },
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

// 删除评论
router.delete('/:id', (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const commentIndex = comments.findIndex(c => c.id === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '评论不存在'
            });
        }

        const deletedComment = comments.splice(commentIndex, 1)[0];

        // 更新帖子的回复数
        const post = posts.find(p => p.id === deletedComment.postId);
        if (post) {
            post.replies = Math.max(0, post.replies - 1);
        }

        res.json({
            success: true,
            data: deletedComment,
            message: '评论删除成功',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: '删除评论失败',
            message: error.message
        });
    }
});

export default router;
