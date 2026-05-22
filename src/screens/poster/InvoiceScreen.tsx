import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, TypeScale, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../data/types';
import { playPaymentFeedback } from '../../utils/sounds';

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; emoji: string; description: string }> = [
  { id: 'telebirr', label: 'Telebirr', emoji: '📱', description: 'Pay with Telebirr mobile wallet' },
  { id: 'cbe_birr', label: 'CBE Birr', emoji: '🏦', description: 'Pay with CBE Birr' },
  { id: 'bank', label: 'Bank Transfer', emoji: '🏛️', description: 'Direct bank transfer' },
];

export default function InvoiceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;
  const { getTaskById, getUserById, payTask } = useApp();

  const task = getTaskById(taskId);
  if (!task) return null;

  const lifer = task.liferId ? getUserById(task.liferId) : null;
  const total = task.basePrice + task.serviceCharge + task.tip;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePay() {
    if (!selectedMethod) {
      Alert.alert('Select payment method', 'Please choose how you want to pay.');
      return;
    }
    Alert.alert(
      `Pay ETB ${total} via ${selectedMethod === 'telebirr' ? 'Telebirr' : selectedMethod === 'cbe_birr' ? 'CBE Birr' : 'Bank Transfer'}?`,
      'This will complete your payment and release funds to the Lifer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Payment',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              payTask(taskId, selectedMethod);
              playPaymentFeedback();
              setLoading(false);
              navigation.replace('PaymentSuccess', { taskId });
            }, 1500);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Invoice" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Invoice header */}
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceTop}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceId}>{task.invoiceId ?? 'INV-PENDING'}</Text>
          </View>
          <Text style={styles.invoiceTitle}>{task.title}</Text>
          {lifer && (
            <View style={styles.liferRow}>
              <Avatar name={lifer.name} size={36} color={Colors.liferPrimary} />
              <Text style={styles.liferName}>{lifer.name}</Text>
              <Text style={styles.liferRating}>⭐ {lifer.rating}</Text>
            </View>
          )}
          <View style={styles.divider} />

          {/* Line items */}
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Service</Text>
            <Text style={styles.lineValue}>ETB {task.basePrice}</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Platform fee</Text>
            <Text style={styles.lineValue}>ETB {task.serviceCharge}</Text>
          </View>
          {task.tip > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>Tip</Text>
              <Text style={[styles.lineValue, { color: Colors.liferPrimary }]}>+ETB {task.tip}</Text>
            </View>
          )}
          {task.discountApplied > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineLabel}>Discount</Text>
              <Text style={[styles.lineValue, { color: Colors.success }]}>-ETB {task.discountApplied}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total due</Text>
            <Text style={styles.totalAmount}>ETB {total}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionLabel}>Choose payment method</Text>
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => setSelectedMethod(method.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.methodEmoji}>{method.emoji}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodLabel}>{method.label}</Text>
              <Text style={styles.methodDesc}>{method.description}</Text>
            </View>
            <View style={[
              styles.radio,
              selectedMethod === method.id && { borderColor: Colors.posterPrimary },
            ]}>
              {selectedMethod === method.id && <View style={styles.radioFill} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.safetyNote}>
          <Text style={styles.safetyText}>🔒 Your payment is secured by Life platform. Funds are released to the Lifer only after successful payment.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          label={`Pay ETB ${total}`}
          onPress={handlePay}
          fullWidth
          loading={loading}
          disabled={!selectedMethod}
          style={{ borderRadius: Radius.lg }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 16 },
  invoiceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  invoiceLabel: { ...TypeScale.caption, fontWeight: '800', letterSpacing: 2, color: Colors.posterPrimary },
  invoiceId: { ...TypeScale.caption, color: Colors.textMuted, fontWeight: '500' },
  invoiceTitle: { ...TypeScale.titleMd, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  liferRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  liferName: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  liferRating: { ...TypeScale.body, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  lineLabel: { ...TypeScale.bodyLg, color: Colors.textSecondary },
  lineValue: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md, marginTop: Spacing.sm },
  totalLabel: { ...TypeScale.title, fontWeight: '700', color: Colors.textPrimary },
  totalAmount: { ...TypeScale.headline, fontWeight: '800', color: Colors.posterPrimary },
  sectionLabel: { ...TypeScale.caption, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
    ...Shadow.sm,
  },
  methodCardSelected: { borderColor: Colors.posterPrimary, backgroundColor: Colors.posterLight },
  methodEmoji: { fontSize: 26 },
  methodInfo: { flex: 1 },
  methodLabel: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary },
  methodDesc: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.posterPrimary },
  safetyNote: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  safetyText: { ...TypeScale.body, color: Colors.liferPrimary, lineHeight: 20 },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
