import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Radius } from '../theme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  color?: string;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function stringColor(name: string): string {
  const palette = [
    '#1D4ED8', '#16A34A', '#DC2626', '#D97706',
    '#7C3AED', '#0891B2', '#DB2777', '#059669',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function Avatar({ name, uri, size = 42, color }: AvatarProps) {
  const bg = color ?? stringColor(name);
  if (uri) {
    return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.white, fontWeight: '700' },
});
