import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import { Dispute } from '../../data/types';

const OUTCOMES: Dispute['outcome'][] = [
  'Poster claim accepted',
  'Lifer claim accepted',
  'Settled',
  'No action',
];

export default function AdminDisputesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { disputes, getTaskById, resolveDispute } = useApp();

  function handleResolve(dispute: Dispute) {
    Alert.alert('Resolve dispute', 'Choose an outcome:', OUTCOMES.map(o => ({
      text: o!,
      onPress: () => resolveDispute(dispute.id, o, 'Resolved by admin.'),
    })));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Disputes"
        subtitle={`${disputes.filter(d => d.status === 'Open').length} open`}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={disputes}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const task = getTaskById(item.taskId);
          const isOpen = ['Open', 'Under Review'].includes(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.disputeId}>#{item.id.slice(-6).toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: isOpen ? Colors.errorLight : Colors.gray100 }]}>
                  <Text style={[styles.badgeText, { color: isOpen ? Colors.error : Colors.gray500 }]}>{item.status}</Text>
                </View>
              </View>
              {task && <Text style={styles.taskTitle}>{task.title}</Text>}
              <Text style={styles.summary}>{item.summary}</Text>
              <Text style={styles.meta}>Raised by: {item.raisedByRole}  ·  {new Date(item.createdAt).toLocaleDateString()}</Text>
              {item.outcome && (
                <View style={styles.outcomeRow}>
                  <Text style={styles.outcomeLabel}>Outcome:</Text>
                  <Text style={styles.outcomeValue}>{item.outcome}</Text>
                </View>
              )}
              {isOpen && (
                <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item)}>
                  <Text style={styles.resolveText}>Resolve dispute →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⚖️</Text>
            <Text style={styles.emptyTitle}>No disputes</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  disputeId: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, fontFamily: 'monospace' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  taskTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  summary: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  outcomeRow: { flexDirection: 'row', gap: 6, marginTop: Spacing.sm, backgroundColor: Colors.gray50, borderRadius: Radius.md, padding: 8 },
  outcomeLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  outcomeValue: { fontSize: FontSize.sm, color: Colors.liferPrimary, fontWeight: '700' },
  resolveBtn: { marginTop: Spacing.md, padding: 10, backgroundColor: Colors.gray800, borderRadius: Radius.lg, alignItems: 'center' },
  resolveText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textMuted },
});
