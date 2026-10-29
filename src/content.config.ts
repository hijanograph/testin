import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blockSectionSchema = z.object({
  title: z.string().optional(),
  paragraphs: z.array(z.string()).default([]),
});

const blockSchema = z.object({
  image: z.string(),
  alt: z.string().optional(),
  side: z.enum(['left', 'right']).default('left'),
  sections: z.array(blockSectionSchema).default([]),
});

const proyectos = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/proyectos',
  }),

  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    tagline: z.string(),
    desc: z.string(),

    // Etiqueta y año: se muestran en el índice (/proyectos) y en la ficha.
    tipo: z.enum(['profesional', 'académico', 'personal']),
    year: z.string(),

    // Aparece en la selección de la home.
    featured: z.boolean().default(false),

    intro: z.string().optional(),
    blocks: z.array(blockSchema).default([]),

    area: z.string(),
    rol: z.string(),
    software: z.string().optional(),

    // Orden en el índice y en la navegación anterior/siguiente.
    order: z.number(),

    heroImg: z.string().optional(),
    heroAlt: z.string().optional(),

    coverImg: z.string().optional(),
    coverAlt: z.string().optional(),

    wip: z.boolean().optional().default(false),

    musicId: z.string().optional(),
  }),
});

export const collections = {
  proyectos,
};
