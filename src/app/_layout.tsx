import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold } from '@expo-google-fonts/geist';
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { PaymentsProvider } from '@/components/PaymentsProvider';
import { IntroSplash } from '@/components/IntroSplash';
import { ToastHost } from '@/components/ui/Toast';
import { useAuth } from '@/stores/auth';
import { usePrefs } from '@/stores/prefs';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false } },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold,
    InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic,
  });
  const hydrate = useAuth((s) => s.hydrate);
  const [intro, setIntro] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (fontsLoaded) SplashScreen.hideAsync().catch(() => {}); }, [fontsLoaded]);
  const done = useCallback(() => setIntro(false), []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaymentsProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'slide_from_right' }}>
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
              <Stack.Screen name="(auth)" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="book/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="book/confirmation" options={{ gestureEnabled: false, animation: 'fade' }} />
              <Stack.Screen name="store/cart" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="store/confirmation" options={{ gestureEnabled: false, animation: 'fade' }} />
            </Stack>
            <ToastHost />
            {intro ? <IntroSplash onDone={done} /> : null}
          </PaymentsProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Keep usePrefs imported so the persisted store hydrates at launch.
void usePrefs;

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.cream } });
