export default function initLoginIsland() {
    const form = document.getElementById('verify-form');
    const submitBtn = document.getElementById('external-submit');
    const resultEl = document.getElementById('result');
    const usernameInput = document.getElementById('username');
    const tokenInput = document.getElementById('token');

    if (!form || !submitBtn || !resultEl || !usernameInput || !tokenInput) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const token = tokenInput.value.trim();

        if (!username || !token) {
            alert('请输入用户名和验证码');
            return;
        }

        try {
            const res = await fetch('/api/totp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, token }),
            });

            const data = await res.json();
            resultEl.classList.add('show');
            resultEl.textContent = data.success ? '✅ 验证成功' : '❌ 验证失败';
        } catch (err) {
            resultEl.textContent = '⚠️ 请求失败，请稍后再试';
            resultEl.classList.add('show');
        }
    });

    submitBtn.addEventListener('click', () => {
        form.requestSubmit(); // HTML5 submit 支持
    });
}
initLoginIsland(); // 模块加载后自动执行