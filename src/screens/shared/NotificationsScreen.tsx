import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Notification } from '../../data/types';

const TYPE_CONFIG = {
  task:         { emoji: '📋', bg: Colors.infoLight, color: Colors.info },
  payment:      { emoji: '💳', bg: Colors.successLight, color: Colors.liferPrimary },
  verification: { emoji: '🔐', bg: Colors.warningLight, color: Colors.warning },
  dispute:      { emoji: '⚠️', bg: Colors.errorLight, color: Colors.error },
  system:       { emoji: '🔔', bg: Colors.gray100, color: Colors.gray600 },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifCard({ notif }: { notif: Notification }) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
  return (
    <View style={[styles.card, !notif.isRead && styles.cardUnread]}>
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
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { getMyNotifications, markAllRead } = useApp();
  const notifs = getMyNotifications();
  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
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
        renderItem={({ item }) => <NotifCard notif={item} />}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  unreadCount: { fontSize: FontSize.sm, color: Colors.posterPrimary, fontWeight: '600', marginTop: 2 },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.full, backgroundColor: Colors.gray100 },
  markAllText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.posterPrimary, backgroundColor: Colors.posterLight + '30' },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
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
});
