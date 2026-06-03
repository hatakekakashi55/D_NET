export const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return '';
    
    // Check if it's today
    const today = new Date();
    if (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }

    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
};

export const formatTime = (isoString: string): string => {
  try {
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return '';
  }
};
