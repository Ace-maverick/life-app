/**
 * LiveTrackingMap
 *
 * Shows an Addis Ababa map with:
 *  - A blue destination pin (task location)
 *  - A green lifer pin that animates toward the destination when status === 'Assigned'
 *  - A static green "on-site" pin when status === 'In Progress'
 *
 * Uses named Addis Ababa neighbourhoods → lat/lng lookup so no GPS permission
 * is required in the prototype.  The lifer pin moves smoothly every 3 s while
 * the task is in Assigned state, simulating real-time tracking.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Radius, TypeScale } from '../theme';

// ─── Addis Ababa area coordinates ────────────────────────────────────────────

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  Bole:        { lat: 9.0054, lng: 38.7636 },
  Piazza:      { lat: 9.0304, lng: 38.7468 },
  Kazanchis:   { lat: 9.0200, lng: 38.7614 },
  CMC:         { lat: 9.0417, lng: 38.8146 },
  Sarbet:      { lat: 9.0041, lng: 38.7382 },
  Megenagna:   { lat: 9.0259, lng: 38.8007 },
  Lebu:        { lat: 8.9776, lng: 38.7134 },
  Kolfe:       { lat: 9.0052, lng: 38.7145 },
  Gerji:       { lat: 9.0159, lng: 38.8044 },
  Ayat:        { lat: 9.0545, lng: 38.8432 },
  Summit:      { lat: 9.0328, lng: 38.8297 },
  Lideta:      { lat: 9.0149, lng: 38.7351 },
  'Addis Ababa': { lat: 9.0227, lng: 38.7468 },
};

const DEFAULT_COORD = { lat: 9.0227, lng: 38.7468 };

function getCoord(area: string) {
  // try exact match, then partial match
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
  taskArea: string;       // destination (task location)
  liferArea?: string;     // lifer's home area (used as start position)
  taskStatus: string;     // 'Assigned' | 'In Progress' | etc.
  style?: object;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveTrackingMap({ taskArea, liferArea, taskStatus, style }: Props) {
  const dest   = getCoord(taskArea);
  const origin = getCoord(liferArea ?? taskArea);

  // Offset origin slightly so it doesn't start exactly on the destination
  const startCoord = liferArea && liferArea !== taskArea ? origin : {
    lat: origin.lat + 0.012,
    lng: origin.lng - 0.009,
  };

  const isAssigned   = taskStatus === 'Assigned';
  const isInProgress = taskStatus === 'In Progress';

  // Lifer position — starts at startCoord, travels to dest over ~20 ticks (60 s)
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

  // Blink animation for the "Live" dot
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

  // Derive map region to show both pins
  const midLat = (dest.lat + liferLat) / 2;
  const midLng = (dest.lng + liferLng) / 2;
  const latDelta = Math.max(Math.abs(dest.lat - liferLat) * 2.5, 0.025);
  const lngDelta = Math.max(Math.abs(dest.lng - liferLng) * 2.5, 0.025);

  const showLiferPin = isAssigned || isInProgress;
  const etaSteps = Math.max(0, Math.round((1 - progress) * 20));
  const etaMin   = etaSteps > 0 ? `~${etaSteps * 3} min away` : 'Arrived';

  return (
    <View style={[styles.wrapper, style]}>
      {/* Live badge */}
      {showLiferPin && (
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { opacity: blink }]} />
          <Text style={styles.liveText}>
            {isInProgress ? 'On site' : `Live · ${etaMin}`}
          </Text>
        </View>
      )}

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
        {/* Task / destination pin */}
        <Marker
          coordinate={{ latitude: dest.lat, longitude: dest.lng }}
          title="Task location"
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.destPin}>
            <Text style={{ fontSize: 18 }}>📍</Text>
          </View>
        </Marker>

        {/* Lifer pin */}
        {showLiferPin && (
          <>
            {/* Dotted route line */}
            <Polyline
              coordinates={[
                { latitude: startCoord.lat, longitude: startCoord.lng },
                { latitude: liferLat, longitude: liferLng },
                { latitude: dest.lat, longitude: dest.lng },
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
              <View style={[
                styles.liferPin,
                isInProgress && styles.liferPinOnSite,
              ]}>
                <Text style={{ fontSize: 14 }}>🧑‍🔧</Text>
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Footer label */}
      {showLiferPin && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isInProgress
              ? '✅ Lifer is on-site working'
              : `🏃 Lifer en route to ${taskArea}`}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
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
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    color: '#fff',
    ...TypeScale.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  destPin: {
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: Colors.liferDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  liferPinOnSite: {
    backgroundColor: Colors.posterPrimary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    ...TypeScale.caption,
    fontWeight: '600',
  },
});
