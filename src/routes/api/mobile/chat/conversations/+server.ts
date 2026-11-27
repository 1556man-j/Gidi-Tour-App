import { json } from '@sveltejs/kit';
import { listForUser } from '$lib/server/chat';
import type { RequestHandler } from './$types';

// Everything the app needs for the Messages screens: the person's own trips, plus the guide inbox if they are a guide.
export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });

	return json(await listForUser({ id: session.user.id, email: session.user.email }));
};
