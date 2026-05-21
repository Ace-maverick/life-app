import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/services';

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentUser, submitVerification } = useApp();

  const [city, setCity] = useState(currentUser?.serviceArea ?? '');
  const [serviceArea, setServiceArea] = useState('');
  const [radius, setRadius] = useState('5');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentUser?.workTypes ?? []);
  const [loading, setLoading] = useState(false);

  const status = currentUser?.verificationStatus;

  function toggleCategory(id: string) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!city || !serviceArea || selectedCategories.length === 0) {
      Alert.alert('Missing info', 'Please fill in all required fields and select at least one work category.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      submitVerification({
        liferId: currentUser!.id,
        liferName: currentUser!.name,
        phone: currentUser!.phone,
        city,
        serviceArea,
        workTypes: selectedCategories,
        radius: parseInt(radius) || 5,
      });
      setLoading(false);
      Alert.alert('Submitted!', 'Your verification has been submitted. Admin will review within 24 hours.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1000);
  }

  const statusColors: Record<string, string> = {
    submitted: Colors.warning,
    under_review: Colors.info,
    approved: Colors.liferPrimary,
    rejected: Colors.error,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Verification" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {status && status !== 'none' && (
          <View style={[styles.statusBanner, { backgroundColor: (statusColors[status] ?? Colors.gray400) + '15', borderColor: (statusColors[status] ?? Colors.gray400) + '40' }]}>
            <Text style={[styles.statusText, { color: statusColors[status] ?? Colors.textPrimary }]}>
              {status === 'submitted' ? '⏳ Verification submitted – under review' :
               status === 'under_review' ? '🔍 Under admin review' :
               status === 'approved' ? '✅ Verified Lifer' :
               '❌ Verification rejected – please resubmit'}
            </Text>
          </View>
        )}

        <Text style={styles.heading}>Complete your profile</Text>
        <Text style={styles.sub}>This information is used to match you with tasks in your area</Text>

        <Text style={styles.label}>City *</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Addis Ababa" placeholderTextColor={Colors.gray400} />

        <Text style={styles.label}>Service Area *</Text>
        <TextInput style={styles.input} value={serviceArea} onChangeText={setServiceArea} placeholder="e.g. Bole, Piazza, CMC" placeholderTextColor={Colors.gray400} />

        <Text style={styles.label}>Working radius (km)</Text>
        <View style={styles.radiusRow}>
          {['2', '4', '5', '8', '10'].map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusBtnText, radius === r && styles.radiusBtnTextActive]}>{r} km</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Work categories *</Text>
        <Text style={styles.labelSub}>Select all categories you can work in</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map(cat => {
            const selected = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, selected && { backgroundColor: cat.color + '15', borderColor: cat.color }]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                <Text style={[styles.catBtnText, selected && { color: cat.color }]}>{cat.name}</Text>
                {selected && <Text style={[styles.check, { color: cat.color }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.idSection}>
          <Text style={styles.label}>Fayda ID (Demo)</Text>
          <TextInput style={styles.input} placeholder="Enter Fayda ID number" placeholderTextColor={Colors.gray400} />
          <Text style={styles.idNote}>In production, this will connect to Fayda identity verification.</Text>
        </View>

        <Button
          label={status === 'rejected' ? 'Resubmit Verification' : 'Submit for Verification'}
          onPress={handleSubmit}
          color={Colors.liferPrimary}
          fullWidth
          loading={loading}
          style={{ marginTop: Spacing.lg, borderRadius: Radius.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  statusBanner: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.lg },
  statusText: { fontSize: FontSize.base, fontWeight: '600' },
  heading: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  sub: { color: Colors.textMuted, fontSize: FontSize.base, marginBottom: Spacing.xl, lineHeight: 22 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.6 },
  labelSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: -Spacing.xs + 2 },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  radiusRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  radiusBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  radiusBtnActive: { backgroundColor: Colors.liferPrimary, borderColor: Colors.liferPrimary },
  radiusBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  radiusBtnTextActive: { color: Colors.white },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  catBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  check: { fontSize: 12, fontWeight: '700' },
  idSection: { marginBottom: Spacing.md },
  idNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: -Spacing.sm + 2, fontStyle: 'italic' },
});
