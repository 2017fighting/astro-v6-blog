import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://www.raenzo.com/",
    title: "AstroPaper",
    description: "A minimal, responsive and SEO-friendly Astro blog theme.",
    author: "Ryan Valor",
    profile: "https://satna.ing",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/2017fighting/astro-v6-blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/2017fighting/" },
    // { name: "x",        url: "https://x.com/username" },
    // { name: "linkedin", url: "https://www.linkedin.com/in/username/" },
    { name: "mail",     url: "mailto:hello@raenzo.com" },
  ],
  shareLinks: [
    // { name: "whatsapp", url: "https://wa.me/?text=" },
    // { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    // { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    // { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:hello@raenzo.com?subject=See%20this%20post&body=" },
  ],
});