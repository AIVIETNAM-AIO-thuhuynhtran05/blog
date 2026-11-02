import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import baseLinks from './integrations/base-links.mjs';

const base = process.env.BASE_PATH || undefined;

export default defineConfig({
  // Đổi thành domain thật khi deploy (hoặc đặt biến môi trường SITE_URL)
  site: process.env.SITE_URL ?? 'https://example.com',
  // Đường dẫn con khi blog không nằm ở gốc domain, ví dụ /blog
  base,
  integrations: [sitemap(), baseLinks(base)],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
