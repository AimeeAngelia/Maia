// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue'; // 加入这行

export default defineConfig({
    integrations: [vue()] // 启用 Vue 集成
});
