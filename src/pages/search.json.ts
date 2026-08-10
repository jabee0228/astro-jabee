import { getCollection } from 'astro:content';
import { getPostDescription } from '../utils/description';

export async function GET() {
  const posts = await getCollection('notes', ({ data }) => import.meta.env.PROD ? data.draft !== true : true);

  const formattedPosts = posts.map(post => ({
    title: post.data.title,
    slug: post.id.replace(/\/(?:index)?\.mdx?$/, '').replace(/\.mdx?$/, ''),
    description: getPostDescription(post),
    body: post.body || '',
    categories: post.data.categories || [],
    tags: post.data.tags || [],
    date: post.data.date,
  }));

  return new Response(JSON.stringify(formattedPosts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
