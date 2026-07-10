import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  const sortedPosts = posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "Xiaopi's Blog",
    description: 'Sharing tech, life & thoughts',
    site: context.site ?? 'https://xiaopi.blog',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.data.lang}/posts/${post.id}/`,
    })),
    customData: '<language>zh-cn</language>',
  });
}
