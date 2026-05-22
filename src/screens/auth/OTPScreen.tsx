import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, TypeScale, Shadow } from '../../theme';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { RootStackParams } from '../../navigation';

type Nav = NativeStackNavigationProp<RootStackParams>;
type Route = RouteProp<RootStackParams, 'OTP'>;

const ROLE_CONFIG: Record<string, { color: string; label: string }> = {
  poster:     { color: Colors.posterPrimary, label: 'Poster' },
  lifer:      { color: Colors.liferPrimary,  label: 'Lifer' },
  admin:      { color: Colors.gray700,       label: 'Admin' },
  callcenter: { color: '#7C3AED',            label: 'Support Desk' },
};

export default function OTPScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone, role } = route.params;
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.poster;
  const { login } = useApp();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit PIN.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(phone, pin);
      if (!user) {
        Alert.alert('Login failed', 'Phone number or PIN is incorrect. Try 1234 for demo accounts.');
      }
      // Navigation happens automatically via AppNavigator when currentUser is set
    } finally {
      setLoading(false);
    }
  }

  const maskedPhone = phone.replace(/(\d{4})\d{4}(\d+)/, '$1****$2');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { marginTop: insets.top }]}>
        <Text style={[styles.backText, { color: cfg.color }]}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.color + '15' }]}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        <Text style={styles.heading}>Verify your number</Text>
        <Text style={styles.sub}>
          Enter the 4-digit PIN for{'\n'}
          <Text style={[styles.phoneHighlight, { color: cfg.color }]}>{maskedPhone}</Text>
        </Text>

        {/* PIN dots */}
        <View style={styles.pinRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.pinDot,
                { borderColor: cfg.color },
                pin.length > i && { backgroundColor: cfg.color },
              ]}
            />
          ))}
        </View>

        {/* Hidden input */}
        <TextInput
          style={styles.hiddenInput}
          value={pin}
          onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          autoFocus
          caretHidden
        />

        <Button
          label="Verify & Sign In"
          onPress={handleVerify}
          color={cfg.color}
          fullWidth
          loading={loading}
          disabled={pin.length < 4}
          style={{ marginTop: Spacing.xl }}
        />

        <Text style={styles.hint}>
          Demo PIN: <Text style={[styles.hintBold, { color: cfg.color }]}>1234</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { padding: Spacing.md },
  backText: { ...TypeScale.bodyLg, fontWeight: '500' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  icon: { fontSize: 36 },
  heading: { ...TypeScale.headline, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  sub: { ...TypeScale.bodyLg, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  phoneHighlight: { fontWeight: '700' },
  pinRow: { flexDirection: 'row', gap: 16, marginBottom: Spacing.md },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  hint: { marginTop: Spacing.lg, color: Colors.textMuted, ...TypeScale.body },
  hintBold: { fontWeight: '700' },
});
