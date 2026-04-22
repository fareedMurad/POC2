"use client";

import { useEffect } from "react";
import Image from "next/image";
import { PresentationData } from "./PresentationWizard";
import CheckImg from "@/public/check.png";

interface WizardStep2Props {
  values: PresentationData;
}

export default function WizardStep2({ values }: WizardStep2Props) {
  // Scroll to top when component mounts (user navigates to this step)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Calculate presentation type display text
  const presentationTypeText =
    values.type === "Other" && values.otherType
      ? `Other - ${values.otherType}`
      : values.type;

  // Determine if we need wider column for presentation type (more than 40 characters)
  const isLongPresentationType = presentationTypeText.length > 48;

  return (
    <div className="space-y-6">
      {/* Header with checkmark icon */}
      <div className="flex items-start pb-3.5 gap-5 ">
        <Image src={CheckImg} alt="Logo" width={56} height={56} />
        <div>
          <h3 className="text-[22px] font-semibold text-white">
            Confirm Presentation Details
          </h3>
          <p className="text-[16px] text-text-secondary mt-1">
            Please review your presentation details before continuing
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#3D424D] mt-3"></div>

      {/* Review Details */}
      <div className="space-y-2 mt-6">
        {/* Presentation Title */}
        <div>
          <p className="text-[15px] font-medium text-white mb-3 pt-4 wrap-anywhere">
            Presentation Title
          </p>
          <p className="text-[15px] text-text-secondary">{values.title}</p>
        </div>
        <div className="h-px bg-[#3D424D] mt-3"></div>
        {/* Purpose */}
        <div className="mt-5">
          <p className="text-[15px] font-medium text-white mb-3 pt-4">
            Purpose
          </p>
          <p className="text-[15px] text-text-secondary leading-relaxed wrap-anywhere">
            {values.purpose}
          </p>
        </div>
        <div className="h-px bg-[#3D424D] mt-3"></div>
        {/* Presentation Type and Max Duration */}
        <div
          className={`grid ${
            isLongPresentationType ? "grid-cols-[2fr_1fr]" : "grid-cols-2"
          } gap-6 mt-5`}
        >
          <div className="border-r">
            <p className="text-[15px] font-medium text-white mb-3 mt-4">
              Presentation Type
            </p>
            <p className="text-[15px] text-text-secondary wrap-break-word pr-4">
              {presentationTypeText}
            </p>
          </div>
          <div>
            <p className="text-[15px] font-medium text-white mb-3 mt-4">
              Max Duration
            </p>
            <p className="text-[15px] text-text-secondary">
              {values.duration} minutes
            </p>
          </div>
        </div>
        <div className="h-px bg-[#3D424D] mt-3"></div>
        {/* Audience */}
        <div className="mt-6">
          <p className="text-[15px] font-medium text-white mb-3">Audience</p>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-3 wrap-anywhere">
            {values.audience}
          </p>
        </div>
        <div className="h-px bg-[#3D424D] mt-3"></div>
        {/* Additional Notes */}
        <div className="mt-7.5">
          <p className="text-[15px] font-medium text-white mb-3  ">
            Additional Notes{" "}
            <span className="text-text-muted text-xs">(Optional)</span>
          </p>
          <p className="text-[15px] text-text-secondary leading-relaxed wrap-anywhere">
            {values.additionalNotes || "None"}
          </p>
        </div>
        <div className="h-px bg-[#3D424D] mt-3"></div>
      </div>
    </div>
  );
}
