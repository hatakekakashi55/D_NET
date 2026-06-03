import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BORDER_RADIUS } from '../../theme/spacing';

export const UniverseGlobe: React.FC = () => {
  // Rotate animation for the galaxy dust rings
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim1, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim2, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse of core
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin1 = rotateAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Glow Ring 1 */}
      <Animated.View
        style={[
          styles.ring,
          styles.ring1,
          { transform: [{ rotate: spin1 }] },
        ]}
      />

      {/* Outer Glow Ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          styles.ring2,
          { transform: [{ rotate: spin2 }] },
        ]}
      />

      {/* Core Star Orb */}
      <Animated.View
        style={[
          styles.core,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  core: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
  },
  ring: {
    position: 'absolute',
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  ring1: {
    width: 140,
    height: 140,
    borderColor: `${COLORS.primary}60`,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  ring2: {
    width: 180,
    height: 180,
    borderColor: `${COLORS.glow}40`,
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
});
