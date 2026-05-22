import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, TypeScale } from '../theme';
import { TaskStatus } from '../data/types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  'Open':            { label: 'Open',             bg: Colors.infoLight,    text: Colors.info },
  'Assigned':        { label: 'Assigned',          bg: Colors.warningLight, text: Colors.warning },
  'In Progress':     { label: 'In Progress',       bg: '#FEF3C7',           text: '#92400E' },
  'Completed':       { label: 'Completed',         bg: Colors.successLight, text: Colors.liferPrimary },
  'Invoice Sent':    { label: 'Invoice Ready',     bg: '#EDE9FE',           text: '#6D28D9' },
  'Paid':            { label: 'Paid',              bg: Colors.successLight, text: Colors.success },
  'Receipt Issued':  { label: 'Paid ✓',           bg: Colors.successLight, text: Colors.liferDark },
  'Dispute Open':    { label: 'Dispute',           bg: Colors.errorLight,   text: Colors.error },
  'Dispute Resolved':{ label: 'Resolved',          bg: Colors.gray100,      text: Colors.gray600 },
  'Cancelled':       { label: 'Cancelled',         bg: Colors.gray100,      text: Colors.gray500 },
};

interface Props {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: Colors.gray100, text: Colors.gray500 };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, { color: cfg.text }, size === 'sm' && styles.smText]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  text: { ...TypeScale.body, fontWeight: '600' },
  smText: { ...TypeScale.caption },
});
