<template>
  <button id="dark-toggle" @click="toggleTheme">
    {{ isDark ? '🌞 亮色' : '🌙 暗色' }}
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDark = ref(true); // ✅ 默认就是暗色模式

const getCookieTheme = () => {
  const match = document.cookie.match(/(?:^|;\s*)theme=(dark|light)/);
  return match ? match[1] : null;
};

const setCookieTheme = (value) => {
  document.cookie = `theme=${value}; path=/; max-age=31536000`;
};

const applyTheme = (darkMode) => {
  document.documentElement.classList.toggle('dark', darkMode);
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme(isDark.value);
  setCookieTheme(isDark.value ? 'dark' : 'light');
};

onMounted(() => {
  const saved = getCookieTheme();
  if (saved === 'light') {
    isDark.value = false;
    applyTheme(false);
  } else {
    applyTheme(true); // ✅ 强化暗色状态，保证同步
  }
});
</script>

<style scoped>
#dark-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 999;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

#dark-toggle:hover {
  background-color: #ddd;
}

.dark #dark-toggle {
  background-color: #333;
  color: white;
  border-color: #666;
}
</style>
