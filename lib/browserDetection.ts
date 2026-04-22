/**
 * Browser and Device Detection Utility
 * Detects device type, OS, and browser information
 */

export interface BrowserInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: string;
  browser: string;
  isCompatible: boolean;
  incompatibilityReason?: "mobile" | "unsupported-os" | "unsupported-browser";
}

/**
 * Detects device type, OS, and browser
 * This function should run on client-side only
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined") {
    // Server-side default
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      os: "unknown",
      browser: "unknown",
      isCompatible: true,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || "";

  // Detect device type
  const isMobile =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i.test(
    userAgent
  );
  const isDesktop = !isMobile && !isTablet;

  // Detect OS
  let os = "unknown";
  if (
    /mac|macintosh|macintel|macppc/i.test(platform) ||
    /mac os x/i.test(userAgent)
  ) {
    os = "mac";
  } else if (/win|windows/i.test(platform) || /windows nt/i.test(userAgent)) {
    os = "windows";
  } else if (/linux/i.test(platform) || /linux/i.test(userAgent)) {
    os = "linux";
  } else if (/cros/i.test(userAgent)) {
    os = "chromeos";
  }

  // Detect browser - Order matters! Check most specific first
  let browser = "unknown";

  // DuckDuckGo browser detection (check before Safari/Chrome)
  if (/duckduckgo|ddg/i.test(userAgent)) {
    browser = "duckduckgo";
  }
  // Edge detection
  else if (/edg/i.test(userAgent)) {
    browser = "edge";
  }
  // Opera detection
  else if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) {
    browser = "opera";
  }
  // Chrome detection (must be before Safari check since Chrome also has Safari in UA)
  else if (
    /chrome|chromium|crios/i.test(userAgent) &&
    !/edg/i.test(userAgent) &&
    !/opr/i.test(userAgent)
  ) {
    browser = "chrome";
  }
  // Firefox detection
  else if (/firefox|fxios/i.test(userAgent)) {
    browser = "firefox";
  }
  // Safari detection (must be last among WebKit browsers)
  else if (
    /safari/i.test(userAgent) &&
    !/chrome|chromium|crios/i.test(userAgent) &&
    !/edg/i.test(userAgent) &&
    !/opr/i.test(userAgent) &&
    !/duckduckgo|ddg/i.test(userAgent)
  ) {
    browser = "safari";
  }
  // Internet Explorer
  else if (/trident/i.test(userAgent) || /msie/i.test(userAgent)) {
    browser = "ie";
  }
  // Brave browser
  else if (/brave/i.test(userAgent)) {
    browser = "brave";
  }

  // Determine compatibility
  let isCompatible = true;
  let incompatibilityReason:
    | "mobile"
    | "unsupported-os"
    | "unsupported-browser"
    | undefined;

  // Rule 1: Not compatible if mobile or tablet
  if (isMobile || isTablet) {
    isCompatible = false;
    incompatibilityReason = "mobile";
  }
  // Rule 2: Desktop - must be Mac, Windows, or Linux (Ubuntu silently supported)
  else if (isDesktop && os !== "mac" && os !== "windows" && os !== "linux") {
    isCompatible = false;
    incompatibilityReason = "unsupported-os";
  }
  // Rule 3: Desktop Mac/Windows/Linux - must be Chrome, Firefox, or Safari
  else if (
    isDesktop &&
    (os === "mac" || os === "windows" || os === "linux") &&
    browser !== "chrome" &&
    browser !== "firefox" &&
    browser !== "safari"
  ) {
    isCompatible = false;
    incompatibilityReason = "unsupported-browser";
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    os,
    browser,
    isCompatible,
    incompatibilityReason,
  };
}

/**
 * Check if current browser/device is compatible
 */
export function isCompatibleBrowser(): boolean {
  const browserInfo = detectBrowser();
  return browserInfo.isCompatible;
}

/**
 * Get incompatibility reason
 */
export function getIncompatibilityReason(): "mobile" | "desktop" | null {
  const browserInfo = detectBrowser();

  if (browserInfo.isCompatible) {
    return null;
  }

  if (browserInfo.incompatibilityReason === "mobile") {
    return "mobile";
  }

  return "desktop";
}
