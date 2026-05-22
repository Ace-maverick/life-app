import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, TypeScale, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { getCategoryById, getSubcategoryById, getJobById } from '../../data/services';

export default function LiferTaskPreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;
  const { getTaskById, getUserById, currentUser, acceptTask } = useApp();

  const task = getTaskById(taskId);
  if (!task) return null;

  const poster = getUserById(task.posterId);
  const cat = getCategoryById(task.categoryId);
  const sub = getSubcategoryById(task.categoryId, task.subcategoryId);
  const job = getJobById(task.categoryId, task.subcategoryId, task.jobTypeId);
  const total = task.basePrice + task.serviceCharge + task.tip;

  function handleAccept() {
    if (currentUser?.verificationStatus !== 'approved') {
      Alert.alert('Verification required', 'You need to complete verification before accepting tasks.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify now', onPress: () => navigation.navigate('Verification') },
      ]);
      return;
    }
    Alert.alert('Accept this task?', `You'll earn ETB ${total} for completing "${task!.title}".`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept Task',
        onPress: () => {
          acceptTask(taskId);
          navigation.replace('ActiveJob', { taskId });
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Task Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Category badge */}
        <View style={[styles.catBadge, { backgroundColor: (cat?.color ?? Colors.liferPrimary) + '15' }]}>
          <Text style={{ fontSize: 28 }}>{cat?.icon ?? '📋'}</Text>
          <View>
            <Text style={[styles.catName, { color: cat?.color ?? Colors.liferPrimary }]}>{cat?.name}</Text>
            <Text style={styles.subName}>{sub?.name}</Text>
          </View>
          {task.urgency === 'Urgent' && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>🔴 Urgent</Text>
            </View>
          )}
        </View>

        {/* Job title */}
        <Text style={styles.jobTitle}>{task.title}</Text>
        {task.description && <Text style={styles.jobDesc}>{task.description}</Text>}

        {/* Earnings */}
        <LinearGradient colors={['#16A34A', '#15803D']} style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Your earnings</Text>
          <Text style={styles.earningsAmount}>ETB {total}</Text>
          <View style={styles.earningsBreakdown}>
            <Text style={styles.earningsDetail}>Service: ETB {task.basePrice}</Text>
            {task.tip > 0 && <Text style={[styles.earningsDetail, { color: '#86EFAC' }]}>+ETB {task.tip} tip</Text>}
          </View>
        </LinearGradient>

        {/* Details */}
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Location</Text>
            <Text style={styles.detailValue}>{task.location.area}, {task.location.city}</Text>
          </View>
          {task.location.landmark ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🏢 Landmark</Text>
              <Text style={styles.detailValue}>{task.location.landmark}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏰ Urgency</Text>
            <Text style={styles.detailValue}>{task.urgency}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📏 Distance</Text>
            <Text style={[styles.detailValue, { color: Colors.info }]}>~0.4 km away</Text>
          </View>
        </View>

        {/* Poster info (limited) */}
        {poster && (
          <View style={styles.posterCard}>
            <Text style={styles.sectionLabel}>Posted by</Text>
            <View style={styles.posterRow}>
              <Avatar name={poster.name} size={40} />
              <View>
                <Text style={styles.posterName}>{poster.name.split(' ')[0]} {poster.name.split(' ')[1]?.[0]}.</Text>
                <Text style={styles.posterRating}>⭐ {poster.rating.toFixed(1)} · {poster.ratingCount} tasks</Text>
              </View>
            </View>
          </View>
        )}

        {/* Safety note */}
        <View style={styles.safetyNote}>
          <Text style={styles.safetyText}>
            💡 You'll receive the poster's contact details after accepting. Communicate via your carrier line.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          label={`Accept – Earn ETB ${total}`}
          onPress={handleAccept}
          color={Colors.liferPrimary}
          fullWidth
          style={{ borderRadius: Radius.lg }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 16 },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  catName: { ...TypeScale.bodyLg, fontWeight: '700' },
  subName: { ...TypeScale.caption, color: Colors.textMuted, marginTop: 2 },
  urgentBadge: { marginLeft: 'auto', backgroundColor: Colors.errorLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  urgentText: { ...TypeScale.caption, fontWeight: '700', color: Colors.error },
  jobTitle: { ...TypeScale.headline, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  jobDesc: { ...TypeScale.bodyLg, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 22 },
  earningsCard: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  earningsLabel: { color: 'rgba(255,255,255,0.7)', ...TypeScale.body, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  earningsAmount: { color: Colors.white, ...TypeScale.display, fontWeight: '800', marginTop: 4 },
  earningsBreakdown: { flexDirection: 'row', gap: 12, marginTop: 6 },
  earningsDetail: { color: 'rgba(255,255,255,0.75)', ...TypeScale.body },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailLabel: { ...TypeScale.bodyLg, color: Colors.textMuted, fontWeight: '500' },
  detailValue: { ...TypeScale.bodyLg, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  posterCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  sectionLabel: { ...TypeScale.caption, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  posterName: { ...TypeScale.bodyLg, fontWeight: '700', color: Colors.textPrimary },
  posterRating: { ...TypeScale.body, color: Colors.textMuted, marginTop: 3 },
  safetyNote: { backgroundColor: Colors.infoLight, borderRadius: Radius.lg, padding: Spacing.md },
  safetyText: { ...TypeScale.body, color: Colors.info, lineHeight: 20 },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
