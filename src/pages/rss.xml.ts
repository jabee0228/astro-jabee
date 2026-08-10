import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';
import { getPostDescription } from '../utils/description';

import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
const parser = new MarkdownIt();

export async function GET(context) {
  const posts = (await getCollection('notes', ({ data }) => import.meta.env.PROD ? data.draft !== true : true)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const getSlug = (id) => id.replace(/\/(?:index)?\.mdx?$/, '').replace(/\.mdx?$/, '');

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site || SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: getPostDescription(post),
      link: `/notes/${getSlug(post.id)}/`,
      categories: [...(post.data.categories || []), ...(post.data.tags || [])],
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
    })),
    customData: `<language>zh-TW</language>`,
  });
}
