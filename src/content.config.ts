import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ title: z.string(), url: z.url(), publisher: z.string().optional() });

/** Long-form pages, one Markdown file per language: src/content/pages/{lang}/{slug}.md */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    lead: z.string().optional(),
    updated: z.coerce.date(),
    sources: z.array(source).default([]),
  }),
});

/** News: add a Markdown file in src/content/news/{lang}/ — no code change needed. */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Identifier shared by the translations of the same article */
    translationKey: z.string(),
    draft: z.boolean().default(false),
    sources: z.array(source).default([]),
  }),
});

export const collections = { pages, news };
