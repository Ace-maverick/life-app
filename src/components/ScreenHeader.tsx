import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, TypeScale, Spacing } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
  dark?: boolean;
}

export default function ScreenHeader({ title, subtitle, onBack, rightElement, color, dark = false }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const bg = color ?? Colors.white;
  const textColor = dark ? Colors.white : Colors.textPrimary;
  const subColor = dark ? 'rgba(255,255,255,0.7)' : Colors.textMuted;

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.backArrow, { color: textColor }]}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{rightElement ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '300',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...TypeScale.titleMd,
    fontWeight: '700',
  },
  subtitle: {
    ...TypeScale.caption,
    marginTop: 2,
  },
  right: {
    width: 36,
    alignItems: 'flex-end',
  },
});
