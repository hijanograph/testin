import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ── Portfolio ──────────────────────────────────────────────────────────────
const portfolio = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/portfolio',
  }),

  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    tagline: z.string(),
    desc: z.string(),

    area: z.string(),
    rol: z.string(),
    software: z.string(),

    order: z.number(),

    heroImg: z.string().optional(),
    heroAlt: z.string().optional(),

    coverImg: z.string().optional(),
    coverAlt: z.string().optional(),

    wip: z.boolean().optional().default(false),

    musicId: z.string().optional(),

    prevSlug: z.string().optional(),
    prevLabel: z.string().optional(),

    nextSlug: z.string().optional(),
    nextLabel: z.string().optional(),
  }),
});

export const collections = {
  portfolio,
};
