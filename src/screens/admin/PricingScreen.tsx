import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import ScreenHeader from '../../components/ScreenHeader';
import { CATEGORIES } from '../../data/services';

export default function AdminPricingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Pricing Catalog" subtitle="Tap category to expand" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map(cat => (
          <View key={cat.id} style={styles.catSection}>
            <TouchableOpacity
              style={[styles.catHeader, { borderLeftColor: cat.color, borderLeftWidth: 4 }]}
              onPress={() => setExpandedCat(prev => prev === cat.id ? null : cat.id)}
            >
              <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={[styles.catCount, { color: cat.color }]}>
                {cat.subcategories.reduce((n, s) => n + s.jobs.length, 0)} services
              </Text>
              <Text style={styles.expandArrow}>{expandedCat === cat.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expandedCat === cat.id && cat.subcategories.map(sub => (
              <View key={sub.id} style={styles.subSection}>
                <Text style={styles.subName}>{sub.name}</Text>
                {sub.jobs.map(job => (
                  <View key={job.id} style={styles.jobRow}>
                    <Text style={styles.jobName} numberOfLines={1}>{job.name}</Text>
                    <View style={styles.priceCol}>
                      <Text style={styles.basePrice}>ETB {job.basePrice}</Text>
                      <Text style={styles.feePrice}>+{job.serviceCharge} fee</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },
  catSection: { backgroundColor: Colors.white, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md, backgroundColor: Colors.white },
  catName: { flex: 1, fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  catCount: { fontSize: FontSize.xs, fontWeight: '600' },
  expandArrow: { fontSize: FontSize.sm, color: Colors.textMuted },
  subSection: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  subName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginTop: Spacing.sm, marginBottom: 4 },
  jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  jobName: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  priceCol: { alignItems: 'flex-end' },
  basePrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.posterPrimary },
  feePrice: { fontSize: FontSize.xs, color: Colors.textMuted },
});
