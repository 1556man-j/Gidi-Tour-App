import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/theme';
import { payWithStripe, type PayResult } from '@/lib/payments';

export type { PayResult };
export { payWithStripe };

/** dLocal (Nigeria, Ghana, Kenya, etc.) is a hosted page: open it in the in-app browser and wait for the person to come back. */
export async function openDlocalCheckout(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    toolbarColor: colors.cream,
    controlsColor: colors.greenDeep,
    showTitle: true,
  });
}

/**
 * Payments are confirmed by the provider's webhook, never by the app. After paying we ask the
 * server for the status every couple of seconds until it says paid or failed.
 */
export async function pollUntilSettled(
  check: () => Promise<{ paymentStatus: string }>,
  opts: { tries?: number; intervalMs?: number } = {}
): Promise<'paid' | 'failed' | 'pending'> {
  const tries = opts.tries ?? 30;
  const interval = opts.intervalMs ?? 2000;
  for (let i = 0; i < tries; i++) {
    try {
      const { paymentStatus } = await check();
      if (paymentStatus === 'paid') return 'paid';
      if (paymentStatus === 'failed') return 'failed';
    } catch {
      // network blip: keep trying
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return 'pending';
}
