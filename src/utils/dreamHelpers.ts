import { COLORS } from '../theme/colors';

export const getEmotionColor = (emotionName: string): string => {
  const name = emotionName.toLowerCase();
  if (name.includes('anxiety') || name.includes('fear') || name.includes('scared')) {
    return COLORS.danger;
  }
  if (name.includes('wonder') || name.includes('calm') || name.includes('joy') || name.includes('peace')) {
    return COLORS.secondary;
  }
  if (name.includes('mystery') || name.includes('confusion') || name.includes('weird')) {
    return COLORS.glow;
  }
  return COLORS.primary;
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
