import { getCollection, type CollectionEntry } from 'astro:content';

const visible = (e: { data: { draft: boolean } }) => !import.meta.env.PROD || !e.data.draft;
const newestFirst = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

export async function getPosts() {
  return (await getCollection('posts', visible)).sort(newestFirst);
}

export async function getTils() {
  return (await getCollection('til', visible)).sort(newestFirst);
}

export type Entry = {
  title: string;
  subtitle: string;
  cover?: string;
  date: Date;
  href: string;
  track: string;
  kind: 'Bài viết' | 'Ghi chú';
  featured?: boolean;
};

export function postEntry(p: CollectionEntry<'posts'>): Entry {
  const { title, description, cover, date, track, featured } = p.data;
  return { title, subtitle: description, cover, date, track, featured, href: `/blog/${p.id}`, kind: 'Bài viết' };
}

export function tilEntry(t: CollectionEntry<'til'>): Entry {
  const { title, description, cover, date, track } = t.data;
  return { title, subtitle: description, cover, date, track, href: `/til/${t.id}`, kind: 'Ghi chú' };
}

export async function getEntries() {
  const [posts, tils] = await Promise.all([getPosts(), getTils()]);
  return [...posts.map(postEntry), ...tils.map(tilEntry)].sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Ngày trong frontmatter là UTC, nên đọc theo UTC để không bị lệch ngày
export function formatDate(d: Date) {
  const [y, m, day] = d.toISOString().slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
}

export function formatMonth(d: Date) {
  return `Tháng ${d.getUTCMonth() + 1}, ${d.getUTCFullYear()}`;
}

export function readingTime(body = '') {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
