import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { getCategoryById } from '../../data/services';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveJobScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;
  const { getTaskById, getUserById, startTask, completeTask, rateTask } = useApp();

  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  const task = getTaskById(taskId);
  const poster = task?.posterId ? getUserById(task.posterId) : null;
  const cat = task ? getCategoryById(task.categoryId) : null;

  useEffect(() => {
    if (!task || !['Assigned', 'In Progress'].includes(task.status)) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [task?.status]);

  if (!task) return null;

  const total = task.basePrice + task.serviceCharge + task.tip;
  const isPaid = ['Paid', 'Receipt Issued'].includes(task.status);
  const isCompleted = ['Completed', 'Invoice Sent', 'Paid', 'Receipt Issued'].includes(task.status);

  function handleStart() {
    Alert.alert('Start task?', 'Confirm you have arrived and are starting the task.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Task', onPress: () => startTask(taskId) },
    ]);
  }

  function handleComplete() {
    Alert.alert('Mark as complete?', 'Confirm you have finished the task. This will trigger the invoice.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => completeTask(taskId) },
    ]);
  }

  function handleRate(stars: number) {
    setRating(stars);
    if (!rated) {
      rateTask(taskId, stars, 'lifer');
      setRated(true);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#16A34A', '#15803D']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Job</Text>
        <View>
          <StatusBadge status={task.status} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={[styles.catIcon, { backgroundColor: (cat?.color ?? Colors.liferPrimary) + '18' }]}>
              <Text style={{ fontSize: 24 }}>{cat?.icon ?? '📋'}</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>{task.title}</Text>
              <Text style={styles.summaryLocation}>📍 {task.location.area}, {task.location.city}</Text>
            </View>
            <Text style={styles.summaryEarning}>ETB {total}</Text>
          </View>
        </View>

        {/* Timer (only when in progress) */}
        {task.status === 'In Progress' && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Time on task</Text>
            <Text style={styles.timerValue}>{formatTime(elapsed)}</Text>
          </View>
        )}

        {/* Poster contact */}
        {poster && (
          <View style={styles.posterCard}>
            <Text style={styles.sectionLabel}>Poster</Text>
            <View style={styles.posterRow}>
              <Avatar name={poster.name} size={48} />
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>{poster.name}</Text>
                <Text style={styles.posterRating}>⭐ {poster.rating.toFixed(1)} · {poster.ratingCount} tasks</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Text style={{ fontSize: 22 }}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionLabel}>Task location</Text>
          <Text style={styles.locationMain}>{task.location.area}, {task.location.city}</Text>
          {task.location.landmark ? <Text style={styles.locationSub}>{task.location.landmark}</Text> : null}
        </View>

        {/* Payment awaiting */}
        {task.status === 'Invoice Sent' && (
          <View style={styles.waitingCard}>
            <Text style={styles.waitingEmoji}>⏳</Text>
            <View>
              <Text style={styles.waitingTitle}>Waiting for payment</Text>
              <Text style={styles.waitingSub}>Invoice sent · ETB {total} pending</Text>
            </View>
          </View>
        )}

        {/* Payment received */}
        {isPaid && (
          <View style={styles.paidCard}>
            <View style={styles.paidHeader}>
              <Text style={styles.paidEmoji}>💚</Text>
              <View>
                <Text style={styles.paidTitle}>Payment received!</Text>
                <Text style={styles.paidAmount}>ETB {total}</Text>
              </View>
            </View>

            {/* Rate poster */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Rate your poster</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => handleRate(star)}>
                    <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {rated && <Text style={styles.thankYou}>Thanks for rating! 🎉</Text>}
            </View>

            <Button
              label="Back to Discover"
              onPress={() => navigation.navigate('LiferDiscover')}
              color={Colors.liferPrimary}
              fullWidth
              style={{ marginTop: Spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* Action footer */}
      {!isCompleted && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          {task.status === 'Assigned' && (
            <Button
              label="Start Task"
              onPress={handleStart}
              color={Colors.liferPrimary}
              fullWidth
              style={{ borderRadius: Radius.lg }}
            />
          )}
          {task.status === 'In Progress' && (
            <Button
              label="Mark as Complete"
              onPress={handleComplete}
              color={Colors.liferPrimary}
              fullWidth
              style={{ borderRadius: Radius.lg }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, paddingTop: 12 },
  backBtn: { paddingVertical: 6, marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.base },
  headerTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginBottom: 8 },
  content: { padding: Spacing.md, paddingBottom: 24 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  summaryInfo: { flex: 1 },
  summaryTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  summaryLocation: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  summaryEarning: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.liferPrimary },
  timerCard: {
    backgroundColor: Colors.liferLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.liferPrimary + '30',
  },
  timerLabel: { fontSize: FontSize.sm, color: Colors.liferPrimary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  timerValue: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.liferDark, marginTop: 4, fontVariant: ['tabular-nums'] },
  posterCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  posterInfo: { flex: 1 },
  posterName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  posterRating: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 3 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.liferLight, alignItems: 'center', justifyContent: 'center' },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  locationMain: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  locationSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  waitingEmoji: { fontSize: 28 },
  waitingTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  waitingSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 3 },
  paidCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.liferLight,
    ...Shadow.md,
  },
  paidHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg },
  paidEmoji: { fontSize: 36 },
  paidTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  paidAmount: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.liferPrimary, marginTop: 4 },
  ratingSection: {},
  ratingTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 36, color: Colors.gray300 },
  starActive: { color: '#F59E0B' },
  thankYou: { fontSize: FontSize.sm, color: Colors.liferPrimary, fontWeight: '600', marginTop: Spacing.sm },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
