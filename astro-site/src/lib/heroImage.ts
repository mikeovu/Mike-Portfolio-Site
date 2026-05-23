import type { CollectionEntry } from 'astro:content';

const featureImages = import.meta.glob<{ default: ImageMetadata | string }>(
  '/src/content/posts/**/{feature.jpg,feature.jpeg,feature.png,feature.svg}',
  { eager: true }
);

export function resolveHeroImage(entry: CollectionEntry<'posts'>): string | undefined {
  if (entry.data.heroImage) {
    const img = entry.data.heroImage as unknown as ImageMetadata;
    return img.src;
  }

  const dir = entry.id.split('/').slice(0, -1).join('/');
  const extensions = ['jpg', 'jpeg', 'png', 'svg'];

  for (const ext of extensions) {
    const key = `/src/content/posts/${dir}/feature.${ext}`;
    const mod = featureImages[key];
    if (mod) {
      const val = mod.default;
      // ImageMetadata has .src, plain SVG import may be a string
      return typeof val === 'string' ? val : (val as ImageMetadata).src;
    }
  }

  return undefined;
}
