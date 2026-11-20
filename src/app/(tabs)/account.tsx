import { View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Briefcase, CircleHelp, FileText, Heart, Info, LogOut, Mail, Newspaper, Receipt, Shield, Cookie, Ticket, UserRound, Luggage } from 'lucide-react-native';
import { Avatar } from '@/components/account/Avatar';
import { MenuGroup, MenuRow } from '@/components/account/MenuRow';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useCountUp } from '@/hooks/useCountUp';
import { env } from '@/lib/env';
import { fetchAccountEntries } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { usePrefs } from '@/stores/prefs';
import { colors, fonts, radius, shadow, TAB_PAD } from '@/theme';

const site = (p: string) => WebBrowser.openBrowserAsync(`${env.siteUrl}/${p}`, { toolbarColor: colors.cream, controlsColor: colors.greenDeep });

function Stat({ value, label }: { value: number; label: string }) {
  const n = useCountUp(value, 900, 300);
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 28, letterSpacing: -1 }}>{Math.round(n)}</Text>
      <Text v="small" color={colors.muted}>{label}</Text>
    </View>
  );
}

export default function Account() {
  const insets = useSafeAreaInsets();
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const saved = usePrefs((s) => s.saved.length);
  const qc = useQueryClient();
  const { customer } = useBootstrap();
  const authed = status === 'authed';
  const entries = useQuery({ queryKey: ['entries'], queryFn: fetchAccountEntries, enabled: authed });
  const go = (p: string) => () => router.push(p as never);
  const name = customer?.name ?? user?.name;
  const email = customer?.email ?? user?.email;

  const logout = async () => { await signOut(); qc.clear(); toast.success('You’re signed out. See you soon!'); };

  const help = (
    <>
      <MenuGroup title="Help & discover">
        <MenuRow icon={<Mail size={18} color={colors.greenDeep} />} label="Contact us" onPress={go('/contact')} />
        <MenuRow icon={<CircleHelp size={18} color={colors.greenDeep} />} label="FAQ" onPress={go('/faq')} />
        <MenuRow icon={<Info size={18} color={colors.greenDeep} />} label="About Gidi Tour" onPress={go('/about')} />
        <MenuRow icon={<Newspaper size={18} color={colors.greenDeep} />} label="Stories" onPress={go('/stories')} />
        <MenuRow icon={<Briefcase size={18} color={colors.greenDeep} />} label="Careers" onPress={go('/career')} last />
      </MenuGroup>
      <MenuGroup title="Legal">
        <MenuRow icon={<FileText size={18} color={colors.greenDeep} />} label="Terms of service" onPress={() => site('terms')} />
        <MenuRow icon={<Shield size={18} color={colors.greenDeep} />} label="Privacy policy" onPress={() => site('privacy')} />
        <MenuRow icon={<Cookie size={18} color={colors.greenDeep} />} label="Cookie policy" onPress={() => site('cookies')} />
        <MenuRow icon={<Receipt size={18} color={colors.greenDeep} />} label="Cancellation & refunds" onPress={() => site('cancellation-refund')} last />
      </MenuGroup>
    </>
  );

  return (
    <Animated.ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: TAB_PAD + 20 }} showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: colors.cream }}>
      {authed ? (
        <>
          <Reveal>
            <View style={{ alignItems: 'center', marginBottom: 22 }}>
              <Avatar uri={customer?.avatarUrl} name={name} email={email} />
              <Text v="h1" style={{ marginTop: 14 }}>{name || 'Traveller'}</Text>
              <Text v="body" color={colors.muted}>{email}</Text>
            </View>
          </Reveal>
          <Reveal index={1}>
            <View style={[{ flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: 24 }, shadow.card]}>
              <Stat value={entries.data?.length ?? 0} label="Bookings & orders" />
              <View style={{ width: 1, backgroundColor: colors.line, marginVertical: 14 }} />
              <Stat value={saved} label="Saved tours" />
            </View>
          </Reveal>
          <Reveal index={2}>
            <MenuGroup title="My trips">
              <MenuRow icon={<Ticket size={18} color={colors.greenDeep} />} label="My bookings" onPress={go('/account/bookings')} />
              <MenuRow icon={<Heart size={18} color={colors.greenDeep} />} label="Saved tours" onPress={go('/account/saved')} />
              <MenuRow icon={<UserRound size={18} color={colors.greenDeep} />} label="Edit profile" onPress={go('/account/profile')} last />
            </MenuGroup>
          </Reveal>
          <Reveal index={3}>{help}</Reveal>
          <Reveal index={4}>
            <MenuGroup title="Account"><MenuRow icon={<LogOut size={18} color={colors.danger} />} label="Log out" danger onPress={logout} last /></MenuGroup>
          </Reveal>
        </>
      ) : (
        <>
          <Animated.View entering={FadeInDown.springify()} style={[{ backgroundColor: colors.forest, borderRadius: radius.xl, padding: 26, marginBottom: 24, overflow: 'hidden' }, shadow.float]}>
            <View style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: colors.green, opacity: 0.4 }} />
            <View style={{ position: 'absolute', right: 30, bottom: -50, width: 100, height: 100, borderRadius: 50, backgroundColor: colors.orange, opacity: 0.5 }} />
            <Luggage size={34} color={colors.orange} />
            <View style={{ marginTop: 16, marginBottom: 8 }}><Heading before="Your trips," accent="all in one place." size={30} color={colors.white} /></View>
            <Text v="body" color="rgba(255,255,255,0.75)" style={{ marginBottom: 22 }}>Sign in to book tours, save favourites and track your orders.</Text>
            <Button title="Sign in" variant="accent" onPress={() => router.push('/login')} />
            <View style={{ height: 10 }} />
            <Button title="Create an account" variant="light" onPress={() => router.push('/signup')} />
          </Animated.View>
          <Reveal index={1}>
            <MenuGroup title="My trips"><MenuRow icon={<Heart size={18} color={colors.greenDeep} />} label="Saved tours" onPress={go('/account/saved')} last hint={saved ? String(saved) : undefined} /></MenuGroup>
          </Reveal>
          <Reveal index={2}>{help}</Reveal>
        </>
      )}
      <Text v="small" color={colors.faint} center>Gidi Tour v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
    </Animated.ScrollView>
  );
}
void BookOpen;
