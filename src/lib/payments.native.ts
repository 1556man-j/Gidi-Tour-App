import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { env } from './env';

export type PayResult = { status: 'paid' | 'canceled' | 'failed'; message?: string };

/** Opens Stripe's native payment sheet (cards, Apple Pay, Google Pay, PayPal where enabled). */
export async function payWithStripe(clientSecret: string, who: { name: string; email: string }): Promise<PayResult> {
  if (env.mock) {
    await new Promise((r) => setTimeout(r, 900));
    return { status: 'paid' };
  }
  const init = await initPaymentSheet({
    merchantDisplayName: 'Gidi Tour',
    paymentIntentClientSecret: clientSecret,
    returnURL: 'giditour://stripe-redirect',
    defaultBillingDetails: { name: who.name, email: who.email },
    allowsDelayedPaymentMethods: false,
    applePay: { merchantCountryCode: 'GB' },
    googlePay: { merchantCountryCode: 'GB', testEnv: __DEV__ },
    style: 'alwaysLight',
    appearance: {
      colors: { primary: '#5C9B19', background: '#F7F3EA', componentBackground: '#FFFFFF', componentText: '#12200D', primaryText: '#12200D' },
      shapes: { borderRadius: 16 },
    },
  });
  if (init.error) return { status: 'failed', message: init.error.message };

  const result = await presentPaymentSheet();
  if (result.error) {
    if (result.error.code === 'Canceled') return { status: 'canceled' };
    return { status: 'failed', message: result.error.message };
  }
  return { status: 'paid' };
}
