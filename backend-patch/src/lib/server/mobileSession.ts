import { encode } from '@auth/core/jwt';
import { AUTH_SECRET } from '$env/static/private';
import { SITE_URL } from '$lib/server/siteUrl';

// Auth.js looks for its session cookie under one of these names (the "__Secure-" one on https).
export const SESSION_COOKIE = SITE_URL.startsWith('https')
	? '__Secure-authjs.session-token'
	: 'authjs.session-token';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/** Makes the same kind of token Auth.js puts in its cookie, so the app can send it as "Authorization: Bearer". */
export async function issueMobileToken(user: { id: string; email: string; name?: string | null }) {
	return encode({
		token: { id: user.id, sub: user.id, email: user.email, name: user.name ?? undefined },
		secret: AUTH_SECRET,
		salt: SESSION_COOKIE,
		maxAge: THIRTY_DAYS
	});
}
