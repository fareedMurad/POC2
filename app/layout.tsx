import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import BrowserCompatibilityCheck from "@/components/BrowserCompatibilityCheck";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Praktice - Presentation Rehearsal Platform",
  description:
    "Get AI-powered and peer feedback on your presentations. Upload your video and receive comprehensive analysis on delivery, content, and engagement.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* IE Detection Script - must run before React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var ua = window.navigator.userAgent;
                var isIE = /MSIE|Trident/.test(ua);
                
                if (isIE) {
                  document.addEventListener('DOMContentLoaded', function() {
                    var root = document.getElementById('app-root');
                    if (root) {
                      root.style.display = 'none';
                    }
                    var ieWarning = document.getElementById('ie-warning');
                    if (ieWarning) {
                      ieWarning.style.display = 'flex';
                    }
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {/* IE Warning - Static HTML that works without JavaScript */}
        <div
          id="ie-warning"
          style={{
            display: "none",
            minHeight: "100vh",
            backgroundColor: "#1a1a1a",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "42rem",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "#2a2d35",
                borderRadius: "0.5rem",
                padding: "3rem",
                textAlign: "center",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "2rem",
                }}
              >
                <img
                  src="/logo.svg"
                  alt="Logo"
                  style={{ width: "160px", height: "50px" }}
                />
              </div>

              <h1
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "600",
                  marginBottom: "1.5rem",
                }}
              >
                Incompatible Browser Detected
              </h1>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "18px",
                  marginBottom: "2.5rem",
                }}
              >
                This website requires Chrome, Firefox, or Safari on Windows or
                Mac. Please switch to a supported browser to continue.
              </p>

              {/* Browser Icons Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                {/* Firefox */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/firefox.svg"
                    alt="Firefox"
                    style={{ width: "40px", height: "40px" }}
                  />
                </div>

                {/* Safari */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/safari.svg"
                    alt="Safari"
                    style={{ width: "40px", height: "40px" }}
                  />
                </div>

                {/* Chrome */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/chrome.svg"
                    alt="Chrome"
                    style={{ width: "40px", height: "40px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main App */}
        <div id="app-root">
          <BrowserCompatibilityCheck>{children}</BrowserCompatibilityCheck>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
