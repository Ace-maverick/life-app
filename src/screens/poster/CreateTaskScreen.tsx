import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { CATEGORIES, ServiceCategory, Subcategory, JobType } from '../../data/services';
import { useApp } from '../../context/AppContext';
import { Urgency } from '../../data/types';

const STEPS = ['Category', 'Service', 'Location', 'Review'] as const;
type Step = typeof STEPS[number];

export default function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentUser, createTask } = useApp();

  const [step, setStep] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(
    route.params?.preselectedCategory
      ? CATEGORIES.find(c => c.id === route.params.preselectedCategory) ?? null
      : null
  );
  const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [urgency, setUrgency] = useState<Urgency>('Today');
  const [city, setCity] = useState('Addis Ababa');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');

  const totalPrice = selectedJob ? selectedJob.basePrice + selectedJob.serviceCharge : 0;

  function canGoNext(): boolean {
    if (step === 0) return !!selectedCategory;
    if (step === 1) return !!selectedSub && !!selectedJob;
    if (step === 2) return !!area.trim();
    return true;
  }

  function goNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handlePost();
  }

  function goBack() {
    if (step === 0) navigation.goBack();
    else setStep(s => s - 1);
  }

  function handlePost() {
    if (!currentUser || !selectedCategory || !selectedSub || !selectedJob) return;
    const task = createTask({
      posterId: currentUser.id,
      categoryId: selectedCategory.id,
      subcategoryId: selectedSub.id,
      jobTypeId: selectedJob.id,
      title: `${selectedSub.name} – ${selectedJob.name}`,
      description: description.trim() || undefined,
      location: { city, area, landmark },
      urgency,
      basePrice: selectedJob.basePrice,
      serviceCharge: selectedJob.serviceCharge,
    });
    navigation.replace('Searching', { taskId: task.id });
  }

  const stepLabel = STEPS[step];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Post a Task" subtitle={`Step ${step + 1} of ${STEPS.length}: ${stepLabel}`} onBack={goBack} />

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Step 0: Category */}
        {step === 0 && (
          <View>
            <Text style={styles.stepHeading}>What do you need help with?</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catCard,
                    selectedCategory?.id === cat.id && { borderColor: cat.color, borderWidth: 2, backgroundColor: cat.color + '0C' },
                  ]}
                  onPress={() => { setSelectedCategory(cat); setSelectedSub(null); setSelectedJob(null); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                    <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                  {selectedCategory?.id === cat.id && (
                    <View style={[styles.checkMark, { backgroundColor: cat.color }]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 1: Subcategory + Job */}
        {step === 1 && selectedCategory && (
          <View>
            <Text style={styles.stepHeading}>Choose the service</Text>

            <Text style={styles.fieldLabel}>Subcategory</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subRow}>
              {selectedCategory.subcategories.map(sub => (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.chip,
                    selectedSub?.id === sub.id && { backgroundColor: selectedCategory.color, borderColor: selectedCategory.color },
                  ]}
                  onPress={() => { setSelectedSub(sub); setSelectedJob(null); }}
                >
                  <Text style={[styles.chipText, selectedSub?.id === sub.id && { color: Colors.white }]}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedSub && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Specific job</Text>
                {selectedSub.jobs.map(job => (
                  <TouchableOpacity
                    key={job.id}
                    style={[
                      styles.jobRow,
                      selectedJob?.id === job.id && { borderColor: selectedCategory.color, borderWidth: 1.5, backgroundColor: selectedCategory.color + '07' },
                    ]}
                    onPress={() => setSelectedJob(job)}
                  >
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobName}>{job.name}</Text>
                      <Text style={styles.jobPrice}>ETB {job.basePrice + job.serviceCharge} total</Text>
                    </View>
                    <View style={[
                      styles.radioOuter,
                      selectedJob?.id === job.id && { borderColor: selectedCategory.color },
                    ]}>
                      {selectedJob?.id === job.id && <View style={[styles.radioInner, { backgroundColor: selectedCategory.color }]} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Urgency</Text>
            <View style={styles.urgencyRow}>
              {(['Today', 'Scheduled', 'Urgent'] as Urgency[]).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.urgencyBtn, urgency === u && { backgroundColor: Colors.posterPrimary, borderColor: Colors.posterPrimary }]}
                  onPress={() => setUrgency(u)}
                >
                  <Text style={[styles.urgencyText, urgency === u && { color: Colors.white }]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <View>
            <Text style={styles.stepHeading}>Where is the task?</Text>

            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Addis Ababa"
              placeholderTextColor={Colors.gray400}
            />

            <Text style={styles.fieldLabel}>Area / Sub-city *</Text>
            <TextInput
              style={styles.textInput}
              value={area}
              onChangeText={setArea}
              placeholder="e.g. Bole, Kazanchis, CMC"
              placeholderTextColor={Colors.gray400}
            />

            <Text style={styles.fieldLabel}>Landmark (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Near Bole Bridge, Building B"
              placeholderTextColor={Colors.gray400}
            />

            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Any extra details for the Lifer..."
              placeholderTextColor={Colors.gray400}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Step 3: Review */}
        {step === 3 && selectedCategory && selectedSub && selectedJob && (
          <View>
            <Text style={styles.stepHeading}>Review your task</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Service</Text>
                <Text style={styles.reviewValue}>{selectedSub.name} – {selectedJob.name}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Category</Text>
                <Text style={styles.reviewValue}>{selectedCategory.icon} {selectedCategory.name}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Location</Text>
                <Text style={styles.reviewValue}>{area}, {city}</Text>
              </View>
              {landmark ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Landmark</Text>
                  <Text style={styles.reviewValue}>{landmark}</Text>
                </View>
              ) : null}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Urgency</Text>
                <Text style={styles.reviewValue}>{urgency}</Text>
              </View>
              {description ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Note</Text>
                  <Text style={styles.reviewValue}>{description}</Text>
                </View>
              ) : null}
              <View style={[styles.reviewRow, styles.reviewTotal]}>
                <Text style={styles.reviewTotalLabel}>Total price</Text>
                <Text style={styles.reviewTotalValue}>ETB {totalPrice}</Text>
              </View>
              <View style={styles.reviewBreakdown}>
                <Text style={styles.breakdownText}>Service: ETB {selectedJob.basePrice}  +  Fee: ETB {selectedJob.serviceCharge}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          label={step === STEPS.length - 1 ? 'Post Task' : 'Continue'}
          onPress={goNext}
          disabled={!canGoNext()}
          fullWidth
          style={{ borderRadius: Radius.lg }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressTrack: { height: 3, backgroundColor: Colors.border },
  progressFill: { height: 3, backgroundColor: Colors.posterPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 16 },
  stepHeading: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
    position: 'relative',
  },
  catIcon: { width: 56, height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  catName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  checkMark: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.6 },
  subRow: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Shadow.sm,
  },
  jobInfo: { flex: 1 },
  jobName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  jobPrice: { fontSize: FontSize.sm, color: Colors.posterPrimary, fontWeight: '600', marginTop: 3 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  urgencyRow: { flexDirection: 'row', gap: Spacing.sm },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  urgencyText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  reviewLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  reviewValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' },
  reviewTotal: { borderBottomWidth: 0, paddingTop: 12, marginTop: 4 },
  reviewTotalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  reviewTotalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.posterPrimary },
  reviewBreakdown: { marginTop: 4 },
  breakdownText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
