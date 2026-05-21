import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getCategoryById } from '../../data/services';

export default function LiferEarningsScreen() {
  const insets = useSafeAreaInsets();
  const { getMyTasks } = useApp();
  const tasks = getMyTasks().filter(t => ['Paid', 'Receipt Issued'].includes(t.status));
  const totalEarned = tasks.reduce((sum, t) => sum + t.basePrice + t.serviceCharge + t.tip, 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#16A34A', '#14532D']} style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.heading}>Earnings</Text>
        <Text style={styles.totalLabel}>Total earned</Text>
        <Text style={styles.totalAmount}>ETB {totalEarned}</Text>
        <Text style={styles.totalCount}>{tasks.length} completed tasks</Text>
      </LinearGradient>
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cat = getCategoryById(item.categoryId);
          const amount = item.basePrice + item.serviceCharge + item.tip;
          const date = new Date(item.paidAt ?? item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: (cat?.color ?? Colors.liferPrimary) + '18' }]}>
                <Text style={{ fontSize: 20 }}>{cat?.icon ?? '📋'}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowDate}>{date}</Text>
              </View>
              <Text style={styles.rowAmount}>+ETB {amount}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyTitle}>No earnings yet</Text>
            <Text style={styles.emptySub}>Complete tasks to start earning</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  heading: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base },
  totalAmount: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: '800', marginTop: 4 },
  totalCount: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, marginTop: 4 },
  list: { padding: Spacing.md, gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  rowDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  rowAmount: { fontSize: FontSize.md, fontWeight: '800', color: Colors.liferPrimary },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: 6 },
});
