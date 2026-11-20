import { json } from '@sveltejs/kit';
import { getBookingStatus } from '$lib/sanity/queries/booking';
import { reconcileDlocalBooking } from '$lib/server/paymentSettlement';
import type { RequestHandler } from './$types';

// Like the website's confirmation page: if dLocal's webhook is late, ask dLocal directly.
export const GET: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	let booking = await getBookingStatus(params.id);
	if (!booking || booking.customerId !== session.user.id) return json({ error: 'Booking not found.' }, { status: 404 });

	booking = await reconcileDlocalBooking(booking);
	return json({
		paymentStatus: booking.paymentStatus,
		confirmationEmailSent: booking.confirmationEmailSent ?? false,
		amountCharged: booking.amountCharged,
		currency: booking.currency
	});
};
