import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, updateProfile, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [city, setCity] = useState(currentUser?.city ?? '');
  const [area, setArea] = useState(currentUser?.area ?? '');

  const isLifer = currentUser?.role === 'lifer';
  const isPoster = currentUser?.role === 'poster';
  const accentColor = isLifer ? Colors.liferPrimary : Colors.posterPrimary;
  const gradientColors: [string, string] = isLifer
    ? ['#16A34A', '#14532D']
    : currentUser?.role === 'admin'
      ? ['#334155', '#64748B']
      : ['#1D4ED8', '#1E3A8A'];

  function handleSave() {
    updateProfile({ name, city, area });
    setEditing(false);
    Alert.alert('Saved!', 'Your profile has been updated.');
  }

  function handleLogout() {
    Alert.alert('Log out?', 'You will be returned to the role selection screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  }

  if (!currentUser) return null;

  const roleBadge: Record<string, string> = {
    poster: '📋 Poster',
    lifer: '💼 Lifer',
    admin: '⚙️ Admin',
    callcenter: '🎧 Support',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradientColors} style={styles.header}>
          <Avatar name={currentUser.name} size={80} color="rgba(255,255,255,0.3)" />
          <Text style={styles.name}>{currentUser.name}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{roleBadge[currentUser.role] ?? currentUser.role}</Text>
          </View>
          {currentUser.rating > 0 && (
            <Text style={styles.rating}>⭐ {currentUser.rating.toFixed(1)} · {currentUser.ratingCount} reviews</Text>
          )}
        </LinearGradient>

        <View style={styles.body}>
          {/* Lifer verification status */}
          {isLifer && (
            <View style={[
              styles.verifyCard,
              { borderColor: currentUser.verificationStatus === 'approved' ? Colors.liferPrimary + '40' : Colors.warning + '40' },
            ]}>
              <Text style={styles.verifyText}>
                {currentUser.verificationStatus === 'approved' ? '✅ Verified Lifer' :
                 currentUser.verificationStatus === 'submitted' ? '⏳ Verification pending' :
                 '🔐 Complete verification to start working'}
              </Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              {!editing && (
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Text style={[styles.editBtn, { color: accentColor }]}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {editing ? (
              <View style={styles.editForm}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Addis Ababa" placeholderTextColor={Colors.gray400} />
                <Text style={styles.fieldLabel}>Area</Text>
                <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="Bole, Piazza..." placeholderTextColor={Colors.gray400} />
                <View style={styles.editActions}>
                  <Button label="Cancel" onPress={() => setEditing(false)} variant="outline" style={{ flex: 1 }} />
                  <Button label="Save" onPress={handleSave} color={accentColor} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <InfoRow label="Phone" value={currentUser.phone} />
                <InfoRow label="Name" value={currentUser.name} />
                <InfoRow label="Role" value={currentUser.role} />
                {currentUser.city && <InfoRow label="City" value={currentUser.city} />}
                {currentUser.area && <InfoRow label="Area" value={currentUser.area} />}
                {isPoster && <InfoRow label="Discount points" value={`${currentUser.discountPoints ?? 0} pts`} />}
                {isLifer && currentUser.serviceArea && <InfoRow label="Service area" value={currentUser.serviceArea} />}
                {isLifer && currentUser.radius && <InfoRow label="Radius" value={`${currentUser.radius} km`} />}
              </View>
            )}
          </View>

          {/* Work categories for lifer */}
          {isLifer && currentUser.workTypes && currentUser.workTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work categories</Text>
              <View style={styles.tagsRow}>
                {currentUser.workTypes.map(wt => (
                  <View key={wt} style={styles.tag}>
                    <Text style={[styles.tagText, { color: accentColor }]}>{wt.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Logout */}
          <Button
            label="Log out"
            onPress={handleLogout}
            variant="outline"
            color={Colors.error}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.xxl, gap: 8 },
  name: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800' },
  rolePill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.full },
  roleText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  rating: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm },
  body: { padding: Spacing.md, marginTop: -20 },
  verifyCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, marginBottom: Spacing.md, ...Shadow.sm },
  verifyText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  section: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  editBtn: { fontSize: FontSize.base, fontWeight: '600' },
  infoCard: {},
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoLabel: { fontSize: FontSize.base, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  editForm: {},
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.gray50, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary, marginBottom: Spacing.md },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { backgroundColor: Colors.liferLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  tagText: { fontSize: FontSize.sm, fontWeight: '600', textTransform: 'capitalize' },
});
