import { goBack } from '@/lib/nav';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Animated from 'react-native-reanimated';
import { Camera, Trash2 } from 'lucide-react-native';
import { Avatar } from '@/components/account/Avatar';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useBootstrap } from '@/hooks/useBootstrap';
import { ApiError } from '@/lib/api';
import { countryDialCodes } from '@/lib/data';
import { removeAvatar, updateProfile, uploadAvatar } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { colors } from '@/theme';

const nations = countryDialCodes.map((c) => ({ label: c.name, value: c.name }));
const dials = Array.from(new Set(countryDialCodes.map((c) => c.dialCode))).map((d) => ({ label: `${countryDialCodes.filter((c) => c.dialCode === d).map((c) => c.name).join(' / ')} (${d})`, value: d }));

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ marginTop: 10 }}><Text v="caption" color={colors.green} style={{ marginBottom: 12, marginLeft: 4 }}>{title.toUpperCase()}</Text>{children}</View>;
}

export default function Profile() {
  const status = useAuth((s) => s.status);
  const patchUser = useAuth((s) => s.patchUser);
  const qc = useQueryClient();
  const { customer, ready } = useBootstrap();
  const [f, setF] = useState<Record<string, string>>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!customer || loaded) return;
    setLoaded(true);
    setF({
      name: customer.name ?? '', nationality: customer.nationality ?? '', dateOfBirth: customer.dateOfBirth ?? '', dial: customer.phoneDialCode ?? '', phone: customer.phoneNumber ?? '',
      line1: customer.address?.line1 ?? '', line2: customer.address?.line2 ?? '', city: customer.address?.city ?? '', region: customer.address?.region ?? '', postalCode: customer.address?.postalCode ?? '', country: customer.address?.country ?? '',
      ecName: customer.emergencyContact?.name ?? '', ecRel: customer.emergencyContact?.relationship ?? '', ecPhone: customer.emergencyContact?.phone ?? '', notes: customer.travelNotes ?? '',
    });
  }, [customer, loaded]);

  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: '/account/profile' } }} />;
  const set = (k: string) => (v: string) => { setF((p) => ({ ...p, [k]: v })); if (errs[k]) setErrs((e) => ({ ...e, [k]: '' })); };
  const av = avatar === undefined ? customer?.avatarUrl : avatar;

  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (r.canceled) return;
    const a = r.assets[0];
    if (a.fileSize && a.fileSize > 5 * 1024 * 1024) return toast.error('Please choose an image under 5MB.');
    setBusy(true);
    try {
      await uploadAvatar({ uri: a.uri, name: a.fileName ?? 'avatar.jpg', type: a.mimeType ?? 'image/jpeg' });
      setAvatar(a.uri); qc.invalidateQueries({ queryKey: ['bootstrap'] }); toast.success('Profile photo updated');
    } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try { await removeAvatar(); setAvatar(null); qc.invalidateQueries({ queryKey: ['bootstrap'] }); toast.success('Photo removed'); } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  const save = async () => {
    const e: Record<string, string> = {};
    if ((f.name ?? '').trim().length < 2) e.name = 'Please enter your full name.';
    if (f.phone && !/^[\d\s().-]{6,20}$/.test(f.phone.trim())) e.phone = 'Please enter a valid phone number.';
    if (f.dateOfBirth) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(f.dateOfBirth) && new Date(f.dateOfBirth) <= new Date() && !Number.isNaN(new Date(f.dateOfBirth).getTime());
      if (!ok) e.dateOfBirth = 'Use YYYY-MM-DD, not in the future.';
    }
    setErrs(e);
    if (Object.keys(e).length) return toast.error('Please fix the highlighted fields.');
    setSaving(true);
    try {
      await updateProfile({
        name: f.name.trim(), nationality: f.nationality, dateOfBirth: f.dateOfBirth || undefined, phoneDialCode: f.dial, phoneNumber: f.phone.trim(),
        address: { line1: f.line1, line2: f.line2, city: f.city, region: f.region, postalCode: f.postalCode, country: f.country },
        emergencyContact: { name: f.ecName, relationship: f.ecRel, phone: f.ecPhone }, travelNotes: f.notes,
      });
      patchUser({ name: f.name.trim() });
      qc.invalidateQueries({ queryKey: ['bootstrap'] });
      toast.success('Profile saved');
      goBack('/account');
    } catch (err) {
      const a = err as ApiError;
      if (a.fieldErrors) setErrs({ ...a.fieldErrors, phone: a.fieldErrors.phoneNumber });
      toast.error(a.message);
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Edit profile" />
      <Animated.ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {!ready || !loaded ? null : (
          <>
            <Reveal>
              <View style={{ alignItems: 'center', marginBottom: 18, gap: 14 }}>
                <Avatar uri={av} name={f.name} email={customer?.email} size={104} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title={busy ? 'Working…' : 'Change photo'} variant="soft" size="sm" full={false} loading={false} disabled={busy} icon={<Camera size={16} color={colors.greenDeep} />} onPress={pick} />
                  {av ? <PressableScale onPress={remove} disabled={busy} style={{ height: 38, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.dangerSoft, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Trash2 size={16} color={colors.danger} /><Text v="bodyStrong" color={colors.danger}>Remove</Text></PressableScale> : null}
                </View>
              </View>
            </Reveal>
            <Reveal index={1}>
              <Section title="Personal">
                <Input label="Full name" value={f.name} onChangeText={set('name')} error={errs.name} />
                <Select label="Nationality" value={f.nationality} options={nations} onChange={(v) => set('nationality')(v)} />
                <Input label="Date of birth (YYYY-MM-DD)" value={f.dateOfBirth} onChangeText={set('dateOfBirth')} error={errs.dateOfBirth} keyboardType="numbers-and-punctuation" maxLength={10} />
              </Section>
              <Section title="Phone">
                <Select label="Country code" value={f.dial} options={dials} onChange={(v) => set('dial')(v)} display={(o) => o?.value ?? f.dial} />
                <Input label="Phone number" value={f.phone} onChangeText={set('phone')} error={errs.phone} keyboardType="phone-pad" />
              </Section>
              <Section title="Address">
                <Input label="Address line 1" value={f.line1} onChangeText={set('line1')} />
                <Input label="Address line 2" value={f.line2} onChangeText={set('line2')} />
                <Input label="City" value={f.city} onChangeText={set('city')} />
                <Input label="Region / State" value={f.region} onChangeText={set('region')} />
                <Input label="Postal code" value={f.postalCode} onChangeText={set('postalCode')} />
                <Input label="Country" value={f.country} onChangeText={set('country')} />
              </Section>
              <Section title="Emergency contact">
                <Input label="Contact name" value={f.ecName} onChangeText={set('ecName')} />
                <Input label="Relationship" value={f.ecRel} onChangeText={set('ecRel')} />
                <Input label="Contact phone" value={f.ecPhone} onChangeText={set('ecPhone')} keyboardType="phone-pad" />
              </Section>
              <Section title="Travel notes">
                <Input label="Dietary needs, accessibility, anything we should know" value={f.notes} onChangeText={set('notes')} multiline />
              </Section>
              <View style={{ height: 8 }} />
              <Button title="Save changes" loading={saving} onPress={save} />
            </Reveal>
          </>
        )}
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}
