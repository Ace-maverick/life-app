import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Notification } from '../../data/types';

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  task:         { emoji: '📋', bg: Colors.infoLight,    color: Colors.info },
  payment:      { emoji: '💳', bg: Colors.successLight, color: Colors.liferPrimary },
  verification: { emoji: '🔐', bg: Colors.warningLight, color: Colors.warning },
  dispute:      { emoji: '⚠️', bg: Colors.errorLight,   color: Colors.error },
  system:       { emoji: '🔔', bg: Colors.gray100,      color: Colors.gray600 },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({ notif, onPress }: { notif: Notification; onPress: () => void }) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
  return (
    <TouchableOpacity
      style={[styles.card, !notif.isRead && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[styles.icon, { backgroundColor: cfg.bg }]}>
        <Text style={{ fontSize: 18 }}>{cfg.emoji}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{notif.title}</Text>
          {!notif.isRead && <View style={[styles.dot, { backgroundColor: cfg.color }]} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{notif.body}</Text>
        <Text style={styles.time}>{timeAgo(notif.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Active Task Progress Tracker ─────────────────────────────────────────────

const PROGRESS_STEPS = [
  { status: 'Assigned',    label: 'Lifer on the way', emoji: '🏃' },
  { status: 'In Progress', label: 'Working',           emoji: '⚡' },
  { status: 'Completed',   label: 'Done',              emoji: '✅' },
  { status: 'Invoice Sent',label: 'Invoice ready',     emoji: '🧾' },
];

function ActiveTaskTracker({ taskStatus, taskTitle }: { taskStatus: string; taskTitle: string }) {
  const currentIdx = PROGRESS_STEPS.findIndex(s => s.status === taskStatus);
  if (currentIdx < 0) return null;

  return (
    <View style={styles.trackerCard}>
      <View style={styles.trackerHeader}>
        <Text style={styles.trackerLabel}>🔴 Live</Text>
        <Text style={styles.trackerTitle} numberOfLines={1}>{taskTitle}</Text>
      </View>
      <View style={styles.trackerSteps}>
        {PROGRESS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          return (
            <View key={step.status} style={styles.trackerStep}>
              <View style={[
                styles.trackerDot,
                done && styles.trackerDotDone,
                active && styles.trackerDotActive,
              ]}>
                <Text style={{ fontSize: 9 }}>{done ? step.emoji : ''}</Text>
              </View>
              {idx < PROGRESS_STEPS.length - 1 && (
                <View style={[styles.trackerLine, done && idx < currentIdx && styles.trackerLineDone]} />
              )}
              <Text style={[styles.trackerStepLabel, active && { color: Colors.posterPrimary, fontWeight: '700' }]} numberOfLines={1}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { getMyNotifications, markAllRead, getMyTasks, currentUser } = useApp();

  const notifs = getMyNotifications();
  const unread = notifs.filter(n => !n.isRead).length;

  // Find active task for progress tracker (poster-side)
  const activePosterTask = currentUser?.role === 'poster'
    ? getMyTasks().find(t => ['Assigned', 'In Progress', 'Invoice Sent'].includes(t.status))
    : undefined;

  function handleNotifPress(notif: Notification) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!notif.relatedTaskId) return;

    if (notif.type === 'payment') {
      // Route payment notifications to Invoice screen
      navigation.navigate('HomeTab', {
        screen: 'Invoice',
        params: { taskId: notif.relatedTaskId },
      });
    } else if (notif.type === 'task' || notif.type === 'dispute') {
      // Route task/dispute notifications to task detail
      navigation.navigate('HomeTab', {
        screen: 'PosterTaskDetail',
        params: { taskId: notif.relatedTaskId },
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          {unread > 0 && <Text style={styles.unreadCount}>{unread} unread</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          activePosterTask ? (
            <ActiveTaskTracker
              taskStatus={activePosterTask.status}
              taskTitle={activePosterTask.title}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <NotifCard notif={item} onPress={() => handleNotifPress(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  unreadCount: { fontSize: FontSize.sm, color: Colors.posterPrimary, fontWeight: '600', marginTop: 2 },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray100,
  },
  markAllText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  // Notification card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.posterPrimary,
    backgroundColor: Colors.posterLight + '30',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  time: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 5 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: 6 },
  // Active task tracker
  trackerCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.posterPrimary + '40',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  trackerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  trackerLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.error },
  trackerTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  trackerSteps: { flexDirection: 'row', alignItems: 'flex-start' },
  trackerStep: { flex: 1, alignItems: 'center' },
  trackerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.gray300,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  trackerDotDone: { borderColor: Colors.posterPrimary, backgroundColor: Colors.posterLight },
  trackerDotActive: { borderColor: Colors.posterPrimary, backgroundColor: Colors.posterPrimary },
  trackerLine: {
    position: 'absolute',
    top: 14,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.gray200,
    zIndex: -1,
  },
  trackerLineDone: { backgroundColor: Colors.posterPrimary },
  trackerStepLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', lineHeight: 12 },
});
