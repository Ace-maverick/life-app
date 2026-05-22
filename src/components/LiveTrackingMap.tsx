/**
 * LiveTrackingMap
 *
 * Shows an Addis Ababa map with:
 *  - A blue destination pin (task location)
 *  - A green lifer pin that animates toward the destination when status === 'Assigned'
 *  - A static "on-site" pin when status === 'In Progress'
 *
 * react-native-maps requires a development build (not Expo Go).
 * When the native module is unavailable the component falls back to a
 * rich tracking card that shows the same live-ETA info without a map tile.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Radius, Spacing, TypeScale, Shadow } from '../theme';

// ─── Detect whether the native maps module is available ───────────────────────
// react-native-maps needs a dev/production build; Expo Go won't have it.

let MapView: any = null;
let Marker: any  = null;
let Polyline: any = null;
let PROVIDER_DEFAULT: any = null;
let mapsAvailable = false;

try {
  const maps = require('react-native-maps');
  MapView          = maps.default ?? maps.MapView;
  Marker           = maps.Marker;
  Polyline         = maps.Polyline;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
  // Confirm the native module actually loaded (not just the JS shim)
  const { NativeModules } = require('react-native');
  mapsAvailable = !!(
    NativeModules.RNMapsGoogleMap ||
    NativeModules.RNMapsAirMap   ||
    NativeModules.AirMapModule
  );
} catch {
  mapsAvailable = false;
}

// ─── Addis Ababa area coordinates ────────────────────────────────────────────

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  Bole:          { lat: 9.0054, lng: 38.7636 },
  Piazza:        { lat: 9.0304, lng: 38.7468 },
  Kazanchis:     { lat: 9.0200, lng: 38.7614 },
  CMC:           { lat: 9.0417, lng: 38.8146 },
  Sarbet:        { lat: 9.0041, lng: 38.7382 },
  Megenagna:     { lat: 9.0259, lng: 38.8007 },
  Lebu:          { lat: 8.9776, lng: 38.7134 },
  Kolfe:         { lat: 9.0052, lng: 38.7145 },
  Gerji:         { lat: 9.0159, lng: 38.8044 },
  Ayat:          { lat: 9.0545, lng: 38.8432 },
  Summit:        { lat: 9.0328, lng: 38.8297 },
  Lideta:        { lat: 9.0149, lng: 38.7351 },
  'Addis Ababa': { lat: 9.0227, lng: 38.7468 },
};

const DEFAULT_COORD = { lat: 9.0227, lng: 38.7468 };

function getCoord(area?: string) {
  if (!area) return DEFAULT_COORD;
  if (AREA_COORDS[area]) return AREA_COORDS[area];
  const key = Object.keys(AREA_COORDS).find(k =>
    area.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(area.toLowerCase())
  );
  return key ? AREA_COORDS[key] : DEFAULT_COORD;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  taskArea: string;
  liferArea?: string;
  taskStatus: string;
  style?: object;
}

// ─── Fallback card (shown when native maps module unavailable) ────────────────

function TrackingFallback({ taskArea, liferArea, taskStatus, style }: Props) {
  const isAssigned   = taskStatus === 'Assigned';
  const isInProgress = taskStatus === 'In Progress';

  const [progress, setProgress] = useState(isInProgress ? 1 : 0.05);
  const progressRef = useRef(isInProgress ? 1 : 0.05);

  useEffect(() => {
    if (!isAssigned) return;
    const interval = setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + 0.05);
      setProgress(progressRef.current);
      if (progressRef.current >= 1) clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAssigned]);

  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isAssigned && !isInProgress) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isAssigned, isInProgress]);

  const etaSteps = Math.max(0, Math.round((1 - progress) * 20));
  const etaText  = isInProgress ? 'On site' : etaSteps > 0 ? `~${etaSteps * 3} min away` : 'Arrived';

  // Simple road-style progress strip
  const barWidth = Math.round(progress * 100);

  return (
    <View style={[styles.fallbackCard, style]}>
      {/* Header row */}
      <View style={styles.fallbackHeader}>
        <Animated.View style={[styles.liveDot, { opacity: blink }]} />
        <Text style={styles.fallbackLiveText}>
          {isInProgress ? '✅ Lifer is on-site' : `🏃 En route · ${etaText}`}
        </Text>
      </View>

      {/* Route strip */}
      <View style={styles.routeRow}>
        <View style={styles.routePin}>
          <Text style={styles.routePinText}>📍</Text>
          <Text style={styles.routePinLabel} numberOfLines={1}>{liferArea ?? 'Start'}</Text>
        </View>

        <View style={styles.routeBar}>
          <View style={[styles.routeFill, { width: `${barWidth}%` as any }]} />
          {/* Animated lifer dot on the bar */}
          <View style={[styles.liferDot, { left: `${Math.min(barWidth, 95)}%` as any }]}>
            <Text style={{ fontSize: 14 }}>🧑‍🔧</Text>
          </View>
        </View>

        <View style={styles.routePin}>
          <Text style={styles.routePinText}>🎯</Text>
          <Text style={styles.routePinLabel} numberOfLines={1}>{taskArea}</Text>
        </View>
      </View>

      <Text style={styles.fallbackSub}>
        Map visible in the production build
      </Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LiveTrackingMap({ taskArea, liferArea, taskStatus, style }: Props) {
  // Always render fallback if native module not loaded
  if (!mapsAvailable || !MapView) {
    return (
      <TrackingFallback
        taskArea={taskArea}
        liferArea={liferArea}
        taskStatus={taskStatus}
        style={style}
      />
    );
  }

  return <NativeMapView taskArea={taskArea} liferArea={liferArea} taskStatus={taskStatus} style={style} />;
}

