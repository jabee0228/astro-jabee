import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jabee.net',
  image: {
    service: {
      entrypoint: './src/image-service.js'
    }
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});