<template>
  <div id="admin-register">
    <h1>管理员注册</h1>
    <div class="placeholder"></div>
    <!-- 阶段一：管理员身份验证 -->
    <div class="v-flex" v-if="!verified">
      <p>请输入Maia令牌以继续：</p>
      <div class="placeholder"></div>
      <input v-model="adminToken" @keydown.enter="verifyAdmin" placeholder="Maia令牌" />
      <div class="placeholder"></div>
      <button @click="verifyAdmin" class="centre">验证身份</button>

    </div>

    <!-- 阶段二：展示二维码绑定 -->
    <div class="v-flex" v-else>
      <p>请输入新管理员用户名：</p>
      <div class="placeholder"></div>
      <input v-model="newUsername" @keydown.enter="requestQrCode" placeholder="用户名" />
      <div class="placeholder"></div>
      <button @click="requestQrCode" class="centre">生成绑定二维码</button>

    </div>

    <div class="placeholder" v-if="qrCodeUrl"></div>

    <!-- 二维码 -->
    <div class="v-flex" v-if="qrCodeUrl">
      <p>请用 Google Authenticator 扫码绑定：</p>
      <div class="placeholder"></div>
      <img :src="qrCodeUrl" alt="绑定二维码" class="centre" />
      <div class="placeholder"></div>
    </div>

<!--    <div v-if="adminError" class="placeholder"></div>-->
    <p v-if="adminError" class="error">{{ adminError }}</p>
<!--    <div v-if="adminError" class="placeholder"></div>-->
    <p v-if="registerError" class="error">{{ registerError }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const adminToken = ref('');
const verified = ref(false);
const adminError = ref('');

const newUsername = ref('');
const qrCodeUrl = ref('');
const registerError = ref('');

// const adminError = ref('');

// 阶段一：验证管理员令牌
const verifyAdmin = async () => {
  try {
    const res = await fetch('/api/totp/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken.value })
    });
    const data = await res.json();
    if (data.success) {
      verified.value = true;
      adminError.value = '';
    } else {
      adminError.value = '❌ 验证失败，请检查令牌';
      setTimeout(() => {
        adminError.value = '';
      }, 3000);
    }
  } catch {
    adminError.value = '⚠️ 服务器错误，请稍后重试';
    setTimeout(() => {
      adminError.value = '';
    }, 3000);

  }
};

// 阶段二：请求二维码
const requestQrCode = async () => {
  try {
    const res = await fetch('/api/totp/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername.value })
    });
    const data = await res.json();
    if (data.success) {
      qrCodeUrl.value = data.qr;
      registerError.value = '';
    } else {
      registerError.value = `❌ ${data.error || '注册失败'}`;
      setTimeout(() => {
        registerError.value = '';
      }, 3000);
    }
  } catch {
    registerError.value = '⚠️ 注册请求失败';
    setTimeout(() => {
      registerError.value = '';
    }, 3000);
  }
};
</script>

<style scoped>
@import "/src/styles/admin/registerIsland.css";
</style>
