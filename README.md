# Maia
河南大学网站工作室

/src
├── pages
│   ├── index.astro                  # 首页
│   ├── about.astro                  # 关于我们 联系我们
│   ├── departments/
│   │   ├── index.astro              # 部门总览
│   │   ├── tech.astro               # 技术部
│   │   ├── ...
│   ├── forum/
│   │   ├── index.astro              # 论坛首页
│   │   ├── [category].astro         # 每个分类的帖子列表
│   │   ├── post/
│   │   │   ├── [id].astro           # 帖子详情页（含评论展示）
│   │   │   ├── new.astro            # 发帖页
│   ├── admin/
│   │   ├── index.astro              # 后台入口（评论帖子审核）
│   └── search.astro                 # 搜索页面
│
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   └── ...
│
├── layouts/
│   └── BaseLayout.astro
│
├── data/
│   └── posts.json                   # 帖子数据
│   └── comments.json
│
└── styles/
    └── global.css                   # 样式