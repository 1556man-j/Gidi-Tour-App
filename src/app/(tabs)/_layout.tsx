import { Redirect, Tabs } from 'expo-router';
import { Compass, Globe2, Home, ShoppingBag, User } from 'lucide-react-native';
import { FloatingTabBar, type TabDef } from '@/components/FloatingTabBar';
import { useGuide } from '@/hooks/useGuide';
import { cartCount, useCart } from '@/stores/cart';
import { usePrefs } from '@/stores/prefs';
import { colors } from '@/theme';

const TABS: readonly TabDef[] = [
  { name: 'index', label: 'Home', Icon: Home },
  { name: 'tours', label: 'Tours', Icon: Compass },
  { name: 'destinations', label: 'Places', Icon: Globe2 },
  { name: 'store', label: 'Store', Icon: ShoppingBag },
  { name: 'account', label: 'You', Icon: User },
];

export default function TabsLayout() {
  const hydrated = usePrefs((s) => s.hydrated);
  const onboarded = usePrefs((s) => s.onboarded);
  const count = useCart((s) => cartCount(s.items));
  const { guideMode } = useGuide();
  if (hydrated && !onboarded) return <Redirect href="/onboarding" />;
  // Approved guides get their own screens (they can switch back to the traveller view from their profile).
  if (guideMode) return <Redirect href="/guide" />;
  return (
    <Tabs tabBar={(p) => <FloatingTabBar {...p} tabs={TABS} badges={{ store: count }} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.cream } }}>
      {TABS.map((t) => <Tabs.Screen key={t.name} name={t.name} />)}
    </Tabs>
  );
}
