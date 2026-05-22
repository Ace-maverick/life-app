import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, TypeScale, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { getCategoryById } from '../../data/services';
import { Task } from '../../data/types';

function AvailableTaskCard({ task, onPress, isUrgent }: { task: Task; onPress: () => void; isUrgent?: boolean }) {
  const cat = getCategoryById(task.categoryId);
  const total = task.basePrice + task.serviceCharge + task.tip;
  return (
    <TouchableOpacity
      style={[styles.taskCard, isUrgent && styles.urgentCard]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {isUrgent && (
        <View style={styles.urgentBanner}>
          <Text style={styles.urgentText}>🔴 URGENT – High Priority</Text>
        </View>
      )}
      <View style={styles.taskCardRow}>
        <View style={[styles.taskIcon, { backgroundColor: (cat?.color ?? '#16A34A') + '18' }]}>
          <Text style={{ fontSize: 22 }}>{cat?.icon ?? '📋'}</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.taskLocation}>
            <Text style={{ color: Colors.error }}>📍 </Text>
            <Text style={{ color: Colors.posterPrimary, fontWeight: '600' }}>{task.location.area}</Text>
            {', '}{task.location.city}
          </Text>
          {task.description ? <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text> : null}
        </View>
      </View>
      <View style={styles.taskFooter}>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>ETB {total}</Text>
          {task.tip > 0 && <Text style={styles.tipTag}>+{task.tip} tip</Text>}
        </View>
        <View style={styles.taskMeta}>
          <Text style={styles.urgencyTag}>{task.urgency}</Text>
          <Text style={styles.distanceTag}>~0.4 km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LiferDiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentUser, getOpenTasksForLifer, getActiveTaskForLifer, getUnreadCount } = useApp();

  const openTasks = getOpenTasksForLifer();
  const activeTask = getActiveTaskForLifer();
  const unread = getUnreadCount();

  return (
    <View style={styles.container}>
      {/* Green header — extends behind status bar */}
      <LinearGradient colors={['#16A34A', '#15803D', '#14532D']} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser?.name ?? 'Lifer'} 💪</Text>
          </View>
          <View style={styles.headerRight}>
            {unread > 0 && (
              <TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('LiferNotifsTab')}>
                <Text>🔔</Text>
                <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{unread}</Text></View>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('LiferProfileTab')}>
              <Avatar name={currentUser?.name ?? 'L'} size={40} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: currentUser?.isOnline ? '#4ADE80' : Colors.gray300 }]} />
          <Text style={styles.statusText}>
            {currentUser?.isOnline ? 'Available for work' : 'Offline'}
          </Text>
        </View>
      </LinearGradient>

      {/* Active job banner */}
      {activeTask && (
        <TouchableOpacity
          style={styles.activeJobBanner}
          onPress={() => navigation.navigate('ActiveJob', { taskId: activeTask.id })}
        >
          <LinearGradient colors={['#16A34A', '#22C55E']} style={styles.activeJobBannerInner}>
            <Text style={styles.activeJobEmoji}>⚡</Text>
            <View style={styles.activeJobInfo}>
              <Text style={styles.activeJobLabel}>Active Job</Text>
              <Text style={styles.activeJobTitle} numberOfLines={1}>{activeTask.title}</Text>
            </View>
            <StatusBadge status={activeTask.status} size="sm" />
            <Text style={styles.activeJobArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Verification CTA if not approved */}
      {currentUser?.verificationStatus !== 'approved' && (
        <TouchableOpacity
          style={styles.verifyBanner}
          onPress={() => navigation.navigate('Verification')}
        >
          <Text style={styles.verifyEmoji}>🔐</Text>
          <View style={styles.verifyInfo}>
            <Text style={styles.verifyTitle}>Complete verification</Text>
            <Text style={styles.verifySub}>Get approved to start accepting tasks</Text>
          </View>
          <Text style={styles.verifyArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Task list */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Available tasks</Text>
        <Text style={styles.listCount}>{openTasks.length} nearby</Text>
      </View>

      <FlatList
        data={openTasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AvailableTaskCard
            task={item}
            isUrgent={item.urgency === 'Urgent'}
            onPress={() => navigation.navigate('LiferTaskPreview', { taskId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No tasks available</Text>
            <Text style={styles.emptySub}>Check back soon — new tasks are posted regularly</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { color: 'rgba(255,255,255,0.7)', ...TypeScale.body },
  userName: { color: Colors.white, ...TypeScale.titleLg, fontWeight: '800', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bell: { position: 'relative', padding: 4 },
  bellBadge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  bellBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: Colors.white, ...TypeScale.body, fontWeight: '600' },
  activeJobBanner: { marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md },
  activeJobBannerInner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 10 },
  activeJobEmoji: { fontSize: 22 },
  activeJobInfo: { flex: 1 },
  activeJobLabel: { color: 'rgba(255,255,255,0.7)', ...TypeScale.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  activeJobTitle: { color: Colors.white, ...TypeScale.bodyLg, fontWeight: '700', marginTop: 2 },
  activeJobArrow: { color: Colors.white, fontSize: 22 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  verifyEmoji: { fontSize: 24 },
  verifyInfo: { flex: 1 },
  verifyTitle: { ...TypeScale.bodyLg, fontWeight: '700', color: Colors.textPrimary },
  verifySub: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 2 },
  verifyArrow: { fontSize: 22, color: Colors.warning },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  listTitle: { ...TypeScale.title, fontWeight: '700', color: Colors.textPrimary },
  listCount: { ...TypeScale.body, color: Colors.liferPrimary, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 24, gap: Spacing.sm },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  urgentCard: { borderColor: Colors.error + '60' },
  urgentBanner: { backgroundColor: Colors.error + '12', marginHorizontal: -Spacing.md, marginTop: -Spacing.md, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 5 },
  urgentText: { color: Colors.error, ...TypeScale.caption, fontWeight: '700' },
  taskCardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  taskIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  taskInfo: { flex: 1 },
  taskTitle: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary },
  taskLocation: { ...TypeScale.caption, marginTop: 4 },
  taskDesc: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 4 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceText: { ...TypeScale.title, fontWeight: '800', color: Colors.liferPrimary },
  tipTag: { backgroundColor: Colors.liferLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  taskMeta: { flexDirection: 'row', gap: 8 },
  urgencyTag: { ...TypeScale.caption, color: Colors.textMuted, fontWeight: '500' },
  distanceTag: { ...TypeScale.caption, color: Colors.info, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...TypeScale.titleMd, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { ...TypeScale.bodyLg, color: Colors.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
