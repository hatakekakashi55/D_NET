import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from './Icon';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  leftIcon?: string;
  style?: StyleProp<ViewStyle>;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  leftIcon,
  style,
  multiline = false,
  numberOfLines,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedBorder,
          !!error && styles.errorBorder,
          multiline && { height: 'auto', minHeight: 120, alignItems: 'flex-start', paddingTop: SPACING.sm },
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            styles.input,
            {
              color: COLORS.textPrimary,
              paddingLeft: leftIcon ? 0 : SPACING.sm,
            },
          ]}
        />
        
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
          >
            <Icon
              name={isPasswordVisible ? 'eye-outline' : 'circle-off-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </Pressable>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.md,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  passwordToggle: {
    padding: SPACING.xs,
  },
  focusedBorder: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  errorBorder: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
