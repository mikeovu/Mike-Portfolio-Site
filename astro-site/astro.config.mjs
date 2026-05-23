import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import emoji from 'remark-emoji';

export default defineConfig({
  site: 'https://mikeavuportfolio.com',
  trailingSlash: 'always',
  integrations: [tailwind(), mdx()],
  markdown: {
    remarkPlugins: [emoji],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
