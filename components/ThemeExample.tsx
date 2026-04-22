/**
 * Theme Example Component
 * Demonstrates how to use the centralized theme configuration
 *
 * USAGE EXAMPLES:
 *
 * 1. Using with Tailwind classes (recommended):
 *    className="bg-[oklch(0.08 0 0)] text-[oklch(0.95 0 0)]"
 *    Or better yet, use Tailwind's existing classes
 *
 * 2. Using theme utilities for inline styles:
 *    style={{ backgroundColor: getColor('background', 'DEFAULT') }}
 *
 * 3. Using pre-built theme styles:
 *    style={themeStyles.textPrimary}
 */

"use client";

import React from "react";
import {
  getColor,
  getFontSize,
  getFontWeight,
  getSpacing,
  themeStyles,
} from "@/lib/theme.utils";
import { themeConfig } from "@/lib/theme.config";

export default function ThemeExample() {
  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={themeStyles.textPrimary}>
          Theme Configuration System
        </h2>
        <p style={themeStyles.textSecondary}>
          This component demonstrates various ways to use the centralized theme
          configuration.
        </p>
      </section>

      {/* Method 1: Using theme utilities */}
      <section
        style={{
          backgroundColor: getColor("background", "card"),
          padding: getSpacing(6),
          borderRadius: "0.5rem",
        }}
      >
        <h3
          style={{
            color: getColor("text", "primary"),
            fontWeight: getFontWeight("semibold"),
            marginBottom: getSpacing(4),
          }}
        >
          Method 1: Using Theme Utilities
        </h3>
        <p
          style={{
            color: getColor("text", "secondary"),
            marginBottom: getSpacing(2),
          }}
        >
          Access theme values programmatically:
        </p>
        <pre
          style={{
            backgroundColor: getColor("background", "dark"),
            color: getColor("text", "primary"),
            padding: getSpacing(3),
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {`import { getColor, getSpacing } from '@/lib/theme.utils';

style={{
  backgroundColor: getColor('background', 'card'),
  padding: getSpacing(6),
  color: getColor('text', 'primary')
}}`}
        </pre>
      </section>

      {/* Method 2: Using pre-built themeStyles */}
      <section
        style={{
          ...themeStyles.bgCard,
          padding: getSpacing(6),
          borderRadius: "0.5rem",
        }}
      >
        <h3
          style={{
            ...themeStyles.textPrimary,
            fontWeight: getFontWeight("semibold"),
            marginBottom: getSpacing(4),
          }}
        >
          Method 2: Using Pre-built Theme Styles
        </h3>
        <div
          style={{ ...themeStyles.textSecondary, marginBottom: getSpacing(4) }}
        >
          <p>Use predefined style objects for common patterns:</p>
        </div>
        <pre
          style={{
            backgroundColor: getColor("background", "dark"),
            color: getColor("text", "primary"),
            padding: getSpacing(3),
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {`import { themeStyles } from '@/lib/theme.utils';

// Text styles
style={themeStyles.textPrimary}
style={themeStyles.textSecondary}

// Background styles
style={themeStyles.bgPrimary}
style={themeStyles.bgCard}

// Button styles
style={themeStyles.button.primary}
style={themeStyles.button.secondary}`}
        </pre>
      </section>

      {/* Method 3: Direct theme config access */}
      <section
        style={{
          backgroundColor: getColor("background", "card"),
          padding: getSpacing(6),
          borderRadius: "0.5rem",
        }}
      >
        <h3
          style={{
            color: getColor("text", "primary"),
            fontWeight: getFontWeight("semibold"),
            marginBottom: getSpacing(4),
          }}
        >
          Method 3: Direct Theme Config Access
        </h3>
        <p
          style={{
            color: getColor("text", "secondary"),
            marginBottom: getSpacing(2),
          }}
        >
          Access the theme configuration object directly:
        </p>
        <pre
          style={{
            backgroundColor: getColor("background", "dark"),
            color: getColor("text", "primary"),
            padding: getSpacing(3),
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {`import { themeConfig } from '@/lib/theme.config';

// Access any theme value
themeConfig.colors.primary.DEFAULT
themeConfig.typography.fontSize.lg
themeConfig.spacing[4]
themeConfig.borderRadius.lg`}
        </pre>
      </section>

      {/* Color Palette Demo */}
      <section
        style={{
          backgroundColor: getColor("background", "card"),
          padding: getSpacing(6),
          borderRadius: "0.5rem",
        }}
      >
        <h3
          style={{
            color: getColor("text", "primary"),
            fontWeight: getFontWeight("semibold"),
            marginBottom: getSpacing(4),
          }}
        >
          Color Palette
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: getSpacing(4),
          }}
        >
          <div>
            <div
              style={{
                backgroundColor: getColor("primary"),
                height: "60px",
                borderRadius: "0.375rem",
                marginBottom: getSpacing(2),
              }}
            ></div>
            <p style={themeStyles.textSecondary}>Primary</p>
          </div>
          <div>
            <div
              style={{
                backgroundColor: getColor("success"),
                height: "60px",
                borderRadius: "0.375rem",
                marginBottom: getSpacing(2),
              }}
            ></div>
            <p style={themeStyles.textSecondary}>Success</p>
          </div>
          <div>
            <div
              style={{
                backgroundColor: getColor("error"),
                height: "60px",
                borderRadius: "0.375rem",
                marginBottom: getSpacing(2),
              }}
            ></div>
            <p style={themeStyles.textSecondary}>Error</p>
          </div>
          <div>
            <div
              style={{
                backgroundColor: getColor("warning"),
                height: "60px",
                borderRadius: "0.375rem",
                marginBottom: getSpacing(2),
              }}
            ></div>
            <p style={themeStyles.textSecondary}>Warning</p>
          </div>
        </div>
      </section>

      {/* Button Examples */}
      <section
        style={{
          backgroundColor: getColor("background", "card"),
          padding: getSpacing(6),
          borderRadius: "0.5rem",
        }}
      >
        <h3
          style={{
            color: getColor("text", "primary"),
            fontWeight: getFontWeight("semibold"),
            marginBottom: getSpacing(4),
          }}
        >
          Buttons Using Theme Styles
        </h3>
        <div style={{ display: "flex", gap: getSpacing(4), flexWrap: "wrap" }}>
          <button style={themeStyles.button.primary}>Primary Button</button>
          <button style={themeStyles.button.secondary}>Secondary Button</button>
          <button
            style={{
              ...themeStyles.button.primary,
              backgroundColor: getColor("success"),
            }}
          >
            Success Button
          </button>
          <button
            style={{
              ...themeStyles.button.primary,
              backgroundColor: getColor("error"),
            }}
          >
            Error Button
          </button>
        </div>
      </section>

      {/* Best Practices */}
      <section
        style={{
          backgroundColor: getColor("background", "card"),
          padding: getSpacing(6),
          borderRadius: "0.5rem",
        }}
      >
        <h3
          style={{
            color: getColor("text", "primary"),
            fontWeight: getFontWeight("semibold"),
            marginBottom: getSpacing(4),
          }}
        >
          Best Practices
        </h3>
        <ul
          style={{
            color: getColor("text", "secondary"),
            listStyle: "disc",
            paddingLeft: getSpacing(6),
          }}
        >
          <li style={{ marginBottom: getSpacing(2) }}>
            <strong style={{ color: getColor("text", "primary") }}>
              Prefer Tailwind classes
            </strong>{" "}
            when possible for better performance and DX
          </li>
          <li style={{ marginBottom: getSpacing(2) }}>
            <strong style={{ color: getColor("text", "primary") }}>
              Use theme utilities
            </strong>{" "}
            for dynamic styles or when you need programmatic access
          </li>
          <li style={{ marginBottom: getSpacing(2) }}>
            <strong style={{ color: getColor("text", "primary") }}>
              Use themeStyles
            </strong>{" "}
            for complex, reusable style objects
          </li>
          <li style={{ marginBottom: getSpacing(2) }}>
            <strong style={{ color: getColor("text", "primary") }}>
              Update theme config
            </strong>{" "}
            instead of hardcoding values throughout your app
          </li>
          <li>
            <strong style={{ color: getColor("text", "primary") }}>
              Maintain consistency
            </strong>{" "}
            by always referencing the theme config
          </li>
        </ul>
      </section>
    </div>
  );
}
