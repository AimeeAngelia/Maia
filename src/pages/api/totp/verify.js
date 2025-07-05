import { authenticator } from 'otplib'
import fs from 'fs'

export const prerender = false;


export async function POST({ request }) {
    let token = ''
    try {
        const body = await request.json()
        token = body.token
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    if (!token) {
        return new Response(JSON.stringify({ success: false, error: 'Token missing' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const secret = fs.readFileSync('./totp-secret.txt', 'utf8')
    const isValid = authenticator.check(token, secret)

    return new Response(JSON.stringify({ success: isValid }), {
        headers: { 'Content-Type': 'application/json' }
    })
}

