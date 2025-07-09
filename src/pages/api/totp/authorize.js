import fs from 'fs/promises'
import path from 'path'

export const prerender = false

export async function POST({ request }) {
    try {
        const { token } = await request.json()

        if (!token) {
            return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // 📂 读取超级管理员密钥文件
        const keyPath = path.resolve('./private/super-admin.key')
        const keyRaw = await fs.readFile(keyPath, 'utf8')
        const adminSecret = keyRaw.trim() // 防止换行或空格影响

        const success = token === adminSecret

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
