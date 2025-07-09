import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import fs from 'fs'

import path from 'path';

const secretPath = path.resolve(process.cwd(), 'private/totp-secrets.json');

export const prerender = false;

export async function POST({ request }) {
    let username = '';

    // 提取请求体中的用户名
    try {
        const body = await request.json();
        username = body.username;
    } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 校验用户名
    if (!username || typeof username !== 'string') {
        return new Response(JSON.stringify({ success: false, error: 'Missing or invalid username' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 读取现有密钥映射
    let secrets = {};
    try {
        const raw = fs.readFileSync(secretPath, 'utf8');
        secrets = JSON.parse(raw);
    } catch {
        // 文件不存在或解析失败，默认为空对象
        secrets = {};
    }

    // 如果用户名已存在，返回冲突错误
    if (secrets[username]) {
        return new Response(JSON.stringify({ success: false, error: 'User already exists' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 生成新密钥
    const secret = authenticator.generateSecret();
    secrets[username] = secret;

    // 写回 JSON 文件
    fs.writeFileSync(secretPath, JSON.stringify(secrets, null, 2));

    // 构造 OTP URI 并生成二维码
    const otpauth = authenticator.keyuri(username, 'MaiaAdmin', secret);
    const qr = await qrcode.toDataURL(otpauth);

    return new Response(JSON.stringify({ success: true, qr }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
