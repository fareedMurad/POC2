"use client";

import { useEffect, useState } from "react";
import { detectBrowser } from "@/lib/browserDetection";
import IncompatibleBrowserDesktop from "./IncompatibleBrowserDesktop";
import IncompatibleBrowserMobile from "./IncompatibleBrowserMobile";
import { usePathname } from "next/navigation";

interface BrowserCompatibilityCheckProps {
  children: React.ReactNode;
}

export default function BrowserCompatibilityCheck({
  children,
}: BrowserCompatibilityCheckProps) {
  const [browserInfo, setBrowserInfo] = useState<{
    isCompatible: boolean;
    incompatibilityReason?: "mobile" | "unsupported-os" | "unsupported-browser";
  } | null>(null);
  const pathname = usePathname();

  const isUploadRoute = pathname.startsWith("/uploadRoomPhoto/");

  useEffect(() => {
    // Run browser detection on client side only
    const info = detectBrowser();
    setBrowserInfo({
      isCompatible: info.isCompatible,
      incompatibilityReason: info.incompatibilityReason,
    });
  }, []);

  // Show nothing during initial render (server-side)
  // This prevents hydration mismatch
  if (browserInfo === null) {
    return null;
  }

  // // If browser is compatible, render children
  if (browserInfo.isCompatible) {
    return <>{children}</>;
  }

  // If browser is compatible OR route is allowed → render children
  if (browserInfo.isCompatible || isUploadRoute) {
    return <>{children}</>;
  }

  // Show mobile incompatible page for mobile/tablet devices
  if (browserInfo.incompatibilityReason === "mobile") {
    return <IncompatibleBrowserMobile />;
  }

  // Show desktop incompatible page for unsupported OS or browser
  return <IncompatibleBrowserDesktop />;
}
