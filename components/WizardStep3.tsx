"use client";

import Image from "next/image";
import { PresentationData } from "./PresentationWizard";
import CheckImg from "@/public/check.png";
import { useEffect } from "react";
import ObjectiveCard from "./ObjectiveCard";

interface WizardStep3Props {
  values: PresentationData;
  showHeader?: boolean;
  objectives?: string; // Objectives from API
  isLoadingObjectives?: boolean;
}

export default function WizardStep3({
  values,
  showHeader = true,
  objectives,
  isLoadingObjectives = false,
}: WizardStep3Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const parseObjectives = (objectives: string) => {
    try {
      const parsed = JSON.parse(objectives);

      if (!parsed?.objectives || !Array.isArray(parsed.objectives)) {
        return [];
      }

      return parsed.objectives;
    } catch (err) {
      console.error("Invalid objectives JSON", err);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with checkmark icon */}
      {showHeader ? (
        <div className="flex items-start pb-3.5 gap-5 ">
          <Image src={CheckImg} alt="Logo" width={56} height={56} />
          <div>
            <h3 className="text-[22px] font-semibold text-white">
              Confirm Presentation Objectives
            </h3>
            <p className="text-[15px] text-text-secondary mt-1">
              Review your presentation objectives listed below. Feedback
              providers will evaluate your presentation based on these criteria.
              To modify objectives, please use the "Back" button below to
              navigate to the previous step and update your presentation details
              accordingly.
            </p>
          </div>
        </div>
      ) : null}
      {/* Presentation Title */}
      {showHeader ? (
        <>
          <div className="h-px bg-[#3D424D] mt-3"></div>
          <div>
            <p className="text-[15px] font-medium text-white mb-3 pt-4">
              Presentation Title
            </p>
            <p className="text-[15px] text-text-secondary wrap-anywhere">
              {values?.title}
            </p>
          </div>
        </>
      ) : null}
      {showHeader ? <div className="h-px bg-[#3D424D] mt-2 mb-0"></div> : null}
      {/* Purpose */}
      <div className={showHeader ? "mt-3" : "mt-0"}>
        <p
          className={`${
            showHeader ? "pt-3" : "pt-0"
          } text-[15px] font-medium text-white mb-3`}
        >
          Purpose
        </p>
        <p className="text-[15px] text-text-secondary leading-relaxed wrap-anywhere">
          {values.purpose}
        </p>
      </div>
      <div className="h-px bg-[#3D424D] mt-2 mb-0"></div>
      {/* Presentation Type and Max Duration */}
      <div className="grid grid-cols-2 gap-6 mt-3">
        <div className="border-r">
          <p className="text-[15px] font-medium text-white mb-3 mt-4">
            Presentation Type
          </p>
          <p className="text-[15px] text-text-secondary">
            {values.type === "Other" && values.otherType
              ? `Other - ${values.otherType}`
              : values.type}
          </p>
        </div>
        <div>
          <p className="text-[15px] font-medium text-white mb-3 mt-4">
            Max Duration
          </p>
          <p className="text-[13px] text-text-secondary">
            {values.duration} minutes
          </p>
        </div>
      </div>
      <div className="h-px bg-[#3D424D] mt-2 mb-0"></div>
      {/* Audience */}
      <div className="mt-6">
        <p className="text-[15px] font-medium text-white mb-3">Audience</p>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-3 wrap-anywhere">
          {values.audience}
        </p>
      </div>
      <div className="h-px bg-[#3D424D] mt-3 mb-0"></div>
      {/* Additional Notes */}
      <div className="mt-6">
        <p className="text-[15px] font-medium text-white mb-2">
          Additional Notes
        </p>
        <p className="text-[15px] text-text-secondary leading-relaxed wrap-anywhere">
          {values.additionalNotes || "No Additional Notes found!"}
        </p>
      </div>
      <div className="h-px bg-[#3D424D] mt-3"></div>
      {/* Presentation Objectives with Scrollable Container */}
      <div>
        <p className="text-[15px] font-medium text-white mb-3">
          Presentation Objectives
        </p>

        {isLoadingObjectives ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-text-secondary">Loading objectives...</div>
          </div>
        ) : objectives ? (
          <div
            className={`${
              showHeader ? "h-200" : "h-165"
            } overflow-y-auto pr-2 space-y-4 [scrollbar-width:thin]
    [scrollbar-color:#55575B_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#55575B]
    [&::-webkit-scrollbar-thumb]:rounded-lg`}
          >
            <div className="text-[15px] text-text-secondary">
              {isLoadingObjectives ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-text-secondary">
                    Loading objectives...
                  </div>
                </div>
              ) : objectives ? (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 ${
                    showHeader ? "gap-6" : "gap-x-10 ml-2 gap-y-8"
                  }`}
                >
                  {parseObjectives(objectives).map(
                    (item: any, index: number) => (
                      <ObjectiveCard
                        key={index}
                        category={item?.category}
                        objective={item?.objective}
                        bullets={item?.bullets}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="text-[15px] text-text-secondary py-4">
                  No objectives available. Please try again.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[15px] text-text-secondary py-4">
            No objectives available. Please try again.
          </div>
        )}
        <div className="h-px bg-[#3D424D] mt-2 mb-0"></div>
      </div>
    </div>
  );
}
