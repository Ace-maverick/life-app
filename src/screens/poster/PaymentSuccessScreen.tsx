import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { useApp } from '../../context/AppContext';

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;
  const { getTaskById, getUserById, rateTask } = useApp();

  const task = getTaskById(taskId);
  const lifer = task?.liferId ? getUserById(task.liferId) : null;
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const scaleAnim = new Animated.Value(0.5);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleRate(stars: number) {
    setRating(stars);
    if (!rated) {
      rateTask(taskId, stars, 'poster');
      setRated(true);
    }
  }

  function handleDone() {
    navigation.navigate('HomeTab', { screen: 'PosterHome' });
  }

  if (!task) return null;
  const total = task.basePrice + task.serviceCharge + task.tip;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success animation */}
        <LinearGradient colors={['#16A34A', '#22C55E']} style={styles.successBanner}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkEmoji}>✓</Text>
            </View>
          </Animated.View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>Your task has been completed</Text>
        </LinearGradient>

        {/* Receipt */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptLabel}>RECEIPT</Text>
            <Text style={styles.receiptId}>{task.receiptId ?? 'RCP-DONE'}</Text>
          </View>
          <Text style={styles.receiptTitle}>{task.title}</Text>

          <View style={styles.receiptRows}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Amount paid</Text>
              <Text style={styles.receiptRowValue}>ETB {total}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Payment method</Text>
              <Text style={styles.receiptRowValue}>
                {task.paymentMethod === 'telebirr' ? 'Telebirr' : task.paymentMethod === 'cbe_birr' ? 'CBE Birr' : 'Bank'}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>Date</Text>
              <Text style={styles.receiptRowValue}>
                {task.paidAt ? new Date(task.paidAt).toLocaleDateString() : '-'}
              </Text>
            </View>
            {lifer && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptRowLabel}>Lifer</Text>
                <Text style={styles.receiptRowValue}>{lifer.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Rating */}
        {lifer && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Rate your Lifer</Text>
            <View style={styles.liferRow}>
              <Avatar name={lifer.name} size={48} color={Colors.liferPrimary} />
              <View>
                <Text style={styles.liferName}>{lifer.name}</Text>
                <Text style={styles.liferSubtext}>How was their service?</Text>
              </View>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => handleRate(star)} activeOpacity={0.7}>
                  <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            {rated && <Text style={styles.thankYou}>Thanks for your rating! 🎉</Text>}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button label="Back to Home" onPress={handleDone} fullWidth color={Colors.liferPrimary} style={{ borderRadius: Radius.lg }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 16 },
  successBanner: { alignItems: 'center', padding: Spacing.xxl, paddingTop: Spacing.xl },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  checkEmoji: { color: Colors.white, fontSize: 40, fontWeight: '800' },
  successTitle: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 6 },
  successSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.base },
  receiptCard: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  receiptLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 2, color: Colors.liferPrimary },
  receiptId: { fontSize: FontSize.xs, color: Colors.textMuted },
  receiptTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  receiptRows: {},
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  receiptRowLabel: { color: Colors.textSecondary, fontSize: FontSize.base },
  receiptRowValue: { fontWeight: '600', color: Colors.textPrimary, fontSize: FontSize.base },
  ratingCard: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    marginTop: 0,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  ratingTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  liferRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md },
  liferName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  liferSubtext: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 3 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 40, color: Colors.gray300 },
  starActive: { color: '#F59E0B' },
  thankYou: { fontSize: FontSize.base, color: Colors.liferPrimary, fontWeight: '600', marginTop: Spacing.md },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
