import { authenticator } from 'otplib'
import fs from 'fs'

import path from 'path'

export const prerender = false

export async function POST({ request }) {
    let username = ''
    let token = ''

    // 🧾 提取 JSON 请求体
    try {
        const body = await request.json()
        username = body.username
        token = body.token
    } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    if (!username || !token) {
        return new Response(JSON.stringify({ success: false, error: 'Missing username or token' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    // 📂 读取多用户密钥文件
    let secrets
    try {
        const filePath = path.resolve('./private/totp-secrets.json')
        secrets = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    } catch {
        return new Response(JSON.stringify({ success: false, error: 'Cannot read secrets' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const secret = secrets[username]
    if (!secret) {
        return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    // 🔐 校验 TOTP
    const isValid = authenticator.check(token, secret)

    return new Response(JSON.stringify({ success: isValid }), {
        headers: { 'Content-Type': 'application/json' }
    })
}
