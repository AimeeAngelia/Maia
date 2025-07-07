在项目根目录执行npm install otplib qrcode
执行npm install @astrojs/vue


原astro.config.mjs：// @ts-check
                  import { defineConfig } from 'astro/config';

                  // https://astro.build/config
                  export default defineConfig({});
现astro.config.mjs：// @ts-check
                  import { defineConfig } from 'astro/config';
                  import vue from '@astrojs/vue'; // 加入这行

                  export default defineConfig({
                      integrations: [vue()] // 启用 Vue 集成
                  });
为了观察方便，astro.config.mjs同级有文件old.astro.config.mjs来对比

