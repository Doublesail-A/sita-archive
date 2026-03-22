import { getCollection } from "astro:content";
import { compareDateDesc, encodeSlug, toDate } from "./format";

export type SiteCollection = "news" | "wiki" | "stories" | "doujin" | "entries" | "lore";
export type HomeCollection = "news" | "wiki" | "stories" | "doujin";

export type ContentCard = {
  collection: SiteCollection;
  slug: string;
  url: string;
  title: string;
  date?: Date;
  description?: string;
  summary?: string;
  tags: string[];
  cover?: string;
  hasPreview: boolean;
};

export type MovieCard = {
  slug: string;
  title: string;
  date?: Date;
  description?: string;
  tags: string[];
  cover: string;
  link: string;
};

const TAGGABLE_COLLECTIONS: SiteCollection[] = ["news", "wiki", "stories", "doujin", "entries", "lore"];

function getTags(data: Record<string, unknown>): string[] {
  return Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [];
}

function getTitle(slug: string, data: Record<string, unknown>): string {
  return typeof data.title === "string" && data.title.trim() ? data.title : slug;
}

function getDescription(data: Record<string, unknown>): string | undefined {
  if (typeof data.description === "string" && data.description.trim()) return data.description;
  if (typeof data.summary === "string" && data.summary.trim()) return data.summary;
  return undefined;
}

function getSummary(data: Record<string, unknown>): string | undefined {
  return typeof data.summary === "string" && data.summary.trim() ? data.summary : getDescription(data);
}

function getDate(data: Record<string, unknown>): Date | undefined {
  return toDate(data.pubDate) ?? toDate(data.date);
}

function getCover(data: Record<string, unknown>): string | undefined {
  return typeof data.cover === "string" && data.cover.trim() ? data.cover : undefined;
}

function hasPreview(collection: SiteCollection, tags: string[], cover?: string): boolean {
  if (!cover) return false;
  if (collection === "stories" || collection === "doujin") return true;
  return tags.some((tag) => tag.toLowerCase() === "img");
}

export function collectionEntryUrl(collection: SiteCollection, slug: string): string {
  return `/${collection}/${encodeSlug(slug)}/`;
}

function toCard(collection: SiteCollection, entry: any): ContentCard {
  const data = (entry?.data ?? {}) as Record<string, unknown>;
  const tags = getTags(data);
  const cover = getCover(data);
  return {
    collection,
    slug: String(entry.slug),
    url: collectionEntryUrl(collection, String(entry.slug)),
    title: getTitle(String(entry.slug), data),
    date: getDate(data),
    description: getDescription(data),
    summary: getSummary(data),
    tags,
    cover,
    hasPreview: hasPreview(collection, tags, cover),
  };
}

function sortCardsByDateDesc<T extends { date?: Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => compareDateDesc(a.date, b.date));
}

function sortEntriesByDateDesc<T extends { data: Record<string, unknown> }>(items: T[]): T[] {
  return [...items].sort((a, b) => compareDateDesc(a.data.pubDate, b.data.pubDate) || compareDateDesc(a.data.date, b.data.date));
}

export async function getNewsEntries() {
  return sortEntriesByDateDesc(await getCollection("news"));
}

export async function getWikiEntries() {
  return sortEntriesByDateDesc(await getCollection("wiki"));
}

export async function getStoriesEntries() {
  return sortEntriesByDateDesc(await getCollection("stories"));
}

export async function getDoujinEntries() {
  return sortEntriesByDateDesc(await getCollection("doujin"));
}

export async function getMovieEntries() {
  const entries = await getCollection("movies");
  return sortEntriesByDateDesc(entries).map((entry) => ({
    slug: String(entry.slug),
    title: entry.data.title,
    date: toDate(entry.data.pubDate) ?? toDate(entry.data.date),
    description: entry.data.description,
    tags: Array.isArray(entry.data.tags) ? entry.data.tags : [],
    cover: entry.data.cover,
    link: entry.data.link,
  })) as MovieCard[];
}

export async function getEntryEntries() {
  const entries = await getCollection("entries");
  return [...entries].sort((a, b) => a.data.title.localeCompare(b.data.title, "zh-Hans-CN"));
}

export async function getLoreEntries() {
  const entries = await getCollection("lore");
  return [...entries].sort((a, b) => {
    const ap = a.data.pin ? 1 : 0;
    const bp = b.data.pin ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return compareDateDesc(a.data.date, b.data.date);
  });
}

export async function getCollectionCards(collection: SiteCollection): Promise<ContentCard[]> {
  switch (collection) {
    case "news":
      return (await getNewsEntries()).map((entry) => toCard("news", entry));
    case "wiki":
      return (await getWikiEntries()).map((entry) => toCard("wiki", entry));
    case "stories":
      return (await getStoriesEntries()).map((entry) => toCard("stories", entry));
    case "doujin":
      return (await getDoujinEntries()).map((entry) => toCard("doujin", entry));
    case "entries":
      return (await getEntryEntries()).map((entry) => toCard("entries", entry));
    case "lore":
      return (await getLoreEntries()).map((entry) => toCard("lore", entry));
  }
}

export async function getImportantHomeCards(collection: HomeCollection, limit = 3): Promise<ContentCard[]> {
  const cards = await getCollectionCards(collection);
  return sortCardsByDateDesc(cards.filter((card) => card.tags.some((tag) => tag.toLowerCase() === "important"))).slice(0, limit);
}

export async function getAllTaggableCards(): Promise<ContentCard[]> {
  const groups = await Promise.all(TAGGABLE_COLLECTIONS.map((collection) => getCollectionCards(collection)));
  return sortCardsByDateDesc(groups.flat());
}

export async function getAllTags(): Promise<string[]> {
  const cards = await getAllTaggableCards();
  return Array.from(new Set(cards.flatMap((card) => card.tags))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

export async function getTagCards(tag: string): Promise<ContentCard[]> {
  const normalized = tag.toLowerCase();
  const cards = await getAllTaggableCards();
  return cards.filter((card) => card.tags.some((item) => item.toLowerCase() === normalized));
}
