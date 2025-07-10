import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const prerender = false

const superAdminPath = path.resolve(process.cwd(), 'private/super-admin.key');

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

export async function POST({ request }) {

    try {
        const { token } = await request.json()

        if (!token) {
            return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }
        const keyPath = path.resolve(superAdminPath);
        const keyRaw = await fs.readFile(keyPath, 'utf8');
        const storedHash = keyRaw.trim();

        // 将用户输入的令牌进行哈希处理
        const tokenHash = hashToken(token);

        // 和文件中存储的密文做比较
        const success = tokenHash === storedHash;

        return new Response(JSON.stringify({ success }), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.error('管理员验证失败:', err)
        return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
