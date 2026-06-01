import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";
import { rehypeMermaid } from "./src/utils/rehype/beautiful-mermaid";
import rehypeUnwrapImages from "rehype-unwrap-images";

import react from "@astrojs/react";

export default defineConfig({
  site: config.site.url,
  trailingSlash: "never",
  build: {
    assetsPrefix: "https://assets.raenzo.com",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
    react(),
  ],
  i18n: {
    locales: ["en", "zh-CN"],
    defaultLocale: "zh-CN",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid"],
    },
    processor: unified({
      remarkPlugins: [],
      rehypePlugins: [
        rehypeUnwrapImages,
        [rehypeMermaid, { className: "astro-code" }],
      ],
    }),
    shikiConfig: {
      themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.PUBLIC_COMMIT_ID": JSON.stringify(
        process.env.COMMIT_ID ||
          (await import("child_process"))
            .execSync("git rev-parse --short HEAD")
            .toString()
            .trim()
      ),
    },
  },
  fonts: [
    {
      name: "Noto Sans SC",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
