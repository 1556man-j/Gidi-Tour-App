// Web preview / mock: there is no native Stripe sheet, so payment is simulated.
export type PayResult = { status: 'paid' | 'canceled' | 'failed'; message?: string };

export async function payWithStripe(_clientSecret: string, _who: { name: string; email: string }): Promise<PayResult> {
  await new Promise((r) => setTimeout(r, 900));
  return { status: 'paid' };
}
