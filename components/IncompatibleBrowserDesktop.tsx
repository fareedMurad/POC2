import React from "react";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import FireFox from "@/public/firefox.svg";
import Safari from "@/public/safari.svg";
import Chrome from "@/public/chrome.svg";

export default function IncompatibleBrowserDesktop() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-[#2a2d35] rounded-lg p-12 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image
              src={Logo}
              alt="Logo"
              className=" md:w-51.5 md-h-[65.9px] w-40 h-12.5 "
            />
          </div>

          {/* Title */}
          <h1 className="text-white text-[32px] font-semibold mb-6">
            Incompatible Browser Detected
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-lg mb-10 leading-6">
            This website requires Chrome, Firefox, or Safari on Windows or Mac.
            Please switch to a supported browser to continue.
          </p>

          {/* Browser Icons */}
          <div className="flex items-center justify-center gap-5">
            {/* Firefox */}
            <div className="rounded-full flex items-center justify-center">
              <Image
                src={FireFox}
                alt="FireFox"
                className="md:w-10 md:h-10 w-7 h-7"
              />
            </div>

            {/* Safari */}
            <div className="rounded-full flex items-center justify-center">
              <Image
                src={Safari}
                alt="Safari"
                className="md:w-10 md:h-10 w-7 h-7"
              />
            </div>

            {/* Chrome */}
            <div className="rounded-full flex items-center justify-center">
              <Image
                src={Chrome}
                alt="Chrome"
                className="md:w-10 md:h-10 w-7 h-7"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
