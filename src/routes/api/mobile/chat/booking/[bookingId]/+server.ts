import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { ensureConversationForBooking, publicConversation } from '$lib/server/chat';
import type { RequestHandler } from './$types';

// "Message your guide" on a booking. Only the person who paid can open it, and only once the booking is paid.
export const GET: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const owned = (
		await db.from('bookings').select('id, payment_status').eq('id', params.bookingId).eq('customer_id', session.user.id).maybeSingle()
	).data;
	if (!owned) return json({ error: 'Booking not found.' }, { status: 404 });
	if (owned.payment_status !== 'paid') {
		return json({ error: 'Chat opens once your payment is confirmed.' }, { status: 409 });
	}

	const conv = await ensureConversationForBooking(owned.id);
	if (!conv) return json({ error: 'Chat is not available for this booking.' }, { status: 404 });

	return json({ conversation: publicConversation(conv, 'traveller') });
};
