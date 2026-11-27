import { sanityClient as client, urlFor } from '$lib/sanity/client';

export interface Guide {
	_id: string;
	name: string;
	email: string;
	bio?: string;
	languages?: string[];
	photoUrl?: string;
}

const FIELDS = `_id, name, "email": lower(email), bio, languages, photo`;

const toGuide = (g: any): Guide => ({
	_id: g._id,
	name: g.name,
	email: g.email,
	bio: g.bio,
	languages: g.languages,
	photoUrl: g.photo ? urlFor(g.photo).width(240).height(240).fit('crop').quality(80).url() : undefined
});

// Guide lookups happen on every chat request, so keep them for a short time.
const cache = new Map<string, { at: number; guide: Guide | null }>();
const TTL = 60_000;

/** The active guide whose sign-in email matches, or null. Decides who sees the Guide inbox. */
export async function getGuideByEmail(email: string): Promise<Guide | null> {
	const key = email.trim().toLowerCase();
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < TTL) return hit.guide;

	const row = await client.fetch(
		`*[_type == "guide" && active != false && lower(email) == $email][0]{ ${FIELDS} }`,
		{ email: key }
	);
	const guide = row ? toGuide(row) : null;
	cache.set(key, { at: Date.now(), guide });
	return guide;
}

/** Active guides who lead at least one of these tours (by tour slug), or who can take any tour. */
export async function getGuidesForTours(slugs: string[]): Promise<Guide[]> {
	const rows = await client.fetch(
		`*[_type == "guide" && active != false && (
			coversAllTours == true ||
			count(tours[@->slug.current in $slugs]) > 0
		)]{ ${FIELDS}, "specific": count(tours[@->slug.current in $slugs]) > 0 }`,
		{ slugs }
	);
	const list = (rows as any[]) ?? [];
	// Guides who actually lead the tour come first; backups only if nobody else is listed.
	const specific = list.filter((g) => g.specific);
	return (specific.length ? specific : list).map(toGuide);
}
