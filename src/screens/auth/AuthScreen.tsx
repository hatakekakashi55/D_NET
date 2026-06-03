import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const AuthScreen: React.FC = () => {
  const setSession = useAuthStore((state) => state.setSession);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const res = isSignUp
        ? await authService.signUp(email, password)
        : await authService.signIn(email, password);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      if (res.session && res.user) {
        await setSession(res.session.access_token, res.user);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title */}
          <View style={styles.header}>
            <Text style={styles.title}>D-NET</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your dream profile' : 'Sign in to access your universe'}
            </Text>
          </View>

          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Form */}
          <View style={styles.form}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              label="Email"
              leftIcon="email"
              style={styles.input}
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              label="Password"
              secureTextEntry={true}
              leftIcon="lock"
              style={styles.input}
            />

            <Button
              label={isSignUp ? 'Create Profile' : 'Sign In'}
              onPress={handleSubmit}
              isLoading={isLoading}
              style={styles.submitBtn}
            />
          </View>

          {/* Switch link */}
          <Pressable
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            style={styles.toggleLink}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have a profile? Sign In'
                : "Don't have a profile? Create one"}
            </Text>
          </Pressable>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 48,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  toggleLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  toggleText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
});

export default AuthScreen;
