---
title: "关于"
description: "写写折腾背后的思考。"
---

## 关于我

- 死宅，轻度二次元
- `vim`重度使用者
- homelab重度玩家（自认为
- ~~讨厌Vibe Coding~~
- 类原生Android系统的拥护者(注：主力系统早已转到iOS)
- 任天堂TM的就是世界的主宰！
- 任何地方都要使用[Catppuccin](https://catppuccin.com/)主题
- [GPG Key](https://github.com/2017fighting.gpg)

## 关于本站

- 框架：[Astro](https://astro.build/)
- 模版：[AstroPaper](https://astro-paper.pages.dev/)
- 托管：Cloudflare Pages
- 图片：github存储原始图片，构建后的assets存储在cloudflare R2
- mermaid渲染：[beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid)

## 为什么开设本站

罪魁祸首还是入坑NAS，机器换了一堆，系统架构也是一换再换，其中参考了不少大神的方案，当然也有自己的思考，于是想找个地方分享下。

首先肯定是要静态博客，但是框架选了半天，最开始想用`hugo`，无奈它对`mermaid`的支持不那么“原生”；后来了解到`Astro`，可以通过`rehype-mermaid`将mermaid渲染成图片，但是依赖chormium，又太重了，之后就一直搁置了。

再之后，偶然间了解到了[beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid)这个库，可以不依赖chormium，直接将mermaid渲染成svg，简直是完美，于是博客又被我提上了日程。
