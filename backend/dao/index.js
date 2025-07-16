import { getCollection, COLLECTIONS } from '../config/database.js';

// 帖子数据访问层
export class PostsDAO {
    constructor() {
        this.collectionName = COLLECTIONS.POSTS;
    }

    getCollection() {
        return getCollection(this.collectionName);
    }

    // 获取帖子列表（支持分页和筛选）
    async getPosts(options = {}) {
        const {
            page = 1,
            limit = 20,
            category,
            sort = 'newest',
            search,
            author
        } = options;

        const collection = this.getCollection();

        // 构建查询条件
        const filter = { status: 'published' };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (author) {
            filter.author = new RegExp(author, 'i');
        }

        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { content: new RegExp(search, 'i') },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // 构建排序条件
        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { isTop: -1, postTime: -1 };
                break;
            case 'oldest':
                sortOption = { isTop: -1, postTime: 1 };
                break;
            case 'mostViewed':
                sortOption = { isTop: -1, views: -1 };
                break;
            case 'mostReplied':
                sortOption = { isTop: -1, replies: -1 };
                break;
            case 'mostLiked':
                sortOption = { isTop: -1, likes: -1 };
                break;
            default:
                sortOption = { isTop: -1, postTime: -1 };
        }

        // 执行查询
        const total = await collection.countDocuments(filter);
        const posts = await collection
            .find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // 转换数据格式
        const transformedPosts = posts.map(post => ({
            ...post,
            id: post._id
        }));

        return {
            posts: transformedPosts,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        };
    }

    // 根据ID获取单个帖子
    async getPostById(id) {
        const collection = this.getCollection();
        const post = await collection.findOne({ _id: parseInt(id) });
        if (!post) return null;

        return {
            ...post,
            id: post._id
        };
    }

    // 创建新帖子
    async createPost(postData) {
        const collection = this.getCollection();

        // 生成新的ID
        const maxId = await collection.findOne({}, { sort: { _id: -1 } });
        const newId = maxId ? maxId._id + 1 : 1;

        const post = {
            ...postData,
            _id: newId,
            postTime: new Date(),
            lastReply: new Date(),
            views: 0,
            replies: 0,
            likes: 0,
            isTop: false,
            isGood: false,
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collection.insertOne(post);
        return newId;
    }

    // 更新帖子
    async updatePost(id, updateData) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    // 删除帖子
    async deletePost(id) {
        const collection = this.getCollection();
        const result = await collection.deleteOne({ _id: parseInt(id) });
        return result.deletedCount > 0;
    }

    // 增加浏览量
    async incrementViews(id) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            { $inc: { views: 1 } }
        );
        return result.modifiedCount > 0;
    }

    // 增加回复数量
    async incrementReplies(id) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            {
                $inc: { replies: 1 },
                $set: { lastReply: new Date() }
            }
        );
        return result.modifiedCount > 0;
    }

    // 减少回复数量
    async decrementReplies(id) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            { $inc: { replies: -1 } }
        );
        return result.modifiedCount > 0;
    }

    // 增加点赞数量
    async incrementLikes(id) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            { $inc: { likes: 1 } }
        );
        return result.modifiedCount > 0;
    }

    // 获取热门帖子
    async getHotPosts(limit = 10) {
        const collection = this.getCollection();
        const posts = await collection
            .find({ status: 'published' })
            .sort({ views: -1, likes: -1 })
            .limit(limit)
            .toArray();

        return posts.map(post => ({
            ...post,
            id: post._id
        }));
    }

    // 获取推荐帖子
    async getRecommendedPosts(limit = 5) {
        const collection = this.getCollection();
        const posts = await collection
            .find({ status: 'published', isGood: true })
            .sort({ isTop: -1, likes: -1, views: -1 })
            .limit(limit)
            .toArray();

        return posts.map(post => ({
            ...post,
            id: post._id
        }));
    }
}

// 评论数据访问层
export class CommentsDAO {
    constructor() {
        this.collectionName = COLLECTIONS.COMMENTS;
    }

    getCollection() {
        return getCollection(this.collectionName);
    }

    // 获取帖子的评论列表
    async getCommentsByPostId(postId, options = {}) {
        const {
            page = 1,
            limit = 20,
            sort = 'oldest',
            nested = false
        } = options;

        const collection = this.getCollection();

        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { replyTime: -1 };
                break;
            case 'oldest':
                sortOption = { replyTime: 1 };
                break;
            case 'mostLiked':
                sortOption = { likes: -1 };
                break;
            default:
                sortOption = { replyTime: 1 };
        }

