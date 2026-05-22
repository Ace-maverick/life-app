import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TypeScale } from '../theme';
import LifeLogo from '../components/LifeLogo';

export default function SplashScreen() {
  const opacity = new Animated.Value(0);
  const scale   = new Animated.Value(0.88);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1D4ED8', '#0F172A']}
      style={styles.container}
    >
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        {/* Official Life wordmark — white variant for dark background */}
        <LifeLogo variant="blue" width={240} />

        <Text style={styles.tagline}>YOUR LIFE, HANDLED.</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading…</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 14,
  },
  tagline: {
    color: 'rgba(255,255,255,0.55)',
    ...TypeScale.body,
    fontWeight: '600',
    letterSpacing: 2.5,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    color: 'rgba(255,255,255,0.35)',
    ...TypeScale.body,
    letterSpacing: 1,
  },
});
