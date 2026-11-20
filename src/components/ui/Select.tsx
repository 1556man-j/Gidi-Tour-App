import { useMemo, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { Check, ChevronDown, Search } from 'lucide-react-native';
import { colors, fonts, radius } from '@/theme';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface Option { label: string; value: string; sub?: string }
interface Props {
  label: string;
  value?: string;
  options: Option[];
  onChange: (value: string, option: Option) => void;
  error?: string;
  searchable?: boolean;
  display?: (o?: Option) => string;
}

/** Looks like an input; opens a searchable sheet of options. */
export function Select({ label, value, options, onChange, error, searchable = true, display }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = options.find((o) => o.value === value);
  const list = useMemo(() => options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()) || o.sub?.includes(q)), [options, q]);
  const text = display ? display(current) : current?.label;
  return (
    <View style={{ marginBottom: 14 }}>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.985}
        style={{ minHeight: 60, borderRadius: radius.md, borderWidth: 1.5, borderColor: error ? colors.danger : colors.line, backgroundColor: colors.white, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <View style={{ flex: 1 }}>
          <Text v="small" color={colors.muted} style={{ fontFamily: fonts.medium, fontSize: text ? 11 : 15, marginBottom: text ? 2 : 0 }}>{label}</Text>
          {text ? <Text v="bodyStrong" style={{ fontSize: 16 }}>{text}</Text> : null}
        </View>
        <ChevronDown size={20} color={colors.muted} />
      </PressableScale>
      {error ? <Text v="small" color={colors.danger} style={{ marginTop: 6, marginLeft: 6 }}>{error}</Text> : null}
      <Sheet visible={open} onClose={() => { setOpen(false); setQ(''); }} title={label} tall>
        {searchable ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 16, height: 48, marginBottom: 10, borderWidth: 1.5, borderColor: colors.line }}>
            <Search size={18} color={colors.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search" placeholderTextColor={colors.faint} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object} />
          </View>
        ) : null}
        <FlatList
          data={list}
          keyExtractor={(o) => o.value}
          style={{ maxHeight: 420 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => { onChange(item.value, item); setOpen(false); setQ(''); }}
              scaleTo={0.985}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.line }}
            >
              <View>
                <Text v="bodyStrong">{item.label}</Text>
                {item.sub ? <Text v="small" color={colors.muted}>{item.sub}</Text> : null}
              </View>
              {item.value === value ? <Check size={20} color={colors.green} /> : null}
            </PressableScale>
          )}
        />
      </Sheet>
    </View>
  );
}
