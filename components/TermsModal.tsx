"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Loading from "@/public/Loading.svg";

type Props = {
  open: boolean;
  onClose: () => void;
  content?: string;
};

export default function TermsModal({ open, onClose, content }: Props) {
  if (!open) return null;

  const formatTermsAndConditions = (text: string): React.ReactNode => {
    if (!text) return null;

    const lines = text.split("\n");

    return lines.map((line, index) => {
      const trimmed = line.trim();

      // Level 1: First line
      if (index === 0) {
        const content = trimmed.replace(/^###\s*/, "");
        return (
          <div
            key={index}
            className="text-2xl font-semibold text-white text-center mb-8"
          >
            {content}
          </div>
        );
      }

      // Level 2: Second line
      if (index === 1) {
        const content = trimmed.replace(/^\*\*/, "").replace(/\*\*$/, "");
        return (
          <div key={index} className="text-lg font-medium text-white mb-2 mt-3">
            {content}
          </div>
        );
      }

      // Level 3: Numeric list (1. 2. 3. ...)
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);

        const number = match?.[1];
        let content = match?.[2] || "";

        // Remove ** markers
        content = content.replace(/\*\*/g, "");

        return (
          <div
            key={index}
            className="text-xl font-semibold text-white mt-4 flex"
          >
            <div className={`${number > 9 ? "w-7.5" : "w-5"} shrink-0`}>
              {number}.
            </div>
            <div className="grow">{content}</div>
          </div>
        );
      }

      // Level 4: Lines starting with -
      if (trimmed.startsWith("-")) {
        const dashIndex = line.indexOf("-");
        const content = line.substring(dashIndex + 1).trim();
        return (
          <div
            key={index}
            className="text-lg text-text-secondary mb-0 flex pl-6"
          >
            <div className="shrink-0 w-4">-</div>
            <div className="grow">{content}</div>
          </div>
        );
      }

      // Regular text (if any)
      if (trimmed) {
        const content = trimmed.replace(/\*\*/g, "");
        return (
          <div key={index} className="text-lg text-text-secondary my-1">
            {content}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[90%] max-w-3xl max-h-screen bg-[#25282E] rounded-xl shadow-xl p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-end mb-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 max-h-[65vh] text-[#BBBBBB] space-y-4 text-lg leading-relaxed">
          {content ? (
            <>{formatTermsAndConditions(content || "")}</>
          ) : (
            <div className="flex justify-center items-center py-12 flex-col">
              <Image
                src={Loading}
                alt="Loading"
                className="md:w-23 md:h-23 w-40 h-12.5 animate-spin"
              />
              <p className="text-[14px] font-medium mt-2.5">
                Loading Terms and Conditions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
