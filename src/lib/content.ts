import { env } from './env';
import { groq } from './sanity';
import * as mock from './mock';
import type { Article, Destination, Faq, JobPosition, Review, SiteSettings, StoreProduct, Tour } from './types';

const wait = <T,>(v: T, ms = 350) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const getTours = (): Promise<Tour[]> =>
  env.mock ? wait(mock.mockTours) : groq<Tour[]>(`*[_type == "tour"] | order(title asc){ _id, title, slug, country, countrySlug, category, image, duration, groupSize, price, rating, reviewCount, summary, popular }`);

export const getTour = (slug: string): Promise<Tour | null> =>
  env.mock
    ? wait(mock.mockTours.find((t) => t.slug.current === slug) ?? null)
    : groq<Tour | null>(`*[_type == "tour" && slug.current == $slug][0]`, { slug });

export const getRelatedTours = (countrySlug: string, excludeSlug: string): Promise<Tour[]> =>
  env.mock
    ? wait(mock.mockTours.filter((t) => t.countrySlug === countrySlug && t.slug.current !== excludeSlug).slice(0, 3))
    : groq<Tour[]>(`*[_type == "tour" && countrySlug == $countrySlug && slug.current != $excludeSlug][0...3]`, { countrySlug, excludeSlug });

export const getDestinations = (): Promise<Destination[]> =>
  env.mock ? wait(mock.mockDestinations) : groq<Destination[]>(`*[_type == "destination"] | order(name asc){ _id, name, slug, region, heroImage, intro, bestTime, duration, priceFrom }`);

export const getDestination = (slug: string): Promise<Destination | null> =>
  env.mock
    ? wait(mock.mockDestinations.find((d) => d.slug.current === slug) ?? null)
    : groq<Destination | null>(
        `*[_type == "destination" && slug.current == $slug][0]{
          ...,
          experiences[]{ ..., tour->{ _id, title, slug, price, image, duration, country } }
        }`,
        { slug }
      );

export const getStoreProducts = (): Promise<StoreProduct[]> =>
  env.mock
    ? wait(mock.mockProducts)
    : groq<StoreProduct[]>(
        `*[_type == "storeProduct"] | order(category asc, title asc){
          _id, category, title, slug, image, description, price, popular, isFree,
          issueNumber, publishDate, sku, variants, stock
        }`
      );

const REVIEW_FIELDS = `_id, name, location, rating, title, comment, createdAt, "tour": tour->{ title, "slug": slug.current }`;

export const getReviewsForTour = (slug: string): Promise<Review[]> =>
  env.mock
    ? wait(mock.mockReviews)
    : groq<Review[]>(
        `*[_type == "review" && approved == true && tour->slug.current == $slug] | order(createdAt desc)[0...50]{ ${REVIEW_FIELDS} }`,
        { slug }
      );

export const getLatestReviews = (limit = 12): Promise<Review[]> =>
  env.mock
    ? wait(mock.mockReviews)
    : groq<Review[]>(`*[_type == "review" && approved == true] | order(createdAt desc)[0...$limit]{ ${REVIEW_FIELDS} }`, { limit });

export const getArticles = (): Promise<Article[]> =>
  env.mock ? wait(mock.mockArticles) : groq<Article[]>(`*[_type == "article"] | order(date desc){ _id, title, slug, image, excerpt, category, destination, readTime, date, featured }`);

export const getArticle = (slug: string): Promise<Article | null> =>
  env.mock
    ? wait(mock.mockArticles.find((a) => a.slug.current === slug) ?? null)
    : groq<Article | null>(`*[_type == "article" && slug.current == $slug][0]`, { slug });

export const getFaqs = (page: string): Promise<Faq[]> =>
  env.mock
    ? wait(mock.mockFaqs)
    : groq<Faq[]>(`*[_type == "faq" && (page == $page || page == "general")] | order(order asc)`, { page });

export const getOpenPositions = (): Promise<JobPosition[]> =>
  env.mock ? wait(mock.mockPositions) : groq<JobPosition[]>(`*[_type == "jobPosition" && isOpen == true] | order(order asc)`);

export const getSiteSettings = (): Promise<SiteSettings | null> =>
  env.mock ? wait(mock.mockSettings) : groq<SiteSettings | null>(`*[_type == "siteSettings"][0]`);
