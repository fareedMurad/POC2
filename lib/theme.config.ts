/**
 * Theme Configuration File
 * Centralized theme settings for the entire application
 * Inspired by Tailwind CSS config structure
 *
 * HOW TO USE:
 * 1. Update color values to match your Figma design
 * 2. Adjust font sizes, weights, and spacing to match design specs
 * 3. Import and use in components: import { themeConfig } from '@/lib/theme.config'
 * 4. Use utility functions for easier access: import { getColor } from '@/lib/theme.utils'
 *
 * CUSTOMIZATION GUIDE:
 * - Colors: Update oklch() values or add new color variants
 * - Typography: Change font families, sizes, and weights from Figma
 * - Spacing: Adjust spacing scale to match your design system
 * - Border Radius: Update to match your Figma corner radius values
 * - Add new sections as needed for your design system
 */

export const themeConfig = {
  // Color Palette - Using Hex Colors from Figma
  colors: {
    // Primary Colors
    primary: {
      DEFAULT: "#22C55E", // Green primary
      hover: "#16A34A", // Darker green on hover
      light: "#68AD5C", // Lighter green
      foreground: "#FFFFFF", // Text on primary
     
    },
  

    // Background Colors (from Figma)
    background: {
      default: "#1f1f1f", // Main background from Figma
      card: "#24282e", // Card/elevated background from Figma
      dark: "#1F1F1F", // Darker variant
      light: "#32363F", // Lighter variant
      border: "#3F3F3F",
    },

    // Text Colors (from Figma)
    text: {
      primary: "#FFFFFF", // White text
      secondary: "#BBBBBB", // Placeholder/secondary text from Figma
      muted: "#8B8B8B", // Muted text
      disabled: "#666666", // Disabled text
    },

    // Input/Field Colors (from Figma)
    input: {
      background: "#2d313a", // Field background from Figma
      border: "#3D424D", // Border color
      borderHover: "#4D525D", // Border on hover
      borderFocus: "#22C55E", // Border on focus (primary color)
      placeholder: "#BBBBBB", // Placeholder text from Figma
    },

    // Semantic Colors
    success: {
      DEFAULT: "#22C55E", // Green
      light: "#4ADE80",
      dark: "#16A34A",
    },

    error: {
      DEFAULT: "#EF4444", // Red
      light: "#F87171",
      dark: "#DC2626",
    },

    warning: {
      DEFAULT: "#F59E0B", // Amber/Orange
      light: "#FCD34D",
      dark: "#D97706",
    },

    info: {
      DEFAULT: "#3B82F6", // Blue
      light: "#60A5FA",

    },

    // Border Colors
    border: {
      DEFAULT: "#3D424D", // Default border
      light: "#4D525D", // Lighter border
      focus: "#22C55E", // Focus state (primary)
      error: "#EF4444", // Error state
    },

    // Additional UI Colors
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },

  // Typography
  typography: {
    fontFamily: {
      sans: [
        "Geist",
        "Geist Fallback",
        "system-ui",
        "-apple-system",
        "sans-serif",
      ],
      mono: ["Geist Mono", "Geist Mono Fallback", "monospace"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
      title: ["0.9375rem", { lineHeight: "1.4rem" }], // 15px - Title size from Figma
      base: ["1rem", { lineHeight: "1.5rem" }], // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
      "5xl": ["3rem", { lineHeight: "1" }], // 48px
    },

    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },

    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },

  // Spacing
  spacing: {
    px: "1px",
    0: "0",
    0.5: "0.125rem", // 2px
    1: "0.25rem", // 4px
    1.5: "0.375rem", // 6px
    2: "0.5rem", // 8px
    2.5: "0.625rem", // 10px
    3: "0.75rem", // 12px
    3.5: "0.875rem", // 14px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    7: "1.75rem", // 28px
    8: "2rem", // 32px
    9: "2.25rem", // 36px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  // Border Radius
  borderRadius: {
    none: "0",
    sm: "calc(0.625rem - 4px)", // ~0.375rem
    DEFAULT: "calc(0.625rem - 2px)", // ~0.5rem
    md: "calc(0.625rem - 2px)", // ~0.5rem
    lg: "0.625rem", // 10px
    xl: "calc(0.625rem + 4px)", // ~0.875rem
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  // Shadows
  boxShadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "none",
  },

  // Transitions
  transition: {
    duration: {
      fastest: "75ms",
      faster: "100ms",
      fast: "150ms",
      DEFAULT: "200ms",
      slow: "300ms",
      slower: "500ms",
      slowest: "700ms",
    },

    timing: {
      DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Z-Index Scale
  zIndex: {
    0: "0",
    10: "10",
    20: "20",
    30: "30",
    40: "40",
    50: "50",
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    modalBackdrop: "1040",
    modal: "1050",
    popover: "1060",
    tooltip: "1070",
  },

  // Breakpoints (for reference in media queries)
  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;

// Type exports for TypeScript support
export type ThemeConfig = typeof themeConfig;
export type ColorKey = keyof typeof themeConfig.colors;
export type FontSizeKey = keyof typeof themeConfig.typography.fontSize;
export type FontWeightKey = keyof typeof themeConfig.typography.fontWeight;
export type SpacingKey = keyof typeof themeConfig.spacing;

export default themeConfig;
