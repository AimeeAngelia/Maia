// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue'; // 加入这行

export default defineConfig({
    output: "server",
    integrations: [vue()], // 启用 Vue 集成
    vite: {
        server: {
            fs: {
                strict: true, // 限制访问文件路径
                allow: ['src/', 'node_modules/']
            }
        }
    }
});