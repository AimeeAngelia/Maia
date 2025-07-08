<template>
  <div id="main-login">
      <h1>管理员登录</h1>
      <div class="placeholder"></div>
      <form @submit.prevent="handleSubmit" id="verify-form">
        <label for="username">用户名：</label>
        <input type="text" id="username" v-model="username" required />
        <br />
        <label for="token">验证码：</label>
        <input type="text" id="token" v-model="token" required />
      </form>
      <div class="placeholder"></div>
      <button @click="triggerSubmit" id="external-submit">验证</button>
      <p id="result" v-if="result" class="show">{{ result }}</p>
  </div>
</template>


<script setup>
import { ref } from 'vue';

const username = ref('');
const token = ref('');
const result = ref('');

const handleSubmit = async () => {
  if (!username.value || !token.value) {
    // alert('请输入用户名和验证码');
    return;
  }

  try {
    const res = await fetch('/api/totp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, token: token.value }),
    });

    const data = await res.json();
    result.value = data.success ? '✅ 验证成功' : '❌ 验证失败';
    setTimeout(() => {
      result.value = '';
    }, 3000);
  } catch (err) {
    result.value = '⚠️ 请求失败';
  }
};

const triggerSubmit = () => {
  handleSubmit();
};
</script>

<style scoped>
@import "/src/styles/admin/loginIsland.css";
</style>
