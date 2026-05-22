import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, TypeScale, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';

export default function CallCenterDashScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, disputes, verifications, currentUser, logout } = useApp();

  const activeTasks = tasks.filter(t => ['Open', 'Assigned', 'In Progress'].includes(t.status));
  const pendingApprovals = verifications.filter(v => v.status === 'submitted').length;
  const openDisputes = disputes.filter(d => d.status === 'Open').length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4C1D95', '#6D28D9']} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>Support Desk</Text>
            <Text style={styles.name}>{currentUser?.name}</Text>
            <Text style={styles.role}>{currentUser?.employeeTitle ?? 'Support Agent'}</Text>
          </View>
          <Avatar name={currentUser?.name ?? 'S'} size={52} color="rgba(255,255,255,0.2)" />
        </View>
        <View style={styles.shiftTag}>
          <Text style={styles.shiftText}>🕐 {currentUser?.shift ?? 'Morning shift'}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live stats */}
        <Text style={styles.sectionTitle}>Live dashboard</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: Colors.info }]}>
            <Text style={styles.statValue}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Active tasks</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.warning }]}>
            <Text style={styles.statValue}>{pendingApprovals}</Text>
            <Text style={styles.statLabel}>Approvals</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.error }]}>
            <Text style={styles.statValue}>{openDisputes}</Text>
            <Text style={styles.statLabel}>Disputes</Text>
          </View>
        </View>

        {/* Current tasks */}
        <Text style={styles.sectionTitle}>Current tasks</Text>
        {activeTasks.slice(0, 5).map(task => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskRow}>
              <View>
                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                <Text style={styles.taskMeta}>📍 {task.location.area} · {task.status}</Text>
              </View>
              <View style={[styles.statusDot, {
                backgroundColor: task.status === 'In Progress' ? Colors.warning :
                  task.status === 'Assigned' ? Colors.info : Colors.liferPrimary,
              }]} />
            </View>
          </View>
        ))}
        {activeTasks.length === 0 && (
          <Text style={styles.emptyText}>No active tasks right now</Text>
        )}

        {/* Dispute history */}
        <Text style={styles.sectionTitle}>Dispute client history</Text>
        {disputes.slice(0, 3).map(d => (
          <View key={d.id} style={styles.disputeCard}>
            <Text style={styles.disputeTitle} numberOfLines={1}>{d.summary}</Text>
            <Text style={styles.disputeMeta}>{d.raisedByRole} · {d.status}</Text>
          </View>
        ))}

        <Button label="Log out" onPress={logout} variant="outline" color={Colors.error} fullWidth style={{ marginTop: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  label: { color: 'rgba(255,255,255,0.55)', ...TypeScale.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  name: { color: Colors.white, ...TypeScale.titleLg, fontWeight: '800', marginTop: 4 },
  role: { color: 'rgba(255,255,255,0.65)', ...TypeScale.body, marginTop: 3 },
  shiftTag: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, alignSelf: 'flex-start' },
  shiftText: { color: Colors.white, ...TypeScale.body, fontWeight: '600' },
  content: { padding: Spacing.md, paddingBottom: 32 },
  sectionTitle: { ...TypeScale.title, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderTopWidth: 3, ...Shadow.sm },
  statValue: { ...TypeScale.headline, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 3 },
  taskCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  taskMeta: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 3 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  disputeCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  disputeTitle: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary },
  disputeMeta: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 3 },
  emptyText: { color: Colors.textMuted, ...TypeScale.bodyLg, textAlign: 'center', paddingVertical: Spacing.md },
});
