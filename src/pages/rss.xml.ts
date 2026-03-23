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

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xmlEscape(SITE_TITLE)} News</title><link>${SITE_URL}</link><description>${xmlEscape(SITE_DESCRIPTION)}</description>${items}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
