import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, getTils } from '../lib/content';
import { base } from '../lib/paths';
import { site } from '../site.config';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const tils = await getTils();
  const items = [
    ...posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `${base}/blog/${p.id}/`,
    })),
    ...tils.map((t) => ({
      title: t.data.title,
      pubDate: t.data.date,
      link: `${base}/til/${t.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items,
  });
}
