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
                text: "面向对象领域模型",
                link: "/modeling/oo",
                items: [
                  {
                    text: "领域事件",
                    link: "/modeling/oo/domain-event"
                  },
                  {
                    text: "领域命令",
                    link: "/modeling/oo/domain-command"
                  },
                  {
                    text: "聚合",
                    link: "/modeling/oo/domain-aggregate"
                  },
                  {
                    text: "实体",
                    link: "/modeling/oo/domain-entity"
                  },
                  {
                    text: "值对象",
                    link: "/modeling/oo/domain-valueobject"
                  },
                  {
                    text: "领域服务",
                    link: "/modeling/oo/domain-service"
                  }
                ]
              },
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
                link: "/impl/arch-pattern",
                items: [
                  {
                    text: "端口适配器",
                    link: "/impl/arch-pattern/ports-and-adapters"
                  },
                  {
                    text: "命令与查询职责分离",
                    link: "/impl/arch-pattern/cqrs"
                  },
                  {
                    text: "事件溯源",
                    link: "/impl/arch-pattern/event-sourcing"
                  },
                  {
                    text: "ORM",
                    link: "/impl/arch-pattern/orm"
                  },
                  {
                    text: "事务",
                    link: "/impl/arch-pattern/transaction"
                  },
                  {
                    text: "发件箱",
                    link: "/impl/arch-pattern/outbox"
                  },
                  {
                    text: "四层架构",
                    link: "/impl/arch-pattern/four-layer"
                  },
                ]
              },
              {
                text: "领域对象",
                link: "/impl/domain-objects",
                items: [
                  {
                    text: "命令",
                    link: "/impl/domain-objects/command"
                  },
                  {
                    text: "聚合",
                    link: "/impl/domain-objects/agg"
                  },
                  {
                    text: "仓储",
                    link: "/impl/domain-objects/repo"
                  },
                ]
              },
              {
                text: "技术栈",
                link: "/impl/tech",
                items: [
                  {
                    text: "java",
                    link: "/impl/tech/java"
                  },
                  {
                    text: "go",
                    link: "/impl/tech/go"
                  }
                ]
              }
            ]
          },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ddd-fans/ddd-guideline' }
    ]
  }
})
