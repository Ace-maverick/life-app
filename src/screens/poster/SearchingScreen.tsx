import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Modal, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { useApp } from '../../context/AppContext';
import { getCategoryById } from '../../data/services';
import { playMatchFeedback } from '../../utils/sounds';

const TIP_OPTIONS = [50, 100, 150, 200];

// Mock nearby Lifers for map visualization
const NEARBY_LIFERS = [
  { id: '1', name: 'Dawit B.', rating: 4.9, distance: '0.3 km', angle: 45 },
  { id: '2', name: 'Yonas T.', rating: 4.7, distance: '0.5 km', angle: 140 },
  { id: '3', name: 'Aisha M.', rating: 4.8, distance: '0.8 km', angle: 230 },
];

export default function SearchingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;
  const { getTaskById, cancelTask, addTip, acceptTask, getUserById } = useApp();

  const task = getTaskById(taskId);
  const cat = task ? getCategoryById(task.categoryId) : null;

  const [elapsed, setElapsed] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [tipAdded, setTipAdded] = useState(false);
  const [autoAccepted, setAutoAccepted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for searching indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(ringAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
    ).start();
  }, []);

  // Timer & auto-accept demo
  useEffect(() => {
    if (!task || task.status !== 'Open') return;
    const interval = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next === 8 && !tipAdded) setShowTip(true);
        if (next === 15 && !autoAccepted) {
          setAutoAccepted(true);
          // Demo: auto-accept with first lifer
          acceptTask(taskId);
          playMatchFeedback();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [task?.status, tipAdded, autoAccepted]);

  const updatedTask = getTaskById(taskId);
  const isAssigned = updatedTask?.status === 'Assigned' || updatedTask?.status === 'In Progress';
  const assignedLifer = updatedTask?.liferId ? getUserById(updatedTask.liferId) : null;

  function handleTip(amount: number) {
    addTip(taskId, amount);
    setShowTip(false);
    setTipAdded(true);
  }

  function handleCancel() {
    Alert.alert('Cancel task?', 'Your task will be removed from search.', [
      { text: 'Keep searching', style: 'cancel' },
      {
        text: 'Cancel task',
        style: 'destructive',
        onPress: () => {
          cancelTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  }

  function goToTaskDetail() {
    navigation.replace('PosterTaskDetail', { taskId });
  }

  if (!task) return null;

  const total = task.basePrice + task.serviceCharge + task.tip;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#1D4ED8', '#1E3A8A']} style={styles.topBar}>
        <Text style={styles.topBarTitle}>{task.title}</Text>
        <Text style={styles.topBarSub}>ETB {total}  ·  {task.location.area}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map-style visualization */}
        <View style={styles.mapArea}>
          <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.mapBg}>
            {/* Ripple rings */}
            {!isAssigned && [0, 1, 2].map(i => (
              <Animated.View
                key={i}
                style={[
                  styles.ring,
                  {
                    width: 100 + i * 60,
                    height: 100 + i * 60,
                    borderRadius: 50 + i * 30,
                    opacity: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5 - i * 0.15, 0],
                    }),
                    transform: [{
                      scale: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2 + i * 0.2] }),
                    }],
                  },
                ]}
              />
            ))}

            {/* Center pin */}
            <Animated.View style={[styles.centerPin, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={isAssigned ? [Colors.liferPrimary, Colors.liferAccent] : ['#1D4ED8', '#3B82F6']} style={styles.centerPinInner}>
                <Text style={styles.centerPinEmoji}>{isAssigned ? '✓' : cat?.icon ?? '📍'}</Text>
              </LinearGradient>
            </Animated.View>

            {/* Nearby lifer dots */}
            {!isAssigned && NEARBY_LIFERS.map((lifer, i) => {
              const angle = (lifer.angle * Math.PI) / 180;
              const r = 90 + i * 20;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <View
                  key={lifer.id}
                  style={[styles.liferDot, {
                    transform: [{ translateX: x }, { translateY: y }],
                    backgroundColor: Colors.liferPrimary,
                  }]}
                >
                  <Text style={styles.liferDotText}>L</Text>
                </View>
              );
            })}
          </LinearGradient>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          {isAssigned && assignedLifer ? (
            <View style={styles.acceptedState}>
              <View style={styles.acceptedHeader}>
                <Text style={styles.acceptedTitle}>🎉 Lifer on the way!</Text>
                <Text style={styles.acceptedSub}>Your task has been accepted</Text>
              </View>
              <View style={styles.liferProfile}>
                <Avatar name={assignedLifer.name} size={56} />
                <View style={styles.liferDetails}>
                  <Text style={styles.liferName}>{assignedLifer.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.starText}>⭐ {assignedLifer.rating.toFixed(1)}</Text>
                    <Text style={styles.ratingCount}>({assignedLifer.ratingCount} reviews)</Text>
                  </View>
                  <Text style={styles.verifiedBadge}>✓ Verified Lifer</Text>
                </View>
                <TouchableOpacity style={styles.callBtn}>
                  <Text style={styles.callEmoji}>📞</Text>
                </TouchableOpacity>
              </View>
              <Button label="View Task Details" onPress={goToTaskDetail} fullWidth style={{ marginTop: Spacing.md }} />
            </View>
          ) : (
            <View style={styles.searchingState}>
              <Text style={styles.searchTitle}>Searching for Lifers…</Text>
              <Text style={styles.searchSub}>Looking for available Lifers in {task.location.area}</Text>
              <View style={styles.timerRow}>
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>{elapsed}s</Text>
                </View>
                <Text style={styles.timerLabel}>
                  {task.tip > 0 ? `+ETB ${task.tip} tip added` : '3 Lifers nearby'}
                </Text>
              </View>
              <Button label="Cancel Task" onPress={handleCancel} variant="ghost" fullWidth style={{ marginTop: Spacing.md }} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Tip modal */}
      <Modal visible={showTip} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>No one accepted yet…</Text>
            <Text style={styles.modalSub}>Add a tip to get noticed faster!</Text>
            <View style={styles.tipGrid}>
              {TIP_OPTIONS.map(tip => (
                <TouchableOpacity key={tip} style={styles.tipBtn} onPress={() => handleTip(tip)} activeOpacity={0.8}>
                  <Text style={styles.tipAmount}>+ETB {tip}</Text>
                  <Text style={styles.tipLabel}>tip</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowTip(false)} style={styles.skipTip}>
              <Text style={styles.skipTipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  topBarTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  topBarSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginTop: 3 },
  content: { padding: Spacing.md },
  mapArea: { borderRadius: Radius.xl, overflow: 'hidden', height: 260, marginBottom: Spacing.md },
  mapBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.posterPrimary,
  },
  centerPin: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...Shadow.lg,
  },
  centerPinInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  centerPinEmoji: { fontSize: 28 },
  liferDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  liferDotText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  searchingState: { alignItems: 'center' },
  searchTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  searchSub: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerBadge: { backgroundColor: Colors.posterLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  timerText: { color: Colors.posterPrimary, fontWeight: '700', fontSize: FontSize.sm },
  timerLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  acceptedState: {},
  acceptedHeader: { marginBottom: Spacing.md },
  acceptedTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  acceptedSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  liferProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.gray50, borderRadius: Radius.lg, padding: Spacing.md },
  liferDetails: { flex: 1 },
  liferName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  starText: { fontSize: FontSize.sm, fontWeight: '600' },
  ratingCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  verifiedBadge: { fontSize: FontSize.xs, color: Colors.liferPrimary, fontWeight: '600', marginTop: 4 },
  callBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.liferLight, alignItems: 'center', justifyContent: 'center' },
  callEmoji: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  modalSub: { color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  tipGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  tipBtn: {
    flex: 1,
    backgroundColor: Colors.posterLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.posterPrimary + '40',
  },
  tipAmount: { fontSize: FontSize.md, fontWeight: '800', color: Colors.posterPrimary },
  tipLabel: { fontSize: FontSize.xs, color: Colors.posterPrimary, marginTop: 2 },
  skipTip: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipTipText: { color: Colors.textMuted, fontSize: FontSize.base },
});
