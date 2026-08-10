import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';

async function test() {
  const posts = await getCollection('notes');
  const post = posts[0];
  const { Content } = await render(post);
  const container = await AstroContainer.create();
  const html = await container.renderToString(Content);
  console.log(html.substring(0, 200));
}

test();
