import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getAllTags } from "../lib/content";
import { SITE_URL } from "../lib/site";
import { toDate } from "../lib/format";

const STATIC_PATHS = [
  "/",
  "/news/",
  "/wiki/",
  "/stories/",
  "/doujin/",
  "/music/",
  "/about/",
  "/entries/",
  "/lore/",
];

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlNode(pathname: string, lastmod?: Date): string {
  const loc = new URL(pathname, SITE_URL).toString();
  const lastmodNode = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";
  return `<url><loc>${xmlEscape(loc)}</loc>${lastmodNode}</url>`;
}

export const GET: APIRoute = async () => {
  const [news, wiki, stories, doujin, entries, lore, tags] = await Promise.all([
    getCollection("news"),
    getCollection("wiki"),
    getCollection("stories"),
    getCollection("doujin"),
    getCollection("entries"),
    getCollection("lore"),
    getAllTags(),
  ]);

  const urls: string[] = [];

  for (const path of STATIC_PATHS) urls.push(urlNode(path));

  for (const tag of tags) {
    urls.push(urlNode(`/tag/${encodeURIComponent(tag)}/`));
  }

  for (const entry of news) {
    urls.push(urlNode(`/news/${encodeURIComponent(entry.slug)}/`, toDate(entry.data.pubDate) ?? toDate(entry.data.date)));
  }

  for (const entry of wiki) {
    urls.push(urlNode(`/wiki/${encodeURIComponent(entry.slug)}/`, toDate(entry.data.pubDate) ?? toDate(entry.data.date)));
  }

  for (const entry of stories) {
    urls.push(urlNode(`/stories/${encodeURIComponent(entry.slug)}/`, toDate(entry.data.pubDate) ?? toDate(entry.data.date)));
  }

  for (const entry of doujin) {
    urls.push(urlNode(`/doujin/${encodeURIComponent(entry.slug)}/`, toDate(entry.data.pubDate) ?? toDate(entry.data.date)));
  }

  for (const entry of entries) {
    urls.push(urlNode(`/entries/${encodeURIComponent(entry.slug)}/`));
  }

  for (const entry of lore) {
    urls.push(urlNode(`/lore/${encodeURIComponent(entry.slug)}/`, toDate(entry.data.date)));
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
