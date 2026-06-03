import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';

const { width, height } = Dimensions.get('window');

// Generate mock floating stars coordinates
const STARS_COUNT = 25;
const generateStars = () => {
  return Array.from({ length: STARS_COUNT }).map((_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2000 + 3000,
  }));
};

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Splash'>>();
  const { isOnboarded, isAuthenticated } = useAuthStore();
  
  // Animation refs
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  
  // Animated opacity values for stars
  const starAnims = useRef(
    Array.from({ length: STARS_COUNT }).map(() => new Animated.Value(Math.random() * 0.5 + 0.3))
  ).current;

  useEffect(() => {
    // 1. Logo rising and fade in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Stars twinkling loop
    starAnims.forEach((anim, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.1,
            duration: Math.random() * 1500 + 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.9,
            duration: Math.random() * 1500 + 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 3. Navigation routing
    const timer = setTimeout(() => {
      if (isOnboarded) {
        navigation.replace('Auth');
      } else {
        navigation.replace('Onboarding');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOnboarded, isAuthenticated, navigation]);

  const stars = generateStars();

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Starry Sky Background */}
      {stars.map((star, idx) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: starAnims[idx],
            },
          ]}
        />
      ))}

      {/* Centered logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>D-NET</Text>
        <Text style={styles.subtitle}>Where dreams become universe</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 48,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

export default SplashScreen;
