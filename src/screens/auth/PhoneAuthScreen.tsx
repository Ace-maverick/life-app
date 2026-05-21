import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import Button from '../../components/Button';
import { RootStackParams } from '../../navigation';

type Nav = NativeStackNavigationProp<RootStackParams>;
type Route = RouteProp<RootStackParams, 'PhoneAuth'>;

const ROLE_CONFIG: Record<string, { color: string; gradientColors: [string, string]; label: string }> = {
  poster: { color: Colors.posterPrimary, gradientColors: ['#1D4ED8', '#3B82F6'], label: 'Post a Task' },
  lifer:  { color: Colors.liferPrimary,  gradientColors: ['#16A34A', '#22C55E'], label: 'Be a Lifer' },
  admin:  { color: Colors.gray700,       gradientColors: ['#334155', '#64748B'], label: 'Admin' },
  callcenter: { color: '#7C3AED',        gradientColors: ['#7C3AED', '#A78BFA'], label: 'Support Desk' },
};

// Demo quick-login accounts
const DEMO_ACCOUNTS: Record<string, Array<{ name: string; phone: string }>> = {
  poster:     [{ name: 'Miki Haile', phone: '0911000001' }, { name: 'Hana Girma', phone: '0911000005' }],
  lifer:      [{ name: 'Dawit Bekele', phone: '0911000002' }, { name: 'Yonas Tesfaye', phone: '0911000006' }],
  admin:      [{ name: 'Admin User', phone: '0911000003' }],
  callcenter: [{ name: 'Sara Tekle', phone: '0911000004' }],
};

export default function PhoneAuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { role } = route.params;
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.poster;
  const demos = DEMO_ACCOUNTS[role] ?? [];

  const [phone, setPhone] = useState('');

  function handleContinue() {
    const clean = phone.replace(/\s/g, '');
    if (clean.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    navigation.navigate('OTP', { phone: clean, role });
  }

  function handleDemo(demoPhone: string) {
    navigation.navigate('OTP', { phone: demoPhone, role });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={cfg.gradientColors} style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.roleLabel}>{cfg.label}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Enter your phone number</Text>
        <Text style={styles.sub}>We'll send you a verification code</Text>

        <View style={styles.inputWrap}>
          <Text style={styles.flag}>🇪🇹  +251</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="09xxxxxxxx"
            placeholderTextColor={Colors.gray400}
            maxLength={13}
          />
        </View>

        <Button
          label="Send Code"
          onPress={handleContinue}
          color={cfg.color}
          fullWidth
          style={{ marginTop: Spacing.md }}
        />

        {/* Demo shortcuts */}
        {demos.length > 0 && (
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>⚡ Quick demo login</Text>
            {demos.map(d => (
              <TouchableOpacity
                key={d.phone}
                style={[styles.demoCard, { borderColor: cfg.color + '40' }]}
                onPress={() => handleDemo(d.phone)}
                activeOpacity={0.78}
              >
                <View style={[styles.demoAvatar, { backgroundColor: cfg.color }]}>
                  <Text style={styles.demoAvatarText}>{d.name[0]}</Text>
                </View>
                <View style={styles.demoInfo}>
                  <Text style={styles.demoName}>{d.name}</Text>
                  <Text style={styles.demoPhone}>{d.phone}  ·  PIN: 1234</Text>
                </View>
                <Text style={[styles.demoArrow, { color: cfg.color }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '500' },
  roleLabel: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  scroll: { padding: Spacing.lg },
  heading: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  sub: { color: Colors.textMuted, fontSize: FontSize.base, marginBottom: Spacing.xl },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  flag: {
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: '500',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.textPrimary,
  },
  demoSection: { marginTop: Spacing.xxl },
  demoTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    gap: 12,
    ...Shadow.sm,
  },
  demoAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  demoAvatarText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  demoInfo: { flex: 1 },
  demoName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  demoPhone: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  demoArrow: { fontSize: 24, fontWeight: '300' },
});
