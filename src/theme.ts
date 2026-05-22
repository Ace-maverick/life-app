export const Colors = {
  // Poster brand (Blue)
  posterPrimary: '#1D4ED8',
  posterDark: '#1E3A8A',
  posterLight: '#DBEAFE',
  posterAccent: '#3B82F6',

  // Lifer brand (Green)
  liferPrimary: '#16A34A',
  liferDark: '#14532D',
  liferLight: '#DCFCE7',
  liferAccent: '#22C55E',

  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F8FAFC',

  // Status
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Grays
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  white: '#FFFFFF',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

/** @deprecated Use TypeScale spreads instead: `...TypeScale.bodyLg` */
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

/**
 * TypeScale — semantic text styles.
 * Each entry bundles fontSize + lineHeight so they always travel together.
 * Spread into StyleSheet definitions; override fontWeight/color per-context.
 *
 * Usage:
 *   myTitle: { ...TypeScale.titleLg, fontWeight: '800', color: Colors.white }
 *   body:    { ...TypeScale.body,    color: Colors.textSecondary }
 */
export const TypeScale = {
  /** 36 / 44 — hero numbers, big payment totals */
  display:   { fontSize: 36, lineHeight: 44 },
  /** 28 / 34 — wallet totals, section hero values */
  headline:  { fontSize: 28, lineHeight: 34 },
  /** 22 / 28 — screen title, greeting name */
  titleLg:   { fontSize: 22, lineHeight: 28 },
  /** 18 / 24 — section heading, card emphasis title */
  titleMd:   { fontSize: 18, lineHeight: 24 },
  /** 16 / 22 — card/list item title, strong label */
  title:     { fontSize: 16, lineHeight: 22 },
  /** 15 / 22 — main body text, task description */
  bodyLg:    { fontSize: 15, lineHeight: 22 },
  /** 13 / 20 — secondary info, chips, role badges */
  body:      { fontSize: 13, lineHeight: 20 },
  /** 11 / 15 — timestamps, fine print, tiny labels */
  caption:   { fontSize: 11, lineHeight: 15 },
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 8,
  },
};
