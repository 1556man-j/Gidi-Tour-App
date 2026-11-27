import { json } from '@sveltejs/kit';
import { getConversation, publicConversation, readMessages, roleIn, sendMessage } from '$lib/server/chat';
import { isRateLimited, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

async function authorise(locals: App.Locals, id: string) {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });

	const conv = await getConversation(id);
	const me = { id: session.user.id, email: session.user.email };
	const role = conv ? await roleIn(conv, me) : null;

	// Same answer for "does not exist" and "not yours", so chats cannot be probed.
	if (!conv || !role) return json({ error: 'Chat not found.' }, { status: 404 });
	return { conv, role, me };
}

// The app calls this every few seconds while a chat is open; `after` limits it to new messages.
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const a = await authorise(locals, params.id);
	if (a instanceof Response) return a;

	const after = url.searchParams.get('after') ?? undefined;
	const messages = await readMessages(a.conv, a.role, after && !Number.isNaN(Date.parse(after)) ? after : undefined);
	return json({ conversation: publicConversation(a.conv, a.role), messages });
};

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const a = await authorise(locals, params.id);
	if (a instanceof Response) return a;

	if (await isRateLimited(`chat-send:${a.me.id}`, 20, 60)) return tooManyRequests();

	const body = await request.json().catch(() => null);
	if (typeof body?.body !== 'string') return json({ error: 'Type a message first.' }, { status: 400 });

	const result = await sendMessage(a.conv, a.role, a.me.id, body.body);
	if (!result.ok) return json({ error: result.error, blocked: result.blocked ?? false }, { status: result.status });
	return json({ message: result.message });
};
