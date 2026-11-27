import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { getTours } from '@/lib/content';
import { countryDialCodes } from '@/lib/data';
import type { GuideApplication } from '@/lib/guide';
import { colors, radius } from '@/theme';

export type GuideForm = {
  country: string; city: string; languages: string[]; years: string; bio: string; tourSlugs: string[]; accepted: boolean;
};
export const emptyGuideForm: GuideForm = { country: '', city: '', languages: [], years: '', bio: '', tourSlugs: [], accepted: false };

const LANGS = ['English', 'French', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin', 'Arabic', 'Spanish', 'Portuguese', 'Swahili', 'Twi', 'Zulu'];
const countries = Array.from(new Set(countryDialCodes.map((c) => c.name))).sort().map((n) => ({ label: n, value: n }));

export function validateGuideDetails(f: GuideForm) {
  const e: Record<string, string> = {};
  if (!f.country) e.country = 'Choose the country you are based in.';
  if (!f.city.trim()) e.city = 'Enter your city or town.';
  if (!f.languages.length) e.languages = 'Pick at least one language.';
  if (!/^\d{1,2}$/.test(f.years.trim())) e.years = 'Enter your years of guiding experience (0 if new).';
  if (f.bio.trim().length < 20) e.bio = 'Tell us a little about yourself (at least 20 characters).';
  return e;
}

export const toApplication = (f: GuideForm): GuideApplication => ({
  country: f.country, city: f.city.trim(), languages: f.languages, experienceYears: Number(f.years.trim() || 0),
  bio: f.bio.trim(), tourSlugs: f.tourSlugs, acceptedGuideTerms: f.accepted,
});

type Set = <K extends keyof GuideForm>(k: K, v: GuideForm[K]) => void;

export function LanguagePicker({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [other, setOther] = useState('');
  const all = Array.from(new globalThis.Set([...LANGS, ...value]));
  const toggle = (l: string) => onChange(value.includes(l) ? value.filter((x) => x !== l) : [...value, l].slice(0, 8));
  const add = () => { const t = other.trim().slice(0, 30); if (t && !value.includes(t)) onChange([...value, t].slice(0, 8)); setOther(''); };
  return (
    <View style={{ marginBottom: 14 }}>
      <Text v="small" color={colors.muted} style={{ marginBottom: 8, marginLeft: 4 }}>Languages you can guide in</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {all.map((l) => <Chip key={l} label={l} tone="green" active={value.includes(l)} onPress={() => toggle(l)} />)}
      </View>
      <View style={{ marginTop: 12 }}>
        <Input label="Another language (optional)" value={other} onChangeText={setOther} onSubmitEditing={add} onBlur={add} returnKeyType="done" />
      </View>
      {error ? <Text v="small" color={colors.danger} style={{ marginLeft: 6 }}>{error}</Text> : null}
    </View>
  );
}

export function GuideDetails({ f, set, errs }: { f: GuideForm; set: Set; errs: Record<string, string> }) {
  return (
    <>
      <Select label="Country you are based in" value={f.country} options={countries} onChange={(v) => { set('country', v); set('tourSlugs', []); }} error={errs.country} />
      <Input label="City or town" value={f.city} onChangeText={(v) => set('city', v)} error={errs.city} />
      <Input label="Years of guiding experience" value={f.years} onChangeText={(v) => set('years', v.replace(/\D/g, '').slice(0, 2))} error={errs.years} keyboardType="number-pad" />
      <LanguagePicker value={f.languages} onChange={(v) => set('languages', v)} error={errs.languages} />
      <Input label="About you (shown to travellers)" value={f.bio} onChangeText={(v) => set('bio', v.slice(0, 600))} error={errs.bio} multiline />
    </>
  );
}

/** Tours in the guide's country, ticked to say which ones they can lead. */
export function TourPicker({ country, value, onChange }: { country: string; value: string[]; onChange: (v: string[]) => void }) {
  const q = useQuery({ queryKey: ['tours'], queryFn: getTours });
  const list = useMemo(() => (q.data ?? []).filter((t) => t.country?.trim().toLowerCase() === country.trim().toLowerCase()), [q.data, country]);
  if (q.isLoading) return <Text v="body" color={colors.muted}>Loading tours…</Text>;
  if (!list.length) return (
    <View style={{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 18 }}>
      <Text v="bodyStrong">No tours in {country || 'your country'} yet</Text>
      <Text v="small" color={colors.muted} style={{ marginTop: 4 }}>You can still apply. We will link you to tours as soon as we add them there.</Text>
    </View>
  );
  const toggle = (slug: string) => onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  return (
    <View style={{ gap: 10 }}>
      <PressableScale onPress={() => onChange(value.length === list.length ? [] : list.map((t) => t.slug.current))} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
        <Text v="bodyStrong" color={colors.greenDeep}>{value.length === list.length ? 'Clear all' : 'Select all'}</Text>
      </PressableScale>
      {list.map((t) => {
        const on = value.includes(t.slug.current);
        return (
          <PressableScale key={t._id} onPress={() => toggle(t.slug.current)} scaleTo={0.98}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1.5, borderColor: on ? colors.green : colors.line }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.green : colors.sand }}>{on ? <Check size={16} color={colors.white} strokeWidth={3} /> : null}</View>
            <View style={{ flex: 1 }}>
              <Text v="bodyStrong" numberOfLines={2}>{t.title}</Text>
              {t.duration ? <Text v="small" color={colors.muted}>{t.duration}</Text> : null}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function GuideRules({ accepted, onChange, error }: { accepted: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <View style={{ marginTop: 6 }}>
      <PressableScale onPress={() => onChange(!accepted)} scaleTo={0.98} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: accepted ? colors.green : colors.sand, marginTop: 2 }}>{accepted ? <Check size={16} color={colors.white} strokeWidth={3} /> : null}</View>
        <Text v="small" color={colors.muted} style={{ flex: 1 }}>I will keep all payments and contact through Gidi Tour. I will not share phone numbers, links or ask travellers for money in chat.</Text>
      </PressableScale>
      {error ? <Text v="small" color={colors.danger} style={{ marginTop: 6 }}>{error}</Text> : null}
    </View>
  );
}
