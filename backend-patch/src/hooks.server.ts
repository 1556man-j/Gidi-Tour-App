// Replace your existing src/hooks.server.ts with this file, or copy the `mobileBridge` handle into it.
// The only change from your current file: `mobileBridge` is added to the sequence, before authHandle.
import { handle as authHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib/server/mobileSession';
import { detectCountryFromIp } from '$lib/server/geoCurrency';

const CSRF_EXEMPT_PATHS = new Set([
	'/api/book/dlocal/return',
	'/api/book/dlocal/webhook',
	'/api/book/stripe/webhook',
	'/api/store/checkout/dlocal/return',
	'/api/store/checkout/dlocal/webhook'
]);

function normalizePath(pathname: string) {
	return pathname.toLowerCase().replace(/\/+$/, '') || '/';
}

/**
 * The mobile app sends "Authorization: Bearer <token>" and "X-Gidi-Client: mobile".
 *  1. The bearer token is handed to Auth.js as if it were the session cookie, so every existing
 *     route that calls locals.auth() works for the app with no other change.
 *  2. The visitor's country (which decides currency and payment provider) is detected from the
 *     IP address, exactly like the website, never taken from the app.
 */
const mobileBridge: Handle = async ({ event, resolve }) => {
	if (event.request.headers.get('x-gidi-client') === 'mobile') {
		const auth = event.request.headers.get('authorization');
		if (auth?.startsWith('Bearer ')) {
			const headers = new Headers(event.request.headers);
			const existing = headers.get('cookie');
			headers.set('cookie', `${existing ? existing + '; ' : ''}${SESSION_COOKIE}=${auth.slice(7)}`);
			event.request = new Request(event.request, { headers });
		}
		if (!/^[A-Z]{2}$/.test(event.cookies.get('visitor_country') ?? '')) {
			const country = (await detectCountryFromIp(event.getClientAddress())) ?? 'GB';
			event.cookies.set('visitor_country', country, { path: '/', maxAge: 60 * 60 * 24 * 30 });
		}
	}
	return resolve(event);
};

const csrfHandle: Handle = async ({ event, resolve }) => {
	const path = normalizePath(event.url.pathname);
	const isExempt = CSRF_EXEMPT_PATHS.has(path);

	if (!isExempt && event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		const origin = event.request.headers.get('origin');
		const contentType = event.request.headers.get('content-type') ?? '';
		const looksLikeForm =
			contentType.includes('application/x-www-form-urlencoded') ||
			contentType.includes('multipart/form-data') ||
			contentType.includes('text/plain');
		const isMobile = event.request.headers.get('x-gidi-client') === 'mobile';

		// The app has no "origin", and its token already proves who is calling, so only
		// browser requests (cookies) are origin-checked. Avatar uploads from the app are multipart.
		if (looksLikeForm && !isMobile && origin !== event.url.origin) {
			console.warn(`CSRF guard blocked ${event.request.method} ${event.url.pathname} (origin: ${origin ?? 'none'})`);
			return new Response(`Blocked by the Gidi Tour CSRF guard: ${event.request.method} ${event.url.pathname}`, { status: 403 });
		}
	}
	return resolve(event);
};

const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	try {
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
		if (!dev && event.url.protocol === 'https:') response.headers.set('Strict-Transport-Security', 'max-age=31536000');
	} catch {
		// Some responses have locked headers.
	}
	return response;
};

export const handle = sequence(securityHeaders, csrfHandle, mobileBridge, authHandle);
