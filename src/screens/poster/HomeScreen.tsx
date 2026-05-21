import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { Task } from '../../data/types';

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  const { getCategoryById } = require('../../data/services');
  const cat = require('../../data/services').getCategoryById(task.categoryId);
  return (
    <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.82}>
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
          <StatusBadge status={task.status} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PosterHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentUser, getMyTasks, getUnreadCount } = useApp();

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hero gradient header */}
      <LinearGradient colors={['#1D4ED8', '#2563EB', '#1E3A8A']} style={styles.header}>
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

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
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

        {/* Quick categories */}
        <Text style={styles.sectionTitle}>Quick services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {require('../../data/services').CATEGORIES.map((cat: any) => (
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
              onPress={() => {
                if (task.status === 'Invoice Sent') {
                  navigation.navigate('Invoice', { taskId: task.id });
                } else {
                  navigation.navigate('PosterTaskDetail', { taskId: task.id });
                }
              }}
            />
          ))
        )}
      </ScrollView>
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
  quickRow: { marginHorizontal: -Spacing.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  quickCat: { alignItems: 'center', marginRight: Spacing.md, width: 72 },
  quickIcon: { width: 56, height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  taskCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  taskEmoji: { fontSize: 20 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  taskLocation: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  taskRight: { alignItems: 'flex-end', gap: 5 },
  taskPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.posterPrimary },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
});
