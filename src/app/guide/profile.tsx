import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftRight, LogOut, Trash2, UserRound } from 'lucide-react-native';
import { Avatar } from '@/components/account/Avatar';
import { MenuGroup, MenuRow } from '@/components/account/MenuRow';
import { LanguagePicker } from '@/components/guide/GuideFields';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useGuide } from '@/hooks/useGuide';
import { updateGuideProfile } from '@/lib/guide';
import { useAuth } from '@/stores/auth';
import { usePrefs } from '@/stores/prefs';
import { colors, TAB_PAD } from '@/theme';

export default function GuideProfile() {
  const insets = useSafeAreaInsets();
  const { guide } = useGuide();
  const { customer } = useBootstrap();
  const signOut = useAuth((s) => s.signOut);
  const setView = usePrefs((s) => s.setGuideView);
  const qc = useQueryClient();
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [years, setYears] = useState('');
  const [langs, setLangs] = useState<string[]>([]);
  const [seeded, setSeeded] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!guide || seeded === guide._id) return;
    setSeeded(guide._id); setBio(guide.bio); setCity(guide.city); setYears(guide.experienceYears == null ? '' : String(guide.experienceYears)); setLangs(guide.languages);
  }, [guide, seeded]);

  const save = async () => {
    const e: Record<string, string> = {};
    if (bio.trim().length < 20) e.bio = 'Tell us a little about yourself (at least 20 characters).';
    if (!city.trim()) e.city = 'Enter your city or town.';
    if (!langs.length) e.languages = 'Pick at least one language.';
    if (!/^\d{1,2}$/.test(years.trim())) e.years = 'Enter a number from 0 to 60.';
    setErrs(e);
    if (Object.keys(e).length) return toast.error('Please fix the highlighted fields.');
    setBusy(true);
    try {
      await updateGuideProfile({ bio: bio.trim(), city: city.trim(), languages: langs, experienceYears: Number(years) });
      await qc.invalidateQueries({ queryKey: ['guide'] });
      toast.success('Guide profile saved');
    } catch (err) { toast.error((err as Error).message); }
    setBusy(false);
  };

  const toTraveller = () => { setView('traveller'); router.replace('/'); };
  const logout = async () => { await signOut(); router.replace('/'); toast.success('You’re signed out.'); };
  const name = guide?.name || customer?.name;

  return (
    <Animated.ScrollView style={{ flex: 1, backgroundColor: colors.cream }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: TAB_PAD + 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 22 }}>
        <Avatar uri={customer?.avatarUrl ?? guide?.photoUrl} name={name} email={guide?.email} />
        <Text v="h1" style={{ marginTop: 14 }}>{name || 'Guide'}</Text>
        <Text v="body" color={colors.muted}>{[guide?.city, guide?.country].filter(Boolean).join(', ')}</Text>
      </View>
      <MenuGroup title="Account">
        <MenuRow icon={<UserRound size={18} color={colors.greenDeep} />} label="Photo, phone and personal details" onPress={() => router.push('/account/profile' as never)} last />
      </MenuGroup>
      <Text v="caption" color={colors.green} style={{ marginBottom: 12, marginLeft: 4 }}>GUIDE PROFILE</Text>
      <Input label="City or town" value={city} onChangeText={(v) => { setCity(v); setErrs((e) => ({ ...e, city: '' })); }} error={errs.city} />
      <Input label="Years of guiding experience" value={years} onChangeText={(v) => { setYears(v.replace(/\D/g, '').slice(0, 2)); setErrs((e) => ({ ...e, years: '' })); }} error={errs.years} keyboardType="number-pad" />
      <LanguagePicker value={langs} onChange={setLangs} error={errs.languages} />
      <Input label="About you (shown to travellers)" value={bio} onChangeText={(v) => { setBio(v.slice(0, 600)); setErrs((e) => ({ ...e, bio: '' })); }} error={errs.bio} multiline />
      <Button title="Save guide profile" loading={busy} onPress={save} />
      <View style={{ height: 26 }} />
      <MenuGroup title="Switch">
        <MenuRow icon={<ArrowLeftRight size={18} color={colors.greenDeep} />} label="Use the traveller app" onPress={toTraveller} last />
      </MenuGroup>
      <MenuGroup title="Session">
        <MenuRow icon={<LogOut size={18} color={colors.danger} />} label="Log out" danger onPress={logout} />
        <MenuRow icon={<Trash2 size={18} color={colors.danger} />} label="Delete account" danger onPress={() => router.push('/account/delete' as never)} last />
      </MenuGroup>
    </Animated.ScrollView>
  );
}
