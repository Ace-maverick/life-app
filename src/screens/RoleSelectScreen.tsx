import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, TypeScale, Shadow } from '../theme';
import { RootStackParams } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParams>;

interface RoleCard {
  role: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  gradientColors: [string, string];
}

const ROLES: RoleCard[] = [
  {
    role: 'poster',
    emoji: '📋',
    title: 'Post a Task',
    subtitle: 'I need help with something nearby',
    color: Colors.posterPrimary,
    gradientColors: ['#1D4ED8', '#3B82F6'],
  },
  {
    role: 'lifer',
    emoji: '💼',
    title: 'Be a Lifer',
    subtitle: 'I want to earn by helping others',
    color: Colors.liferPrimary,
    gradientColors: ['#16A34A', '#22C55E'],
  },
  {
    role: 'admin',
    emoji: '⚙️',
    title: 'Admin Console',
    subtitle: 'Platform management & operations',
    color: Colors.gray700,
    gradientColors: ['#334155', '#64748B'],
  },
  {
    role: 'callcenter',
    emoji: '🎧',
    title: 'Support Desk',
    subtitle: 'Call center & customer operations',
    color: '#7C3AED',
    gradientColors: ['#7C3AED', '#A78BFA'],
  },
];

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.appName}>Life</Text>
          <Text style={styles.tagline}>YOUR LIFE, HANDLED.</Text>
        </View>

        <Text style={styles.heading}>How will you use Life?</Text>
        <Text style={styles.subheading}>Choose your role to get started</Text>

        {/* Role Cards */}
        <View style={styles.cards}>
          {ROLES.map(role => (
            <TouchableOpacity
              key={role.role}
              style={styles.cardWrapper}
              onPress={() => navigation.navigate('PhoneAuth', { role: role.role })}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={role.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardInner}>
                  <Text style={styles.emoji}>{role.emoji}</Text>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{role.title}</Text>
                    <Text style={styles.cardSub}>{role.subtitle}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>
          Demo PIN for all accounts: <Text style={styles.hintBold}>1234</Text>
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.posterPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoLetter: { color: Colors.white, fontSize: 30, fontWeight: '800' },
  appName: { color: Colors.white, ...TypeScale.headline, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: 'rgba(255,255,255,0.45)', ...TypeScale.caption, letterSpacing: 2.5, marginTop: 4, fontWeight: '600' },
  heading: { color: Colors.white, ...TypeScale.titleLg, fontWeight: '700', textAlign: 'center', marginTop: Spacing.md },
  subheading: { color: 'rgba(255,255,255,0.55)', ...TypeScale.bodyLg, textAlign: 'center', marginTop: 6, marginBottom: Spacing.xl },
  cards: { gap: Spacing.md },
  cardWrapper: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md },
  card: { borderRadius: Radius.xl, padding: 20 },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 32 },
  cardText: { flex: 1 },
  cardTitle: { color: Colors.white, ...TypeScale.titleMd, fontWeight: '700' },
  cardSub: { color: 'rgba(255,255,255,0.75)', ...TypeScale.body, marginTop: 3 },
  arrow: { color: 'rgba(255,255,255,0.7)', fontSize: 28, fontWeight: '300' },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    ...TypeScale.body,
    marginTop: Spacing.xl,
  },
  hintBold: { color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
});
