import { api } from '@/lib/api';
import { env } from '@/lib/env';
import type { SignupPayload } from '@/lib/services';

export type GuideStatus = 'none' | 'pending' | 'active' | 'rejected' | 'inactive';

export interface GuideTour { slug: string; title: string; country: string }
export interface GuideProfile {
  _id: string; status: GuideStatus; name: string; email: string; bio: string; languages: string[];
  country: string; city: string; experienceYears: number | null; photoUrl: string | null; tours: GuideTour[];
}
export interface GuideApplication {
  country: string; city: string; languages: string[]; experienceYears: number; bio: string; tourSlugs: string[]; acceptedGuideTerms: boolean;
}

export async function fetchGuideMe(): Promise<{ status: GuideStatus; guide: GuideProfile | null }> {
  if (env.mock) return { status: 'none', guide: null };
  return api('/api/mobile/guide/me');
}

export async function signupAsGuide(p: SignupPayload, application: GuideApplication) {
  if (env.mock) return { needsVerification: true, emailSent: true, applicationSaved: true };
  return api<{ needsVerification: boolean; emailSent: boolean; applicationSaved: boolean }>('/api/mobile/guide/signup', { body: { ...p, application }, auth: false });
}

export async function applyAsGuide(application: GuideApplication) {
  if (env.mock) return;
  await api('/api/mobile/guide/apply', { body: { application } });
}

export async function updateGuideProfile(p: { bio?: string; city?: string; languages?: string[]; experienceYears?: number }) {
  if (env.mock) return;
  await api('/api/mobile/guide/profile', { body: p });
}

export async function saveGuideTours(slugs: string[]) {
  if (env.mock) return;
  await api('/api/mobile/guide/tours', { method: 'PUT', body: { slugs } });
}
