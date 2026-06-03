import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDreamStore } from '../../store/dreamStore';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';

// Mock speech transcription dictionary for demo
const MOCK_SPEECH_TEMPLATES = [
  "I was walking through a dark city where the skyscrapers started falling down like dominoes, but instead of crashing they floated back up as glowing purple cubes. I felt so anxious trying to escape them.",
  "I was flying over a vast glowing neon ocean. There was a giant celestial key floating in the sky, and whenever I reached for it, the water would ripple with starlight. It was wonderful.",
  "I was lost in a thick green forest. The trees had glowing eyes and were whispering secrets to me. I wasn't scared, just deeply curious about the transition they mentioned."
];

export const RecordDreamScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isAnalyzing, analyzeNewDream } = useDreamStore();

  const [activeTab, setActiveTab] = useState<'write' | 'speak'>('write');
  const [dreamText, setDreamText] = useState('');
  
  // Voice Recording Simulator states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveformHeight] = useState(() => Array.from({ length: 7 }).map(() => new Animated.Value(10)));
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  const getWordCount = () => {
    if (!dreamText.trim()) return 0;
    return dreamText.trim().split(/\s+/).length;
  };

  const getCharCount = () => {
    return dreamText.length;
  };

  // Waveform animation loop during simulated recording
  const startWaveformAnim = () => {
    waveformHeight.forEach((anim) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 40 + 10,
            duration: 200 + Math.random() * 150,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 10,
            duration: 200 + Math.random() * 150,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };

  const stopWaveformAnim = () => {
    waveformHeight.forEach((anim) => {
      anim.setValue(10);
    });
  };

  // Toggle voice simulation
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      stopWaveformAnim();
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      
      // Auto fill a mock speech template if empty
      if (!dreamText.trim()) {
        const randomTemplate = MOCK_SPEECH_TEMPLATES[Math.floor(Math.random() * MOCK_SPEECH_TEMPLATES.length)];
        setDreamText(randomTemplate);
      }
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingSeconds(0);
      startWaveformAnim();
      
      // Timer simulation
      recordingTimer.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            // Auto finish at 15s
            toggleRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!dreamText.trim() || dreamText.length < 10) {
      return;
    }
    const result = await analyzeNewDream(dreamText);
    if (result) {
      // Clear input
      setDreamText('');
      // Navigate to detail
      navigation.navigate('DreamDetail', { dreamId: result.dream_id });
    }
  };

  const getFormattedTimer = () => {
    const min = Math.floor(recordingSeconds / 60);
    const sec = recordingSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (isAnalyzing) {
    return <Loader fullScreen message="Entering the universe..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title */}
          <View style={styles.header}>
            <Text style={styles.title}>D-NET</Text>
            <Text style={styles.subtitle}>Woven Subconscious Journal</Text>
          </View>

          {/* Toggle Tabs */}
          <View style={styles.tabsContainer}>
            <Pressable
              onPress={() => setActiveTab('write')}
              style={[styles.tabBtn, activeTab === 'write' && styles.activeTabBtn]}
            >
              <Text style={[styles.tabLabel, activeTab === 'write' && styles.activeTabLabel]}>
                Write
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setActiveTab('speak')}
              style={[styles.tabBtn, activeTab === 'speak' && styles.activeTabBtn]}
            >
              <Text style={[styles.tabLabel, activeTab === 'speak' && styles.activeTabLabel]}>
                Speak
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          {activeTab === 'write' ? (
            <View style={styles.inputSection}>
              <View style={styles.textareaWrapper}>
                <TextInput
                  value={dreamText}
                  onChangeText={setDreamText}
                  placeholder="Describe your dream..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline={true}
                  style={styles.textarea}
                />
                
                {/* Character and Word Counter */}
                <Text style={styles.counterText}>
                  {getWordCount()} W | {getCharCount()} C
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.voiceSection}>
              <View style={styles.voiceCard}>
                <Text style={styles.voicePrompt}>
                  {isRecording ? "Listening to your voice..." : "Tap microphone to record dream"}
                </Text>
                
                {isRecording && (
                  <View style={styles.waveformContainer}>
                    {waveformHeight.map((anim, idx) => (
                      <Animated.View
                        key={idx}
                        style={[
                          styles.waveBar,
                          {
                            height: anim,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}

                <Text style={styles.timer}>{getFormattedTimer()}</Text>

                <Pressable
                  onPress={toggleRecording}
                  style={[
                    styles.micButton,
                    isRecording && { backgroundColor: COLORS.danger },
                  ]}
                >
                  <Icon
                    name={isRecording ? 'circle-off-outline' : 'microphone'}
                    size={36}
                    color={COLORS.textPrimary}
                  />
                </Pressable>
              </View>

              {/* LIVE TRANSCRIPT */}
              <View style={styles.transcriptCard}>
                <Text style={styles.transcriptLabel}>LIVE TRANSCRIPT PREVIEW</Text>
                <Text style={styles.transcriptText}>
                  {dreamText || "Your transcription will display here. Tap record to speak."}
                </Text>
              </View>
            </View>
          )}

          {/* Action button */}
          <Button
            label="Analyze Dream"
            onPress={handleAnalyze}
            disabled={!dreamText.trim() || dreamText.length < 10}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 120, // accommodate bottom tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTabBtn: {
    backgroundColor: COLORS.card,
  },
  tabLabel: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  activeTabLabel: {
    color: COLORS.primary,
  },
  inputSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  textareaWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    minHeight: 240,
    justifyContent: 'space-between',
  },
  textarea: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    textAlignVertical: 'top',
    flex: 1,
  },
  counterText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
  // Voice styles
  voiceSection: {
    marginBottom: SPACING.lg,
  },
  voiceCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  voicePrompt: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  waveformContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  waveBar: {
    width: 6,
    marginHorizontal: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  timer: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  transcriptCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  transcriptLabel: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  transcriptText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default RecordDreamScreen;
