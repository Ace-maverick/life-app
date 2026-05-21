import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number | 'none';
}

export default function Card({ children, style, elevated = false, padding }: CardProps) {
  const paddingValue = padding === 'none' ? 0 : padding ?? Spacing.md;
  return (
    <View
      style={[
        styles.card,
        elevated && Shadow.md,
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
