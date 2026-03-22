import { defineCollection, z } from "astro:content";

const datedListFields = {
  title: z.string(),
  pubDate: z.coerce.date().optional(),
  date: z.coerce.date().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  cover: z.string().optional(),
};

const news = defineCollection({
  type: "content",
  schema: z.object({
    ...datedListFields,
    source: z.string().optional(),
  }).passthrough(),
});

const wiki = defineCollection({
  type: "content",
  schema: z.object({
    ...datedListFields,
  }).passthrough(),
});

const stories = defineCollection({
  type: "content",
  schema: z.object({
    ...datedListFields,
  }).passthrough(),
});

const doujin = defineCollection({
  type: "content",
  schema: z.object({
    ...datedListFields,
  }).passthrough(),
});

const movies = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string(),
    link: z.string(),
  }).passthrough(),
});

const entries = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }).passthrough(),
});

const lore = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    pin: z.boolean().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

export const collections = {
  news,
  wiki,
  stories,
  doujin,
  movies,
  entries,
  lore,
};
