import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../lib/site";
import { compareDateDesc, toDate } from "../lib/format";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async () => {
  const entries = [...await getCollection("news")]
    .sort((a, b) => compareDateDesc(a.data.pubDate ?? a.data.date, b.data.pubDate ?? b.data.date))
    .slice(0, 30);

  const items = entries.map((entry) => {
    const title = xmlEscape(entry.data.title);
    const description = xmlEscape(entry.data.description ?? "");
    const link = new URL(`/news/${encodeURIComponent(entry.slug)}/`, SITE_URL).toString();
    const pubDate = (toDate(entry.data.pubDate) ?? toDate(entry.data.date) ?? new Date()).toUTCString();
    return `<item><title>${title}</title><link>${link}</link><guid>${link}</guid><pubDate>${pubDate}</pubDate><description>${description}</description></item>`;
  }).join("");

  const latestDate = entries[0]
    ? (toDate(entries[0].data.pubDate) ?? toDate(entries[0].data.date) ?? new Date()).toUTCString()
    : new Date().toUTCString();
  const selfUrl = new URL("/rss.xml", SITE_URL).toString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xmlEscape(SITE_TITLE)} News</title><link>${SITE_URL}</link><description>${xmlEscape(SITE_DESCRIPTION)}</description><language>zh-CN</language><lastBuildDate>${latestDate}</lastBuildDate><atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />${items}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
