window.addEventListener('DOMContentLoaded', () => {
    const qr = document.getElementById('qr');
    fetch('/api/totp/generate')
        .then(res => res.json())
        .then(data => {
            if (qr) qr.src = data.qr;
        });

    const form = document.getElementById('verify-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('token');
        if (!tokenInput) return;
        const token = tokenInput.value.trim();
        if (!token) {
            alert('请输入验证码');
            return;
        }
        const res = await fetch('/api/totp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        const result = await res.json();
        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.textContent = result.success ? '✅ 验证成功' : '❌ 验证失败';
        }
    });
});