import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const block = z.object({
  image: z.string(),
  alt: z.string().default(''),
  side: z.enum(['left', 'right']).optional(),
  sections: z
    .array(z.object({ title: z.string().optional(), paragraphs: z.array(z.string()).min(1) }))
    .min(1),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    intro: z.string().optional(),
    tagline: z.string(),
    desc: z.string(),
    area: z.string(),
    rol: z.string(),
    software: z.string().optional(),
    tipo: z.string().optional(), // académico / personal / profesional
    year: z.string().optional(),
    order: z.number(),
    featured: z.boolean().default(false), // aparece en la home
    wip: z.boolean().default(false),
    heroImg: z.string().optional(),
    heroAlt: z.string().optional(),
    coverImg: z.string().optional(),
    coverAlt: z.string().optional(),
    wipImg: z.string().optional(), // imagen de la página de un proyecto en proceso
    musicId: z.string().optional(),
    blocks: z.array(block).default([]),
  }),
});

export const collections = { portfolio };
