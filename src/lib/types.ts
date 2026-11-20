import type { ImageSourcePropType } from 'react-native';

/** A Sanity image reference, or a bundled local image (used by sample data). */
export type Img = { asset: { _ref: string } } | { local: ImageSourcePropType };

export interface Tour {
  _id: string;
  title: string;
  slug: { current: string };
  country: string;
  countrySlug: string;
  category?: string;
  image?: Img;
  gallery?: Img[];
  duration?: string;
  groupSize?: string;
  price: number; // GBP per person
  rating?: number;
  reviewCount?: number;
  summary?: string;
  highlights?: string[];
  includes?: string[];
  popular?: boolean;
}

export interface City {
  name: string;
  blurb?: string;
  image?: Img;
  gallery?: Img[];
}

export interface Experience {
  title: string;
  blurb?: string;
  image?: Img;
  tour?: Pick<Tour, '_id' | 'title' | 'slug' | 'price' | 'image' | 'duration' | 'country'> | null;
  href?: string;
}

export interface Destination {
  _id: string;
  name: string;
  slug: { current: string };
  region?: string;
  heroImage?: Img;
  intro?: string;
  bestTime?: string;
  duration?: string;
  priceFrom?: string;
  cities?: City[];
  thingsToDo?: string[];
  experiences?: Experience[];
  food?: { name: string; desc?: string }[];
  travelTips?: string[];
}

export interface Review {
  _id: string;
  name: string;
  location?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  tour?: { title: string; slug: string };
}

export interface StoreProduct {
  _id: string;
  category: 'magazine' | 'merchandise';
  title: string;
  slug: { current: string };
  image?: Img;
  description: string;
  price?: number;
  popular?: boolean;
  isFree?: boolean;
  issueNumber?: string;
  publishDate?: string;
  sku?: string;
  variants?: { label: string; stock?: number }[];
  stock?: number;
}

export interface PortableBlock {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  children?: { _type: string; text: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
  quote?: string;
  author?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  image?: Img;
  excerpt: string;
  body?: PortableBlock[];
  category: string;
  destination?: string;
  readTime?: number;
  date: string;
  featured?: boolean;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  page?: string;
}

export interface JobPosition {
  _id: string;
  title: string;
  slug: { current: string };
  team?: string;
  location?: string;
  commitment?: string;
  summary: string;
  isOpen?: boolean;
}

export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  socials?: { platform: string; url: string }[];
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
}

export interface Customer {
  _id: string;
  name?: string;
  email: string;
  provider?: string;
  nationality?: string;
  dateOfBirth?: string;
  phoneDialCode?: string;
  phoneNumber?: string;
  address?: { line1?: string; line2?: string; city?: string; region?: string; postalCode?: string; country?: string };
  emergencyContact?: { name?: string; relationship?: string; phone?: string };
  travelNotes?: string;
  avatarUrl?: string | null;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'review' | string;
export type PaymentProvider = 'stripe' | 'dlocal';

export interface Bootstrap {
  countryCode: string;
  currency: CurrencyInfo;
  rate: number | null;
  paymentProvider: PaymentProvider;
  siteSettings: SiteSettings | null;
  customer: Customer | null;
}

export interface BookingTour {
  id: string;
  title: string;
  price: number;
  travelers: number;
  image?: string;
}

export interface TourBooking {
  kind: 'tour';
  _id: string;
  tours: BookingTour[];
  destination?: string;
  tripType?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  addOns?: string[];
  name: string;
  email: string;
  phone?: string;
  amountGBP: number;
  convertedAmount?: number;
  currencyCode?: string;
  amountCharged?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface StoreOrderItem {
  id: string;
  category: 'magazine' | 'merchandise';
  title: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface StoreOrder {
  kind: 'store';
  _id: string;
  items: StoreOrderItem[];
  subtotal: number;
  amountGBP: number;
  name: string;
  email: string;
  shipping?: { address: string; city: string; country: string; postcode: string } | null;
  amountCharged?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type AccountEntry = TourBooking | StoreOrder;
