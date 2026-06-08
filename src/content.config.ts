import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Portfolio ──────────────────────────────────────────────────────────────
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title:     z.string(),
    subtitle:  z.string().optional(),
    tagline:   z.string(),
    desc:      z.string(),
    area:      z.string(),
    rol:       z.string(),
    software:  z.string(),
    order:     z.number(),
    heroImg:   z.string().optional(),
    heroAlt:   z.string().optional(),
    coverImg:  z.string().optional(),
    coverAlt:  z.string().optional(),
    wip:       z.boolean().optional().default(false),
    prevSlug:  z.string().optional(),
    prevLabel: z.string().optional(),
    nextSlug:  z.string().optional(),
    nextLabel: z.string().optional(),
  }),
});

// ── Datos de página: sobre-mí ──────────────────────────────────────────────
const sobremi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/config' }),
  schema: z.object({
    // Página "sobre mí"
    bio:        z.array(z.string()).optional(),
    photo:      z.string().optional(),
    photoAlt:   z.string().optional(),

    // Experiencia
    experience: z.array(z.object({
      role:        z.string(),
      company:     z.string(),
      period:      z.string(),
      companyDesc: z.string(),
      tasks:       z.array(z.string()),
    })).optional(),

    // Educación
    education: z.array(z.object({
      title:       z.string(),
      institution: z.string(),
      period:      z.string(),
    })).optional(),

    // Habilidades
    skills: z.array(z.string()).optional(),

    // CV — skills por categoría (para /curriculum)
    skillsSoftware: z.array(z.string()).optional(),
    skillsAreas:    z.array(z.string()).optional(),
    cvIntro:        z.string().optional(),
    cvPdfPath:      z.string().optional(),

    // Hero de la home
    heroTitle:      z.string().optional(),
    heroBio:        z.string().optional(),
    heroImg:        z.string().optional(),
    heroImgAlt:     z.string().optional(),
  }),
});

export const collections = { portfolio, sobremi };
