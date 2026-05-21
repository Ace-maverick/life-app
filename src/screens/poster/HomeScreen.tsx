import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { Task } from '../../data/types';
import { CATEGORIES, getCategoryById } from '../../data/services';

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  const cat = getCategoryById(task.categoryId);
  const isFinished = ['Receipt Issued', 'Completed', 'Cancelled', 'Dispute Resolved'].includes(task.status);

  return (
    <TouchableOpacity
      style={[styles.taskCard, isFinished && styles.taskCardFinished]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.taskCardRow}>
        <View style={[styles.taskIcon, { backgroundColor: (cat?.color ?? '#1D4ED8') + '18' }]}>
          <Text style={styles.taskEmoji}>{cat?.icon ?? '📋'}</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.taskLocation} numberOfLines={1}>📍 {task.location.area}, {task.location.city}</Text>
        </View>
        <View style={styles.taskRight}>
          <Text style={styles.taskPrice}>ETB {task.basePrice + task.serviceCharge + task.tip}</Text>
          {isFinished
            ? <View style={styles.reorderBadge}><Text style={styles.reorderBadgeText}>↩ Reorder</Text></View>
            : <StatusBadge status={task.status} size="sm" />
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Order Again Modal ────────────────────────────────────────────────────────

function OrderAgainModal({
  task,
  visible,
  onClose,
  onReorderSame,
  onEditAndPost,
}: {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onReorderSame: () => void;
  onEditAndPost: () => void;
}) {
  if (!task) return null;
  const cat = getCategoryById(task.categoryId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          {/* Handle bar */}
          <View style={styles.modalHandle} />

          <View style={styles.modalTaskRow}>
            <View style={[styles.modalTaskIcon, { backgroundColor: (cat?.color ?? '#1D4ED8') + '18' }]}>
              <Text style={{ fontSize: 24 }}>{cat?.icon ?? '📋'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Order Again?</Text>
              <Text style={styles.modalSub} numberOfLines={2}>{task.title}</Text>
              <Text style={styles.modalPrice}>ETB {task.basePrice + task.serviceCharge}</Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          <Button
            label="⚡  Reorder Same — Instant"
            onPress={onReorderSame}
            fullWidth
            style={styles.modalBtn}
          />
          <Button
            label="✏️  Edit & Post"
            onPress={onEditAndPost}
            variant="outline"
            fullWidth
            style={styles.modalBtn}
          />
          <TouchableOpacity onPress={onClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PosterHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentUser, getMyTasks, getUnreadCount, createTask } = useApp();
  const scrollRef = useRef<ScrollView>(null);

  const [orderAgainTask, setOrderAgainTask] = useState<Task | null>(null);
  const [showOrderAgain, setShowOrderAgain] = useState(false);

  // Reset scroll to top whenever this tab comes back into focus
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const tasks = getMyTasks();
  const activeTasks = tasks.filter(t => ['Open', 'Assigned', 'In Progress', 'Invoice Sent'].includes(t.status));
  const recentTasks = tasks.slice(0, 6);
  const unread = getUnreadCount();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  function handleTaskPress(task: Task) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const isFinished = ['Receipt Issued', 'Completed', 'Cancelled', 'Dispute Resolved'].includes(task.status);
    if (isFinished) {
      setOrderAgainTask(task);
      setShowOrderAgain(true);
    } else if (task.status === 'Invoice Sent') {
      navigation.navigate('Invoice', { taskId: task.id });
    } else {
      navigation.navigate('PosterTaskDetail', { taskId: task.id });
    }
  }

  function handleReorderSame() {
    setShowOrderAgain(false);
    if (!orderAgainTask || !currentUser) return;
    const newTask = createTask({
      posterId: currentUser.id,
      categoryId: orderAgainTask.categoryId,
      subcategoryId: orderAgainTask.subcategoryId,
      jobTypeId: orderAgainTask.jobTypeId,
      title: orderAgainTask.title,
      description: orderAgainTask.description,
      location: orderAgainTask.location,
      urgency: orderAgainTask.urgency,
      basePrice: orderAgainTask.basePrice,
      serviceCharge: orderAgainTask.serviceCharge,
    });
    navigation.navigate('Searching', { taskId: newTask.id });
  }

  function handleEditAndPost() {
    setShowOrderAgain(false);
    if (!orderAgainTask) return;
    navigation.navigate('CreateTask', {
      preselectedCategory: orderAgainTask.categoryId,
    });
  }

  return (
    <View style={styles.container}>
      {/* Hero gradient header — extends behind status bar */}
      <LinearGradient colors={['#1D4ED8', '#2563EB', '#1E3A8A']} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{currentUser?.name ?? 'User'} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            {unread > 0 && (
              <TouchableOpacity
                style={styles.bell}
                onPress={() => navigation.navigate('NotifsTab')}
              >
                <Text>🔔</Text>
                <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{unread}</Text></View>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
              <Avatar name={currentUser?.name ?? 'U'} size={40} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser?.discountPoints ?? 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Post task CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('CreateTask')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.ctaBtnInner}>
            <Text style={styles.ctaPlus}>+</Text>
            <View>
              <Text style={styles.ctaTitle}>Post a Task</Text>
              <Text style={styles.ctaSub}>Get help nearby, instantly</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick categories with swipe indicator */}
        <Text style={styles.sectionTitle}>Quick services</Text>
        <View style={styles.quickRowWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickRow}
            contentContainerStyle={{ paddingRight: 32 }}
          >
            {CATEGORIES.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.quickCat}
                onPress={() => navigation.navigate('CreateTask', { preselectedCategory: cat.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIcon, { backgroundColor: cat.color + '18' }]}>
                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                </View>
                <Text style={styles.quickLabel} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Right-edge fade + swipe hint */}
          <View style={styles.quickFadeEdge} pointerEvents="none">
            <LinearGradient
              colors={['rgba(248,250,252,0)', 'rgba(248,250,252,0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius: 4 }}
            />
          </View>
          <View style={styles.quickSwipeHint} pointerEvents="none">
            <Text style={styles.quickSwipeText}>›</Text>
          </View>
        </View>

        {/* Recent tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent tasks</Text>
          {tasks.length > 4 && (
            <TouchableOpacity onPress={() => navigation.navigate('TasksTab')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySub}>Post your first task to get started</Text>
          </View>
        ) : (
          recentTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task)}
            />
          ))
        )}
      </ScrollView>

      {/* Order Again Modal */}
      <OrderAgainModal
        task={orderAgainTask}
        visible={showOrderAgain}
        onClose={() => setShowOrderAgain(false)}
        onReorderSame={handleReorderSame}
        onEditAndPost={handleEditAndPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  userName: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bell: { position: 'relative', padding: 4 },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statValue: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.65)', fontSize: FontSize.xs, marginTop: 2 },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.md, paddingBottom: 32 },
  ctaBtn: { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.lg, ...Shadow.md },
  ctaBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  ctaPlus: { color: Colors.white, fontSize: 36, fontWeight: '300', lineHeight: 36 },
  ctaTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  ctaSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.posterPrimary, fontWeight: '600' },
  // Quick services
  quickRowWrapper: { position: 'relative', marginHorizontal: -Spacing.md, marginBottom: Spacing.sm },
  quickRow: { paddingHorizontal: Spacing.md },
  quickFadeEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    pointerEvents: 'none',
  },
  quickSwipeHint: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
  },
  quickSwipeText: { fontSize: 18, color: Colors.gray400, fontWeight: '700' },
  quickCat: { alignItems: 'center', marginRight: Spacing.md, width: 72 },
  quickIcon: { width: 56, height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  // Task card
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  taskCardFinished: { opacity: 0.82 },
  taskCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  taskEmoji: { fontSize: 20 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  taskLocation: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  taskRight: { alignItems: 'flex-end', gap: 5 },
  taskPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.posterPrimary },
  reorderBadge: {
    backgroundColor: Colors.posterLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  reorderBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.posterPrimary },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
  // Order Again Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.md,
  },
  modalTaskIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  modalPrice: { fontSize: FontSize.base, fontWeight: '700', color: Colors.posterPrimary, marginTop: 4 },
  modalDivider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
  modalBtn: { marginBottom: Spacing.sm },
  modalCancel: { alignItems: 'center', paddingVertical: Spacing.sm },
  modalCancelText: { fontSize: FontSize.base, color: Colors.textMuted, fontWeight: '600' },
});
