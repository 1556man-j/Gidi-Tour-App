import { json } from '@sveltejs/kit';
import { reportMessage } from '$lib/server/chat';
import { isRateLimited, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });
	if (await isRateLimited(`chat-report:${session.user.id}`, 10, 3600)) return tooManyRequests();

	const result = await reportMessage(params.messageId, { id: session.user.id, email: session.user.email });
	if (!result.ok) return json({ error: result.error }, { status: result.status });
	return json({ ok: true });
};