// ─── Native map view (only rendered when maps available) ─────────────────────

function NativeMapView({ taskArea, liferArea, taskStatus, style }: Props) {
  const dest   = getCoord(taskArea);
  const origin = getCoord(liferArea);

  const startCoord = liferArea && liferArea !== taskArea ? origin : {
    lat: origin.lat + 0.012,
    lng: origin.lng - 0.009,
  };

  const isAssigned   = taskStatus === 'Assigned';
  const isInProgress = taskStatus === 'In Progress';

  const [progress, setProgress] = useState(isInProgress ? 1 : 0.05);
  const progressRef = useRef(isInProgress ? 1 : 0.05);

  useEffect(() => {
    if (!isAssigned) return;
    const interval = setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + 0.05);
      setProgress(progressRef.current);
      if (progressRef.current >= 1) clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAssigned]);

  const liferLat = lerp(startCoord.lat, dest.lat, progress);
  const liferLng = lerp(startCoord.lng, dest.lng, progress);

  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isAssigned && !isInProgress) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isAssigned, isInProgress]);

  const midLat   = (dest.lat + liferLat) / 2;
  const midLng   = (dest.lng + liferLng) / 2;
  const latDelta = Math.max(Math.abs(dest.lat - liferLat) * 2.5, 0.025);
  const lngDelta = Math.max(Math.abs(dest.lng - liferLng) * 2.5, 0.025);

  const etaSteps = Math.max(0, Math.round((1 - progress) * 20));
  const etaMin   = etaSteps > 0 ? `~${etaSteps * 3} min away` : 'Arrived';

  return (
    <View style={[styles.mapWrapper, style]}>
      <View style={styles.liveBadge}>
        <Animated.View style={[styles.liveDot, { opacity: blink }]} />
        <Text style={styles.liveText}>
          {isInProgress ? 'On site' : `Live · ${etaMin}`}
        </Text>
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        liteMode
      >
        <Marker
          coordinate={{ latitude: dest.lat, longitude: dest.lng }}
          title="Task location"
          anchor={{ x: 0.5, y: 1 }}
        >
          <View><Text style={{ fontSize: 18 }}>📍</Text></View>
        </Marker>

        <Polyline
          coordinates={[
            { latitude: startCoord.lat, longitude: startCoord.lng },
            { latitude: liferLat,       longitude: liferLng },
            { latitude: dest.lat,       longitude: dest.lng },
          ]}
          strokeColor={Colors.liferPrimary + '60'}
          strokeWidth={2}
          lineDashPattern={[6, 4]}
        />
        <Marker
          coordinate={{ latitude: liferLat, longitude: liferLng }}
          title="Lifer location"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[styles.liferPin, isInProgress && styles.liferPinOnSite]}>
            <Text style={{ fontSize: 14 }}>🧑‍🔧</Text>
          </View>
        </Marker>
      </MapView>

      <View style={styles.mapFooter}>
        <Text style={styles.mapFooterText}>
          {isInProgress
            ? '✅ Lifer is on-site working'
            : `🏃 Lifer en route to ${taskArea}`}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Native map
  mapWrapper: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  map: { flex: 1 },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveText: {
    color: '#fff',
    ...TypeScale.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liferPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.liferPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
    elevation: 4,
  },
  liferPinOnSite: { backgroundColor: Colors.posterPrimary },
  mapFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  mapFooterText: { color: '#fff', ...TypeScale.caption, fontWeight: '600' },

  // Fallback card
  fallbackCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.liferPrimary + '30',
    ...Shadow.sm,
  },
  fallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  fallbackLiveText: {
    ...TypeScale.bodyLg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  routePin: { alignItems: 'center', width: 52 },
  routePinText: { fontSize: 18 },
  routePinLabel: { ...TypeScale.caption, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  routeBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  routeFill: {
    height: 8,
    backgroundColor: Colors.liferPrimary,
    borderRadius: 4,
  },
  liferDot: {
    position: 'absolute',
    top: -10,
    marginLeft: -12,
  },
  fallbackSub: {
    ...TypeScale.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
