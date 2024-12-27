import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "领域驱动设计指南",
  description: "与时俱进的DDD实践指南",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '阅读指南', link: '/main' }
    ],

    sidebar: [
      {
        text: '目录',
        items: [
          { text: '指南', link: '/main' },
          { text: 'DDD历史', link: '/history' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
