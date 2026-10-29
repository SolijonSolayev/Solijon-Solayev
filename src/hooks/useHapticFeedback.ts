import { useCallback } from 'react';

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'glitch';

const HAPTIC_PATTERNS: Record<HapticFeedbackType, number | number[]> = {
  selection: 8,
  light: 12,
  medium: 24,
  heavy: 40,
  success: [15, 60, 25],
  glitch: [8, 30, 10],
  warning: [25, 40, 25],
  error: [35, 50, 35, 50, 35],
};

/**
 * Triggers native vibration if available on the device
 */
export function triggerHaptic(type: HapticFeedbackType = 'light'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if ('navigator' in window && typeof navigator.vibrate === 'function') {
      const pattern = HAPTIC_PATTERNS[type] ?? 12;
      return navigator.vibrate(pattern);
    }
  } catch {
    // Vibration can fail if user hasn't interacted or permissions are blocked
    return false;
  }

  return false;
}

export function isHapticSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    typeof navigator.vibrate === 'function'
  );
}

/**
 * Custom React hook for triggering fine-grained haptic feedback patterns
 */
export function useHapticFeedback() {
  const trigger = useCallback((type: HapticFeedbackType = 'light') => {
    return triggerHaptic(type);
  }, []);

  const triggerSelection = useCallback(() => triggerHaptic('selection'), []);
  const triggerLight = useCallback(() => triggerHaptic('light'), []);
  const triggerMedium = useCallback(() => triggerHaptic('medium'), []);
  const triggerHeavy = useCallback(() => triggerHaptic('heavy'), []);
  const triggerSuccess = useCallback(() => triggerHaptic('success'), []);
  const triggerGlitch = useCallback(() => triggerHaptic('glitch'), []);
  const triggerWarning = useCallback(() => triggerHaptic('warning'), []);

  return {
    isSupported: isHapticSupported(),
    trigger,
    triggerSelection,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerGlitch,
    triggerWarning,
  };
}
