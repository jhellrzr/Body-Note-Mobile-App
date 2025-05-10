/**
 * Utility functions for haptic feedback on mobile devices
 */

// Check if navigator.vibrate is available
const supportsVibration = () => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

// Short vibration for UI interactions (like button press)
export const lightHapticFeedback = () => {
  if (supportsVibration()) {
    navigator.vibrate(10);
  }
};

// Medium vibration for confirmations
export const mediumHapticFeedback = () => {
  if (supportsVibration()) {
    navigator.vibrate(25);
  }
};

// Strong vibration for important notifications or errors
export const strongHapticFeedback = () => {
  if (supportsVibration()) {
    navigator.vibrate(50);
  }
};

// Pattern vibration for success
export const successHapticFeedback = () => {
  if (supportsVibration()) {
    navigator.vibrate([15, 50, 15]);
  }
};

// Pattern vibration for error
export const errorHapticFeedback = () => {
  if (supportsVibration()) {
    navigator.vibrate([50, 100, 50]);
  }
};

// Custom pattern vibration
export const patternHapticFeedback = (pattern: number[]) => {
  if (supportsVibration()) {
    navigator.vibrate(pattern);
  }
};