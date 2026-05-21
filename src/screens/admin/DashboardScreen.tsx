import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';

function MetricCard({ emoji, value, label, color, onPress }: {
  emoji: string; value: string | number; label: string; color: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.metricCard, { borderTopColor: color, borderTopWidth: 3 }]} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { tasks, users, verifications, disputes, currentUser, logout } = useApp();

  const openTasks = tasks.filter(t => t.status === 'Open').length;
  const activeTasks = tasks.filter(t => ['Assigned', 'In Progress'].includes(t.status)).length;
  const pendingVerifications = verifications.filter(v => ['submitted', 'under_review'].includes(v.status)).length;
  const openDisputes = disputes.filter(d => d.status === 'Open' || d.status === 'Under Review').length;
  const lifers = users.filter(u => u.role === 'lifer').length;
  const posters = users.filter(u => u.role === 'poster').length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#334155']} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Admin Console</Text>
            <Text style={styles.adminName}>{currentUser?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
            <Avatar name={currentUser?.name ?? 'A'} size={42} color={Colors.gray600} />
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>Life · Operations Dashboard</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alerts */}
        {(pendingVerifications > 0 || openDisputes > 0) && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>🔔 Action required</Text>
            {pendingVerifications > 0 && (
              <Text style={styles.alertItem}>• {pendingVerifications} verification(s) awaiting review</Text>
            )}
            {openDisputes > 0 && (
              <Text style={styles.alertItem}>• {openDisputes} open dispute(s)</Text>
            )}
          </View>
        )}

        {/* Metrics grid */}
        <Text style={styles.sectionTitle}>Platform overview</Text>
        <View style={styles.metricsGrid}>
          <MetricCard emoji="📋" value={tasks.length} label="Total tasks" color={Colors.info} onPress={() => {}} />
          <MetricCard emoji="⚡" value={activeTasks} label="Active now" color={Colors.warning} />
          <MetricCard emoji="✅" value={tasks.filter(t => ['Paid', 'Receipt Issued'].includes(t.status)).length} label="Completed" color={Colors.liferPrimary} />
          <MetricCard emoji="🔓" value={openTasks} label="Open tasks" color={Colors.posterPrimary} />
          <MetricCard emoji="💼" value={lifers} label="Lifers" color={Colors.liferPrimary} />
          <MetricCard emoji="👥" value={posters} label="Posters" color={Colors.posterPrimary} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Operations</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            emoji="🔐"
            title="Verifications"
            count={pendingVerifications}
            countColor={Colors.warning}
            onPress={() => navigation.navigate('AdminVerifications')}
          />
          <ActionCard
            emoji="⚠️"
            title="Disputes"
            count={openDisputes}
            countColor={Colors.error}
            onPress={() => navigation.navigate('AdminDisputes')}
          />
          <ActionCard
            emoji="💰"
            title="Pricing"
            count={null}
            countColor={Colors.liferPrimary}
            onPress={() => navigation.navigate('AdminPricing')}
          />
          <ActionCard
            emoji="👤"
            title="My Profile"
            count={null}
            countColor={Colors.gray600}
            onPress={() => navigation.navigate('AdminProfile')}
          />
        </View>

        {/* Recent tasks */}
        <Text style={styles.sectionTitle}>Recent tasks</Text>
        {tasks.slice(0, 5).map(task => (
          <View key={task.id} style={styles.taskRow}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              <Text style={styles.taskMeta}>{task.location.area} · {task.status}</Text>
            </View>
            <Text style={styles.taskPrice}>ETB {task.basePrice + task.serviceCharge}</Text>
          </View>
        ))}

        <Button label="Sign out" onPress={logout} variant="outline" color={Colors.error} fullWidth style={{ marginTop: Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function ActionCard({ emoji, title, count, countColor, onPress }: {
  emoji: string; title: string; count: number | null; countColor: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      {count !== null && count > 0 && (
        <View style={[styles.actionBadge, { backgroundColor: countColor }]}>
          <Text style={styles.actionBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  greeting: { color: 'rgba(255,255,255,0.55)', fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  adminName: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  tagline: { color: 'rgba(255,255,255,0.35)', fontSize: FontSize.xs, letterSpacing: 1.5, fontWeight: '600' },
  content: { padding: Spacing.md, paddingBottom: 32 },
  alertCard: { backgroundColor: Colors.warningLight, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '40' },
  alertTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  alertItem: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 3 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: {
    width: '31%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    ...Shadow.sm,
  },
  metricValue: { fontSize: FontSize.xl, fontWeight: '800' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    ...Shadow.sm,
  },
  actionTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  actionBadge: { position: 'absolute', top: 8, right: 8, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  actionBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: 12, ...Shadow.sm },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  taskMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  taskPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.posterPrimary },
});
