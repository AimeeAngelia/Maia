import express from 'express';
import { commentsDAO, postsDAO } from '../dao/index.js';

const router = express.Router();

// 获取帖子的评论列表 (支持层级结构)
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { page = 1, limit = 20, sort = 'oldest', nested = 'false' } = req.query;

        // 检查帖子是否存在
        const post = await postsDAO.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '帖子不存在'
            });
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            nested: nested === 'true'
        };

        const result = await commentsDAO.getCommentsByPostId(postId, options);

        res.json({
            success: true,
            data: result.comments,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                pages: result.pages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev
            },
            nested: nested === 'true',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('获取评论失败:', error);
        res.status(500).json({
            success: false,
            message: '获取评论失败'
        });
    }
});

// 获取单个评论
router.get('/:id', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const comment = await commentsDAO.getCommentById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }

        res.json({
            success: true,
            data: comment,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('获取评论详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取评论详情失败'
        });
    }
});

// 创建新评论
router.post('/', async (req, res) => {
    try {
        const {
            postId,
            content,
            author,
            authorId,
            avatar,
            parentId,
            anonymous = false
        } = req.body;

        // 验证必填字段
        if (!postId || !content || !author || !authorId) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段',
                required: ['postId', 'content', 'author', 'authorId']
            });
        }

        // 验证内容长度
        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                message: '评论内容不能超过5000个字符'
            });
        }

        // 检查帖子是否存在
        const post = await postsDAO.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '帖子不存在'
            });
        }

        // 如果是回复评论，检查父评论是否存在
        if (parentId) {
            const parentComment = await commentsDAO.getCommentById(parentId);
            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: '被回复的评论不存在'
                });
            }
        }

        const commentData = {
            postId,
            content: content.trim(),
            author: anonymous ? '匿名用户' : author,
            authorId: anonymous ? 'anonymous' : authorId,
            avatar: anonymous ? '/default-avatar.png' : (avatar || '/default-avatar.png'),
            parentId: parentId || null
        };

        const commentId = await commentsDAO.createComment(commentData);
        const newComment = await commentsDAO.getCommentById(commentId);

        // 更新帖子的回复数量
        await postsDAO.incrementReplies(postId);

        res.status(201).json({
            success: true,
            data: newComment,
            message: '评论发布成功',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('创建评论失败:', error);
        res.status(500).json({
            success: false,
            message: '创建评论失败'
        });
    }
});

// 更新评论
router.put('/:id', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: '评论内容不能为空'
            });
        }

        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                message: '评论内容不能超过5000个字符'
            });
        }

        const success = await commentsDAO.updateComment(commentId, { content: content.trim() });

        if (!success) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }

        const updatedComment = await commentsDAO.getCommentById(commentId);

        res.json({
            success: true,
            data: updatedComment,
            message: '评论更新成功',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('更新评论失败:', error);
        res.status(500).json({
            success: false,
            message: '更新评论失败'
        });
    }
});

// 删除评论
router.delete('/:id', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);

        const comment = await commentsDAO.getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }

        const success = await commentsDAO.deleteComment(commentId);

        if (!success) {
            return res.status(500).json({
                success: false,
                message: '删除评论失败'
            });
        }

        // 更新帖子的回复数量
        await postsDAO.decrementReplies(comment.postId);

        res.json({
            success: true,
            message: '评论删除成功',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('删除评论失败:', error);
        res.status(500).json({
            success: false,
            message: '删除评论失败'
        });
    }
});

// 点赞评论
router.post('/:id/like', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const success = await commentsDAO.incrementLikes(commentId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }

        const comment = await commentsDAO.getCommentById(commentId);
        res.json({
            success: true,
            data: { likes: comment.likes },
            message: '点赞成功',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('点赞失败:', error);
        res.status(500).json({
            success: false,
            message: '点赞失败'
        });
    }
});

// 获取评论的回复
router.get('/:id/replies', async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const { page = 1, limit = 10, sort = 'oldest' } = req.query;

        const comment = await commentsDAO.getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort
        };

        const result = await commentsDAO.getCommentReplies(commentId, options);

        res.json({
            success: true,
            data: result.comments,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                pages: result.pages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('获取回复失败:', error);
        res.status(500).json({
            success: false,
            message: '获取回复失败'
        });
    }
});

// 获取最新评论
router.get('/recent/comments', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const recentComments = await commentsDAO.getRecentComments(parseInt(limit));

        res.json({
            success: true,
            data: recentComments,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('获取最新评论失败:', error);
        res.status(500).json({
            success: false,
            message: '获取最新评论失败'
        });
    }
});

export default router;
