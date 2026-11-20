import type { ReactNode } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { env } from '@/lib/env';

export function PaymentsProvider({ children }: { children: ReactNode }) {
  return (
    <StripeProvider publishableKey={env.stripeKey || 'pk_test_placeholder'} merchantIdentifier="merchant.com.giditour.app" urlScheme="giditour">
      {children as React.ReactElement}
    </StripeProvider>
  );
}
