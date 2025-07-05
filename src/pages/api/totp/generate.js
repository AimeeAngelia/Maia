import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import fs from 'fs'

export async function GET() {
    const secret = authenticator.generateSecret()

    // 保存 secret 到本地文件（仅测试用）
    fs.writeFileSync('./totp-secret.txt', secret)

    const otpauth = authenticator.keyuri('admin', 'MaiaAdmin', secret)
    const qr = await qrcode.toDataURL(otpauth)

    return new Response(JSON.stringify({ qr }), {
        headers: { 'Content-Type': 'application/json' }
    })
}
