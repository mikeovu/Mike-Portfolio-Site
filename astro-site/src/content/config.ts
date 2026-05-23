import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      author: z.string().default('Mike Vu'),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      categories: z.array(z.string()).default([]),
      isSection: z.boolean().default(false),
      heroImage: image().optional(),
      // Hugo carry-over fields accepted but ignored
      subtitle: z.string().optional(),
      showEdit: z.boolean().optional(),
      sharingLinks: z.boolean().optional(),
      heroStyle: z.string().optional(),
      showHero: z.boolean().optional(),
      showTableOfContents: z.boolean().optional(),
      showAuthor: z.boolean().optional(),
      showReadingTime: z.boolean().optional(),
      showWordCount: z.boolean().optional(),
      showTaxonomies: z.boolean().optional(),
      showPagination: z.boolean().optional(),
      showBreadcrumbs: z.boolean().optional(),
    }),
});

const about = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    // Hugo carry-over fields
    layout: z.string().optional(),
    heroStyle: z.string().optional(),
    showHero: z.boolean().optional(),
    showEdit: z.boolean().optional(),
    sharingLinks: z.boolean().optional(),
  }),
});

export const collections = { posts, about };
