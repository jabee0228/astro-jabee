import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('notes');

  const formattedPosts = posts.map(post => ({
    title: post.data.title,
    slug: post.id.replace(/\/(?:index)?\.mdx?$/, '').replace(/\.mdx?$/, ''),
    description: post.data.description || '',
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
