import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { getCategoryById } from '../../data/services';

const TIMELINE_STEPS = [
  { key: 'Open',         label: 'Posted',      emoji: '📋' },
  { key: 'Assigned',     label: 'Accepted',    emoji: '🤝' },
  { key: 'In Progress',  label: 'Started',     emoji: '⚡' },
  { key: 'Completed',    label: 'Completed',   emoji: '✅' },
  { key: 'Invoice Sent', label: 'Invoice',     emoji: '🧾' },
  { key: 'Receipt Issued', label: 'Paid',      emoji: '💳' },
];

const STATUS_ORDER = ['Open', 'Assigned', 'In Progress', 'Completed', 'Invoice Sent', 'Receipt Issued'];

export default function PosterTaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;
  const { getTaskById, getUserById, cancelTask } = useApp();

  const task = getTaskById(taskId);
  if (!task) return null;

  const lifer = task.liferId ? getUserById(task.liferId) : null;
  const cat = getCategoryById(task.categoryId);
  const currentStepIdx = STATUS_ORDER.indexOf(task.status);
  const total = task.basePrice + task.serviceCharge + task.tip;

  function handleCancel() {
    Alert.alert('Cancel task?', 'Are you sure you want to cancel this task?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel task',
        style: 'destructive',
        onPress: () => {
          cancelTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Task Detail" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Task header */}
        <View style={styles.taskHeader}>
          <View style={[styles.catIcon, { backgroundColor: (cat?.color ?? '#1D4ED8') + '18' }]}>
            <Text style={{ fontSize: 28 }}>{cat?.icon ?? '📋'}</Text>
          </View>
          <View style={styles.taskHeaderInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskLocation}>📍 {task.location.area}, {task.location.city}</Text>
            <View style={{ marginTop: 6 }}>
              <StatusBadge status={task.status} />
            </View>
          </View>
        </View>

        {/* Lifer card (if assigned) */}
        {lifer && (
          <View style={styles.liferCard}>
            <Text style={styles.sectionLabel}>Your Lifer</Text>
            <View style={styles.liferRow}>
              <Avatar name={lifer.name} size={52} color={Colors.liferPrimary} />
              <View style={styles.liferInfo}>
                <Text style={styles.liferName}>{lifer.name}</Text>
                <Text style={styles.liferRating}>⭐ {lifer.rating.toFixed(1)} · {lifer.ratingCount} jobs</Text>
                <Text style={styles.liferBadge}>✓ Verified Lifer</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Text style={{ fontSize: 22 }}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Task timeline</Text>
          {TIMELINE_STEPS.map((step, idx) => {
            const done = idx <= currentStepIdx;
            const active = idx === currentStepIdx;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]}>
                    {done && <Text style={{ fontSize: 10 }}>{step.emoji}</Text>}
                  </View>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, idx < currentStepIdx && styles.timelineLineDone]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, done && styles.timelineLabelDone, active && { fontWeight: '700' }]}>
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Price breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Price breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service</Text>
              <Text style={styles.priceValue}>ETB {task.basePrice}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>ETB {task.serviceCharge}</Text>
            </View>
            {task.tip > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tip</Text>
                <Text style={[styles.priceValue, { color: Colors.liferPrimary }]}>+ETB {task.tip}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>ETB {total}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationMain}>{task.location.area}, {task.location.city}</Text>
            {task.location.landmark ? <Text style={styles.locationSub}>{task.location.landmark}</Text> : null}
          </View>
        </View>

        {/* Actions */}
        {task.status === 'Invoice Sent' && (
          <Button
            label={`Pay ETB ${total}`}
            onPress={() => navigation.navigate('Invoice', { taskId })}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        )}

        {['Open', 'Assigned'].includes(task.status) && (
          <Button
            label="Cancel Task"
            onPress={handleCancel}
            variant="outline"
            color={Colors.error}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 32 },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  catIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  taskHeaderInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  taskLocation: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  liferCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.liferLight,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  liferRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  liferInfo: { flex: 1 },
  liferName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  liferRating: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 3 },
  liferBadge: { fontSize: FontSize.xs, color: Colors.liferPrimary, fontWeight: '600', marginTop: 3 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.liferLight, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: Spacing.md },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  timelineRow: { flexDirection: 'row', minHeight: 48 },
  timelineLeft: { width: 32, alignItems: 'center' },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { borderColor: Colors.posterPrimary, backgroundColor: Colors.posterLight },
  timelineDotActive: { borderColor: Colors.posterPrimary, backgroundColor: Colors.posterPrimary },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.gray200, marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.posterPrimary },
  timelineContent: { flex: 1, paddingLeft: 12, paddingTop: 4, paddingBottom: 12 },
  timelineLabel: { fontSize: FontSize.base, color: Colors.gray400 },
  timelineLabelDone: { color: Colors.textPrimary },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  priceLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  priceValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  totalRow: { borderBottomWidth: 0, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.posterPrimary },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  locationMain: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  locationSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
});
