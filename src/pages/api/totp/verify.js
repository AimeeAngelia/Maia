import { authenticator } from 'otplib'
import fs from 'fs'

export async function POST({ request }) {
    const body = await request.json()
    const { token } = body

    // 从文件读取 secret
    const secret = fs.readFileSync('./totp-secret.txt', 'utf8')

    const isValid = authenticator.check(token, secret)

    return new Response(JSON.stringify({ success: isValid }), {
        headers: { 'Content-Type': 'application/json' }
    })
}
