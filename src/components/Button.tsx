import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, TypeScale, Spacing } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  color,
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const primaryColor = color ?? Colors.posterPrimary;

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...(size === 'sm' && styles.sm),
    ...(size === 'lg' && styles.lg),
    ...(fullWidth && { width: '100%' }),
    ...(variant === 'primary' && { backgroundColor: primaryColor }),
    ...(variant === 'secondary' && { backgroundColor: Colors.gray100 }),
    ...(variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: primaryColor }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
    ...(variant === 'danger' && { backgroundColor: Colors.error }),
    ...((disabled || loading) && { opacity: 0.55 }),
    ...style,
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    ...(size === 'sm' && { ...TypeScale.body }),
    ...(size === 'lg' && { ...TypeScale.titleMd }),
    ...(variant === 'primary' && { color: Colors.white }),
    ...(variant === 'secondary' && { color: Colors.textPrimary }),
    ...(variant === 'outline' && { color: primaryColor }),
    ...(variant === 'ghost' && { color: primaryColor }),
    ...(variant === 'danger' && { color: Colors.white }),
    ...textStyle,
  };

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? Colors.white : primaryColor} size="small" />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 16,
  },
  label: {
    ...TypeScale.bodyLg,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
