import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import Avatar from '../../components/Avatar';
import { useApp } from '../../context/AppContext';
import { VerificationRequest } from '../../data/types';

const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    bg: Colors.warningLight, text: Colors.warning },
  under_review: { label: 'Under Review', bg: Colors.infoLight,    text: Colors.info },
  approved:     { label: 'Approved',     bg: Colors.successLight, text: Colors.liferPrimary },
  rejected:     { label: 'Rejected',     bg: Colors.errorLight,   text: Colors.error },
  suspended:    { label: 'Suspended',    bg: Colors.gray100,      text: Colors.gray500 },
  none:         { label: 'None',         bg: Colors.gray100,      text: Colors.gray400 },
};

export default function AdminVerificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { verifications, reviewVerification } = useApp();
  const pending = verifications.filter(v => ['submitted', 'under_review'].includes(v.status));
  const reviewed = verifications.filter(v => ['approved', 'rejected'].includes(v.status));

  function handleReview(ver: VerificationRequest, approve: boolean) {
    Alert.alert(
      approve ? 'Approve verification?' : 'Reject verification?',
      `${approve ? 'Approve' : 'Reject'} ${ver.liferName}'s verification request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approve ? 'Approve' : 'Reject',
          style: approve ? 'default' : 'destructive',
          onPress: () => reviewVerification(ver.id, approve, approve ? 'Approved by admin.' : 'Rejected by admin.'),
        },
      ]
    );
  }

  function VerCard({ ver }: { ver: VerificationRequest }) {
    const cfg = STATUS_CONFIG[ver.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.none;
    const isPending = ['submitted', 'under_review'].includes(ver.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar name={ver.liferName} size={44} color={Colors.liferPrimary} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{ver.liferName}</Text>
            <Text style={styles.cardPhone}>{ver.phone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.detail}>📍 {ver.serviceArea}, {ver.city}</Text>
          <Text style={styles.detail}>📏 {ver.radius} km radius</Text>
          <Text style={styles.detail}>💼 {ver.workTypes.join(', ')}</Text>
          <Text style={styles.detail}>📅 {new Date(ver.submittedAt).toLocaleDateString()}</Text>
        </View>
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReview(ver, false)}>
              <Text style={styles.rejectText}>✕ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleReview(ver, true)}>
              <Text style={styles.approveText}>✓ Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Verifications" subtitle={`${pending.length} pending`} onBack={() => navigation.goBack()} />
      <FlatList
        data={[...pending, ...reviewed]}
        keyExtractor={v => v.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <VerCard ver={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>No verification requests</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  cardInfo: { flex: 1 },
  cardName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  cardPhone: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  cardDetails: { gap: 4, marginBottom: Spacing.md },
  detail: { fontSize: FontSize.sm, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  rejectBtn: { flex: 1, padding: 10, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.error, alignItems: 'center' },
  rejectText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.sm },
  approveBtn: { flex: 1, padding: 10, borderRadius: Radius.lg, backgroundColor: Colors.liferPrimary, alignItems: 'center' },
  approveText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textMuted },
});
