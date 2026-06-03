export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getFormattedDate(): string {
  return new Date()
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();
}

const EMOTION_COLORS: Record<string, string> = {
  wonder:     '#8B8BF5',
  anxiety:    '#D4626A',
  fear:       '#9B7EC8',
  peace:      '#7BA5B5',
  joy:        '#C4A962',
  sadness:    '#7878A8',
  anger:      '#C85A5A',
  confusion:  '#B89060',
  nostalgia:  '#A87EC8',
  excitement: '#85A57B',
  love:       '#C87898',
  curiosity:  '#7BA5B5',
};

export function getEmotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion.toLowerCase()] || '#7B6EF6';
}

/** Realm icon unicode glyphs (no emojis) */
export const REALM_GLYPHS: Record<string, string> = {
  'Ocean Realm':   '\u2248',  // ≈
  'Falling City':  '\u25B3',  // △
  'Lost Forest':   '\u2618',  // ☘
  'Flying Realm':  '\u2601',  // ☁
  'Void':          '\u25CB',  // ○
  'Being Watched': '\u25C9',  // ◉
  'Shadow Maze':   '\u2592',  // ▒
};

/** Formats simple markdown bold (**text**) and linebreaks to clean strings */
export function formatMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

