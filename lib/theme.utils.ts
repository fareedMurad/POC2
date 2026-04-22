/**
 * Theme Utility Functions
 * Helper functions to easily access theme values in components
 */

import { themeConfig } from "./theme.config";

/**
 * Get a color value from theme config
 * @example getColor('primary') => 'oklch(0.45 0.2 142)'
 * @example getColor('primary', '600') => 'oklch(0.40 0.2 142)'
 * @example getColor('text', 'primary') => 'oklch(0.95 0 0)'
 */
export function getColor(
  colorKey: keyof typeof themeConfig.colors,
  variant: string = "DEFAULT"
): string {
  const colorGroup = themeConfig.colors[colorKey];
  if (typeof colorGroup === "string") {
    return colorGroup;
  }
  return (colorGroup as any)[variant] || (colorGroup as any).DEFAULT || "";
}

/**
 * Get font size value and line height
 * @example getFontSize('base') => ['1rem', { lineHeight: '1.5rem' }]
 */
export function getFontSize(
  size: keyof typeof themeConfig.typography.fontSize
) {
  return themeConfig.typography.fontSize[size];
}

/**
 * Get font weight value
 * @example getFontWeight('semibold') => '600'
 */
export function getFontWeight(
  weight: keyof typeof themeConfig.typography.fontWeight
) {
  return themeConfig.typography.fontWeight[weight];
}

/**
 * Get spacing value
 * @example getSpacing(4) => '1rem'
 */
export function getSpacing(size: keyof typeof themeConfig.spacing) {
  return themeConfig.spacing[size];
}

/**
 * Get border radius value
 * @example getBorderRadius('lg') => '0.625rem'
 */
export function getBorderRadius(size: keyof typeof themeConfig.borderRadius) {
  return themeConfig.borderRadius[size];
}

/**
 * Get transition duration
 * @example getTransitionDuration('DEFAULT') => '200ms'
 */
export function getTransitionDuration(
  speed: keyof typeof themeConfig.transition.duration
) {
  return themeConfig.transition.duration[speed];
}

/**
 * Get transition timing function
 * @example getTransitionTiming('inOut') => 'cubic-bezier(0.4, 0, 0.2, 1)'
 */
export function getTransitionTiming(
  timing: keyof typeof themeConfig.transition.timing
) {
  return themeConfig.transition.timing[timing];
}

/**
 * Build a complete transition CSS value
 * @example buildTransition(['background-color', 'color'], 'DEFAULT', 'inOut')
 */
export function buildTransition(
  properties: string[],
  duration: keyof typeof themeConfig.transition.duration = "DEFAULT",
  timing: keyof typeof themeConfig.transition.timing = "DEFAULT"
): string {
  const durationValue = getTransitionDuration(duration);
  const timingValue = getTransitionTiming(timing);
  return properties
    .map((prop) => `${prop} ${durationValue} ${timingValue}`)
    .join(", ");
}

/**
 * Generate CSS class names for theme values (for inline styles or CSS-in-JS)
 * This is useful when you want to apply theme values directly to style prop
 */
export const themeStyles = {
  // Text colors
  textPrimary: { color: getColor("text", "primary") },
  textSecondary: { color: getColor("text", "secondary") },
  textMuted: { color: getColor("text", "muted") },

  // Background colors
  bgPrimary: { backgroundColor: getColor("background", "DEFAULT") },
  bgCard: { backgroundColor: getColor("background", "card") },
  bgLight: { backgroundColor: getColor("background", "light") },

  // Border colors
  borderDefault: { borderColor: getColor("border", "DEFAULT") },
  borderFocus: { borderColor: getColor("border", "focus") },
  borderError: { borderColor: getColor("border", "error") },

  // Semantic colors
  success: { color: getColor("success") },
  error: { color: getColor("error") },
  warning: { color: getColor("warning") },

  // Common combinations
  button: {
    primary: {
      backgroundColor: getColor("primary", "DEFAULT"),
      color: getColor("primary", "foreground"),
      padding: `${getSpacing(2)} ${getSpacing(8)}`,
      borderRadius: getBorderRadius("md"),
      fontWeight: getFontWeight("medium"),
      transition: buildTransition(["background-color"], "DEFAULT", "inOut"),
    },
    secondary: {
      backgroundColor: getColor("background", "card"),
      color: getColor("text", "primary"),
      padding: `${getSpacing(2)} ${getSpacing(8)}`,
      borderRadius: getBorderRadius("md"),
      fontWeight: getFontWeight("medium"),
      transition: buildTransition(["background-color"], "DEFAULT", "inOut"),
    },
  },

  input: {
    default: {
      backgroundColor: getColor("input", "background"),
      color: getColor("text", "primary"),
      borderColor: getColor("input", "border"),
      padding: `${getSpacing(2)} ${getSpacing(4)}`,
      borderRadius: getBorderRadius("md"),
      borderWidth: "1px",
      borderStyle: "solid",
    },
    focus: {
      borderColor: getColor("input", "borderFocus"),
      outline: "none",
    },
    error: {
      borderColor: getColor("border", "error"),
    },
  },
};

/**
 * Generate Tailwind-compatible class strings from theme config
 * This helps you build dynamic class names from theme values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Export theme config for direct access
 */
export { themeConfig };
export default themeConfig;
