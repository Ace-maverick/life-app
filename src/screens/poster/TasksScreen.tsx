import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { getCategoryById } from '../../data/services';
import { Task, TaskStatus } from '../../data/types';

const FILTERS: Array<{ label: string; statuses: TaskStatus[] | null }> = [
  { label: 'All', statuses: null },
  { label: 'Active', statuses: ['Open', 'Assigned', 'In Progress'] },
  { label: 'Invoice', statuses: ['Invoice Sent'] },
  { label: 'Done', statuses: ['Receipt Issued', 'Paid'] },
  { label: 'Cancelled', statuses: ['Cancelled'] },
];

function TaskItem({ task, onPress }: { task: Task; onPress: () => void }) {
  const cat = getCategoryById(task.categoryId);
  const total = task.basePrice + task.serviceCharge + task.tip;
  const date = new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardRow}>
        <View style={[styles.icon, { backgroundColor: (cat?.color ?? '#1D4ED8') + '18' }]}>
          <Text style={{ fontSize: 20 }}>{cat?.icon ?? '📋'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.meta}>{date}  ·  📍 {task.location.area}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>ETB {total}</Text>
          <StatusBadge status={task.status} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PosterTasksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { getMyTasks } = useApp();
  const [filter, setFilter] = useState(0);
  const allTasks = getMyTasks();
  const currentFilter = FILTERS[filter];
  const tasks = currentFilter.statuses
    ? allTasks.filter(t => (currentFilter.statuses as TaskStatus[]).includes(t.status))
    : allTasks;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.heading}>My Tasks</Text>
        <Text style={styles.count}>{allTasks.length} total</Text>
      </View>
      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterBtn, filter === i && styles.filterBtnActive]}
            onPress={() => setFilter(i)}
          >
            <Text style={[styles.filterText, filter === i && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => {
              if (item.status === 'Invoice Sent') {
                navigation.navigate('HomeTab', { screen: 'Invoice', params: { taskId: item.id } });
              } else {
                navigation.navigate('HomeTab', { screen: 'PosterTaskDetail', params: { taskId: item.id } });
              }
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No tasks here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, paddingBottom: 0 },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  count: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.posterPrimary, borderColor: Colors.posterPrimary },
  filterText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  filterTextActive: { color: Colors.white },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  right: { alignItems: 'flex-end', gap: 5 },
  price: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.posterPrimary },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textMuted },
});
