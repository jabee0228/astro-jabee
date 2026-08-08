import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { fillAllDescriptions } from './scripts/fill-descriptions.js';

function autoFillDescriptionsIntegration() {
  return {
    name: 'auto-fill-descriptions',
    hooks: {
      'astro:config:setup': () => {
        fillAllDescriptions();
      },
      'astro:build:start': () => {
        fillAllDescriptions();
      },
      'astro:server:setup': () => {
        fillAllDescriptions();
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://jabee.net',
  image: {
    service: {
      entrypoint: './src/image-service.js'
    }
  },
  integrations: [autoFillDescriptionsIntegration(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});