import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, getMyTasks } = useApp();
  const tasks = getMyTasks();
  const paidTasks = tasks.filter(t => ['Paid', 'Receipt Issued'].includes(t.status));
  const totalSpent = paidTasks.reduce((s, t) => s + t.basePrice + t.serviceCharge + t.tip, 0);
  const points = currentUser?.discountPoints ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#1D4ED8', '#1E3A8A']} style={styles.header}>
        <Text style={styles.heading}>Wallet</Text>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Discount Points</Text>
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsSub}>Earn more by completing tasks</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>ETB {totalSpent}</Text>
            <Text style={styles.statLabel}>Total spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{paidTasks.length}</Text>
            <Text style={styles.statLabel}>Tasks paid</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment methods</Text>
        {[
          { emoji: '📱', label: 'Telebirr', sub: 'Mobile wallet' },
          { emoji: '🏦', label: 'CBE Birr', sub: 'Bank wallet' },
          { emoji: '🏛️', label: 'Bank Transfer', sub: 'Direct bank' },
        ].map(m => (
          <View key={m.label} style={styles.methodCard}>
            <Text style={styles.methodEmoji}>{m.emoji}</Text>
            <View>
              <Text style={styles.methodName}>{m.label}</Text>
              <Text style={styles.methodSub}>{m.sub}</Text>
            </View>
          </View>
        ))}

        <View style={styles.loyaltyCard}>
          <Text style={styles.loyaltyTitle}>🎁 Loyalty Program</Text>
          <Text style={styles.loyaltySub}>
            Complete {Math.max(0, 5 - (paidTasks.length % 5))} more tasks to earn your next discount reward.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((paidTasks.length % 5) / 5) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{paidTasks.length % 5}/5 tasks</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  heading: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  pointsCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  pointsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  pointsValue: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: '800', marginVertical: 4 },
  pointsSub: { color: 'rgba(255,255,255,0.55)', fontSize: FontSize.xs },
  content: { padding: Spacing.md, gap: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.posterPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  methodEmoji: { fontSize: 26 },
  methodName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  methodSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  loyaltyCard: { backgroundColor: Colors.posterLight, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.posterPrimary + '30' },
  loyaltyTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.posterPrimary, marginBottom: 6 },
  loyaltySub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  progressBar: { height: 8, backgroundColor: Colors.posterPrimary + '25', borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: Colors.posterPrimary, borderRadius: Radius.full },
  progressText: { fontSize: FontSize.xs, color: Colors.posterPrimary, fontWeight: '600', marginTop: 6 },
});