        const filter = { postId: parseInt(postId), status: 'published' };
        const total = await collection.countDocuments(filter);
        const comments = await collection
            .find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        // 转换数据格式
        const transformedComments = comments.map(comment => ({
            ...comment,
            id: comment._id
        }));

        return {
            comments: transformedComments,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        };
    }

    // 根据ID获取单个评论
    async getCommentById(id) {
        const collection = this.getCollection();
        const comment = await collection.findOne({ _id: parseInt(id) });
        if (!comment) return null;

        return {
            ...comment,
            id: comment._id
        };
    }

    // 创建新评论
    async createComment(commentData) {
        const collection = this.getCollection();

        // 生成新的ID
        const maxId = await collection.findOne({}, { sort: { _id: -1 } });
        const newId = maxId ? maxId._id + 1 : 1;

        // 计算楼层号
        const floor = await collection.countDocuments({
            postId: parseInt(commentData.postId)
        }) + 1;

        const comment = {
            ...commentData,
            _id: newId,
            postId: parseInt(commentData.postId),
            floor,
            replyTime: new Date(),
            likes: 0,
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collection.insertOne(comment);
        return newId;
    }

    // 更新评论
    async updateComment(id, updateData) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    // 删除评论
    async deleteComment(id) {
        const collection = this.getCollection();
        const result = await collection.deleteOne({ _id: parseInt(id) });
        return result.deletedCount > 0;
    }

    // 增加点赞数量
    async incrementLikes(id) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { _id: parseInt(id) },
            { $inc: { likes: 1 } }
        );
        return result.modifiedCount > 0;
    }

    // 获取评论的回复
    async getCommentReplies(commentId, options = {}) {
        const {
            page = 1,
            limit = 10,
            sort = 'oldest'
        } = options;

        const collection = this.getCollection();

        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { replyTime: -1 };
                break;
            case 'oldest':
                sortOption = { replyTime: 1 };
                break;
            case 'mostLiked':
                sortOption = { likes: -1 };
                break;
            default:
                sortOption = { replyTime: 1 };
        }

        const filter = { parentId: parseInt(commentId), status: 'published' };
        const total = await collection.countDocuments(filter);
        const comments = await collection
            .find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        return {
            comments: comments.map(comment => ({
                ...comment,
                id: comment._id
            })),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        };
    }

    // 获取最新评论
    async getRecentComments(limit = 10) {
        const collection = this.getCollection();
        const comments = await collection
            .find({ status: 'published' })
            .sort({ replyTime: -1 })
            .limit(limit)
            .toArray();

        return comments.map(comment => ({
            ...comment,
            id: comment._id
        }));
    }
}

// 统计数据访问层
export class StatsDAO {
    constructor() {
        this.collectionName = COLLECTIONS.STATS;
    }

    getCollection() {
        return getCollection(this.collectionName);
    }

    // 获取论坛统计数据
    async getForumStats() {
        const collection = this.getCollection();
        const stats = await collection.findOne({ _id: 'forum_stats' });
        if (!stats) {
            return {
                totalPosts: 0,
                todayPosts: 0,
                yesterdayPosts: 0,
                hotPosts: []
            };
        }

        return {
            totalPosts: stats.totalPosts,
            todayPosts: stats.todayPosts,
            yesterdayPosts: stats.yesterdayPosts,
            hotPosts: stats.hotPosts
        };
    }

    // 更新统计数据
    async updateStats() {
        const collection = this.getCollection();
        const postsCollection = getCollection(COLLECTIONS.POSTS);

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayPosts = await postsCollection.countDocuments({
            postTime: {
                $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }
        });

        const yesterdayPosts = await postsCollection.countDocuments({
            postTime: {
                $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
                $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }
        });

        const totalPosts = await postsCollection.countDocuments({ status: 'published' });

        const hotPosts = await postsCollection
            .find({}, { projection: { _id: 1, title: 1, replies: 1, views: 1 } })
            .sort({ views: -1, replies: -1 })
            .limit(10)
            .toArray();

        const statsData = {
            _id: 'forum_stats',
            totalPosts,
            todayPosts,
            yesterdayPosts,
            hotPosts,
            lastUpdated: new Date()
        };

        await collection.replaceOne(
            { _id: 'forum_stats' },
            statsData,
            { upsert: true }
        );

        return statsData;
    }
}

// 导出单例实例
export const postsDAO = new PostsDAO();
export const commentsDAO = new CommentsDAO();
export const statsDAO = new StatsDAO();
