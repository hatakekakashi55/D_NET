import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Record your dream every morning',
    description: 'Wake up, write or speak your dream. Capture every fading memory in high fidelity.',
    icon: 'moon',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'AI reveals your subconscious patterns',
    description: 'Understand the hidden symbols, archetype structures, and deep emotions in your mind.',
    icon: 'brain',
    color: COLORS.glow,
  },
  {
    id: '3',
    title: 'Join a universe of dreamers',
    description: 'Step into collective dream realms and read daily AI chronicles generated from thousands of sleeping minds.',
    icon: 'planet',
    color: COLORS.secondary,
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Onboarding'>>();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    navigation.replace('Auth');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('Auth');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15`, borderColor: item.color }]}>
          <Icon name={item.icon} size={64} color={item.color} />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Skip button */}
      <View style={styles.header}>
        {activeIndex < SLIDES.length - 1 ? (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      {/* Slide List */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
      />

      {/* Footer controls */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          label={activeIndex === SLIDES.length - 1 ? 'Begin' : 'Next'}
          onPress={handleNext}
          fullWidth={true}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  slideTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  slideDescription: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 16,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  button: {
    width: '100%',
  },
});

export default OnboardingScreen;
