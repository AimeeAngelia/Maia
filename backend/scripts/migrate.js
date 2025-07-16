import { connectToDatabase, getCollection, COLLECTIONS } from '../config/database.js';
import { posts, comments } from '../data/index.js';

// 数据迁移函数
export async function migrateData() {
    try {
        console.log('🚀 开始数据迁移...');

        const db = await connectToDatabase();

        // 清空现有数据
        console.log('🧹 清空现有数据...');
        await db.collection(COLLECTIONS.POSTS).deleteMany({});
        await db.collection(COLLECTIONS.COMMENTS).deleteMany({});

        // 转换并插入帖子数据
        console.log('📝 迁移帖子数据...');
        const postsToInsert = posts.map(post => ({
            ...post,
            _id: post.id,
            postTime: new Date(post.postTime),
            lastReply: new Date(post.lastReply),
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await db.collection(COLLECTIONS.POSTS).insertMany(postsToInsert);
        console.log(`✅ 成功迁移 ${postsToInsert.length} 条帖子数据`);

        // 转换并插入评论数据
        console.log('💬 迁移评论数据...');
        const commentsToInsert = comments.map(comment => ({
            ...comment,
            _id: comment.id,
            replyTime: new Date(comment.replyTime),
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await db.collection(COLLECTIONS.COMMENTS).insertMany(commentsToInsert);
        console.log(`✅ 成功迁移 ${commentsToInsert.length} 条评论数据`);

        // 创建索引
        console.log('🔍 创建索引...');
        await createIndexes(db);

        // 创建初始统计数据
        console.log('📊 初始化统计数据...');
        await initializeStats(db);

        console.log('🎉 数据迁移完成！');

        // 显示迁移总结
        console.log('\n📊 迁移总结:');
        console.log(`- 帖子数据: ${postsToInsert.length} 条`);
        console.log(`- 评论数据: ${commentsToInsert.length} 条`);
        console.log(`- 数据库: maia_forum`);
        console.log(`- 主机: localhost:27017`);

    } catch (error) {
        console.error('❌ 数据迁移失败:', error);
        throw error;
    }
}

// 初始化统计数据
async function initializeStats(db) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 统计今日和昨日发帖数
    const todayPosts = await db.collection(COLLECTIONS.POSTS).countDocuments({
        postTime: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
    });

    const yesterdayPosts = await db.collection(COLLECTIONS.POSTS).countDocuments({
        postTime: {
            $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
    });

    // 获取热门帖子
    const hotPosts = await db.collection(COLLECTIONS.POSTS)
        .find({}, { projection: { _id: 1, title: 1, replies: 1, views: 1 } })
        .sort({ views: -1, replies: -1 })
        .limit(10)
        .toArray();

    // 插入统计数据
    const statsData = {
        _id: 'forum_stats',
        totalPosts: posts.length,
        todayPosts,
        yesterdayPosts,
        hotPosts,
        lastUpdated: new Date()
    };

    await db.collection(COLLECTIONS.STATS).replaceOne(
        { _id: 'forum_stats' },
        statsData,
        { upsert: true }
    );
}

// 创建数据库索引
async function createIndexes(db) {
    // 帖子索引
    await db.collection(COLLECTIONS.POSTS).createIndex({ category: 1 });
    await db.collection(COLLECTIONS.POSTS).createIndex({ postTime: -1 });
    await db.collection(COLLECTIONS.POSTS).createIndex({ authorId: 1 });
    await db.collection(COLLECTIONS.POSTS).createIndex({ isTop: -1, postTime: -1 });
    await db.collection(COLLECTIONS.POSTS).createIndex({ title: 'text', content: 'text' });
    await db.collection(COLLECTIONS.POSTS).createIndex({ views: -1 });
    await db.collection(COLLECTIONS.POSTS).createIndex({ likes: -1 });
    await db.collection(COLLECTIONS.POSTS).createIndex({ status: 1 });

    // 评论索引
    await db.collection(COLLECTIONS.COMMENTS).createIndex({ postId: 1 });
    await db.collection(COLLECTIONS.COMMENTS).createIndex({ parentId: 1 });
    await db.collection(COLLECTIONS.COMMENTS).createIndex({ replyTime: -1 });
    await db.collection(COLLECTIONS.COMMENTS).createIndex({ authorId: 1 });
    await db.collection(COLLECTIONS.COMMENTS).createIndex({ status: 1 });

    // 统计数据索引
    await db.collection(COLLECTIONS.STATS).createIndex({ _id: 1 });

    console.log('✅ 索引创建完成');
}

// 直接运行迁移
migrateData()
    .then(() => {
        console.log('✅ 迁移脚本执行完成');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ 迁移脚本执行失败:', error);
        process.exit(1);
    });
