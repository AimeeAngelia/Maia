import { MongoClient } from 'mongodb';

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'maia_forum';

let client;
let db;

// 连接到 MongoDB
export async function connectToDatabase() {
    try {
        if (!client) {
            client = new MongoClient(MONGODB_URI);
            await client.connect();
            console.log('✅ 成功连接到 MongoDB');
        }

        if (!db) {
            db = client.db(DB_NAME);
        }

        return db;
    } catch (error) {
        console.error('❌ MongoDB 连接失败:', error);
        throw error;
    }
}

// 关闭数据库连接
export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('🔒 MongoDB 连接已关闭');
    }
}

// 获取数据库实例
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase() first.');
    }
    return db;
}

// 获取集合
export function getCollection(name) {
    const database = getDatabase();
    return database.collection(name);
}

// 集合名称常量
export const COLLECTIONS = {
    POSTS: 'posts',
    COMMENTS: 'comments',
    USERS: 'users',
    STATS: 'stats'
};
