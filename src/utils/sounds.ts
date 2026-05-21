/**
 * Sound + Haptic Feedback Utility
 *
 * Provides consistent audio/haptic feedback across the app.
 *
 * To add real sounds, place MP3 files in assets/sounds/ and uncomment the
 * SOUND_ASSETS block below. Until then, functions fall back to haptics only.
 *
 * Sound files needed:
 *   assets/sounds/match.mp3    — lifer accepted your task
 *   assets/sounds/payment.mp3  — payment confirmed
 *   assets/sounds/alert.mp3    — new notification / alert
 */

import * as Haptics from 'expo-haptics';

// ─── Optional sound playback ──────────────────────────────────────────────────
// Uncomment and install expo-av when you have real sound files:
//
// import { Audio } from 'expo-av';
// const SOUND_ASSETS = {
//   match:   require('../../assets/sounds/match.mp3'),
//   payment: require('../../assets/sounds/payment.mp3'),
//   alert:   require('../../assets/sounds/alert.mp3'),
// };
// async function playSound(key: keyof typeof SOUND_ASSETS) {
//   try {
//     await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
//     const { sound } = await Audio.Sound.createAsync(SOUND_ASSETS[key]);
//     await sound.playAsync();
//   } catch {}
// }

// ─── Public API ───────────────────────────────────────────────────────────────

/** Lifer accepted the task — celebration + heavy haptic */
export async function playMatchFeedback() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Payment confirmed — success haptic */
export async function playPaymentFeedback() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** New notification / alert */
export async function playAlertFeedback() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/** Generic light tap (button press) */
export function playTapFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Error / failure */
export function playErrorFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
