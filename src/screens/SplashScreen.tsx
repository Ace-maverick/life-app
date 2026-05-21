import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize } from '../theme';

export default function SplashScreen() {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0F172A', '#1D4ED8', '#0F172A']} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        {/* Life Logo Mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>L</Text>
        </View>
        <Text style={styles.logoText}>Life</Text>
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
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1D4ED8',  // explicit blue — avoid theme resolution issues on splash
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  logoLetter: {
    color: Colors.white,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  logoText: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 2.5,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: FontSize.sm,
    letterSpacing: 1,
  },
});
