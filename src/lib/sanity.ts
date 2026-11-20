import imageUrlBuilder from '@sanity/image-url';
import type { ImageSource } from 'expo-image';
import { env } from './env';
import type { Img } from './types';

const builder = env.sanityProjectId
  ? imageUrlBuilder({ projectId: env.sanityProjectId, dataset: env.sanityDataset })
  : null;

/** Fetches from Sanity's public CDN API, the same data the website reads. */
export async function groq<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const qs = new URLSearchParams({ query });
  for (const [k, v] of Object.entries(params)) qs.set(`$${k}`, JSON.stringify(v));
  const url = `https://${env.sanityProjectId}.apicdn.sanity.io/v2024-01-01/data/query/${env.sanityDataset}?${qs.toString()}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    console.warn('[sanity] network error', url.slice(0, 120), e);
    throw new Error('Could not reach the content server. Check your internet connection.');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn(`[sanity] ${res.status} for project "${env.sanityProjectId}" dataset "${env.sanityDataset}"`, body.slice(0, 300));
    throw new Error(`Content request failed (${res.status})`);
  }
  const json = await res.json();
  return json.result as T;
}

/** Turns a CMS image (or a bundled sample image) into something expo-image can show. */
export function imageSource(img: Img | string | null | undefined, width = 900): ImageSource | undefined {
  if (!img) return undefined;
  if (typeof img === 'string') return { uri: img };
  if ('local' in img) return img.local as ImageSource;
  if (!builder) return undefined;
  return { uri: builder.image(img).width(width).auto('format').fit('max').quality(78).url() };
}

/** Plain URL (used when the booking API wants a CDN image address). */
export function imageUrl(img: Img | null | undefined, width = 600): string | undefined {
  if (!img || 'local' in img || !builder) return undefined;
  return builder.image(img).width(width).auto('format').url();
}
