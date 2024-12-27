import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "领域驱动设计指南",
  description: "与时俱进的DDD实践指南",
  base: "/ddd-guideline/",
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
          { text: '总览', link: '/main' },
          { text: 'DDD历史', link: '/history' },
          { 
            text: '建模', 
            link: '/modeling',
            items: [
              {
                text: "事件风暴",
                link: "/modeling/event-storming"
              }
            ]
          },
          { 
            text: '实现', 
            link: '/impl',
            items: [
              {
                text: "架构模式",
                link: "/impl/arch-pattern"
              },
              {
                text: "java",
                link: "/impl/java"
              },
              {
                text: "go",
                link: "/impl/go"
              }
            ]
          },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
