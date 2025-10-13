export default {
  label: "English(AI)",
  lang: "en",
  title: "pipel-vue",
  description: "Pipel-based Streaming Programming Library for Vue",

  themeConfig: {
    nav: [
      { text: "Guide", link: "/en/guide/introduce" },
      { text: "API", link: "/en/usePipel/index" },
      { text: "Try", link: "/en/guide/try" },
      {
        text: "changelog",
        link: "https://github.com/pipeljs/pipel-vue/blob/master/CHANGELOG.md",
      },
      { text: "pipeljs", link: "https://pipeljs.github.io/pipel-doc/" },
    ],
    sidebar: {
      "/en/": [
        {
          text: "Guide",
          items: [
            { text: "Introduction", link: "/en/guide/introduce" },
            { text: "Why", link: "/en/guide/motion" },
            { text: "Quick", link: "/en/guide/quick" },
            { text: "Debug", link: "/en/guide/debug" },
            { text: "Reactive", link: "/en/guide/reactive" },
            { text: "Render", link: "/en/guide/render" },
            { text: "Immutable", link: "/en/guide/immutable" },
            { text: "Pinia", link: "/en/guide/pinia" },
          ],
        },
        {
          text: "API",
          items: [
            {
              text: "pipeljs",
              link: "/en/usePipel/index.html",
            },
            {
              text: "useFetch",
              collapsed: true,
              items: [
                { text: "API", link: "/en/useFetch/api.html" },
                { text: "Introduction", link: "/en/useFetch/introduce.html" },
                { text: "Usage", link: "/en/useFetch/use.html" },
                { text: "Cache", link: "/en/useFetch/cache.html" },
                { text: "Refresh", link: "/en/useFetch/refresh.html" },
                { text: "Condition", link: "/en/useFetch/condition.html" },
                { text: "Retry", link: "/en/useFetch/retry.html" },
                { text: "Debounce", link: "/en/useFetch/debounce.html" },
                { text: "Throttle", link: "/en/useFetch/throttle.html" },
                { text: "Stream", link: "/en/useFetch/stream.html" },
              ],
            },
          ],
        },
      ],
    },
  },
};
