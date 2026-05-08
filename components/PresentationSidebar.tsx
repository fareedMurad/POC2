"use client";

import { formatDateTime } from "@/lib/utils";
import { Star, Calendar, Clock, User, Info } from "lucide-react";
import presentationTypeIcon from "@/public/presentType.svg";
import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  description?: string;
  date?: string;
  duration?: number;
  type: string;
  audience?: string;
  isFavorite?: boolean;
  otherDetails?: string;
  presentationId: string;
  from?: string;
  onToggleFavorite?: () => void;
}

export default function PresentationSidebar({
  title,
  description,
  date,
  duration,
  type,
  audience,
  isFavorite = false,
  otherDetails,
  presentationId,
  from,
  onToggleFavorite,
}: Props) {
  return (
    <>
      <div className="bg-[#25282E] rounded-2xl p-6 text-white w-11/12 shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#3A3F47]">
          <h3 className="text-xl font-semibold tracking-wide">
            Presentation Details
          </h3>

          <button
            className="cursor-pointer focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.();
            }}
          >
            <Star
              className={`w-5 h-5 ${
                isFavorite
                  ? "fill-orange-400 text-orange-400"
                  : "text-gray-400 hover:text-white"
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold mt-5 mb-2 leading-snug">
          {title}
        </h4>

        {/* Description */}
        <p className="text-sm text-[#A1A6AF] mb-6 leading-relaxed">
          {description ||
            "A comprehensive review of sales performance for the second quarter, highlighting key achievements, challenges and future strategies."}
        </p>

        {/* Row 1 */}
        <div className="grid grid-cols-12 gap-6 mb-5">
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center text-[#8A8F98] text-sm">
              <Calendar className="w-5 h-5 mr-2" />
              Date
            </div>
            <p className="mt-2 text-white font-medium">
              {formatDateTime(date).split(" - ")[0] || "Jan 13, 2026"}
            </p>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center text-[#8A8F98] text-sm">
              <Clock className="w-5 h-5 mr-2" />
              Duration
            </div>
            <p className="mt-2 text-white font-medium">
              {duration ? `${duration} min` : "43 min"}
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12 gap-6 mb-5">
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center text-[#8A8F98] text-sm">
              <Image
                src={presentationTypeIcon}
                alt="type"
                className="w-5 h-5 mr-2"
              />
              Type
            </div>
            <p className="mt-2 text-white font-medium">{type || "Sales"}</p>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center text-[#8A8F98] text-sm">
              <User className="w-5 h-5 mr-2" />
              Audience
            </div>
            <p className="mt-2 text-white font-medium leading-snug">
              {audience || "Executive Board, Sales Team"}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center text-[#8A8F98] text-sm mb-3">
          <Info className="w-5 h-5 mr-2" />
          Additional Info
        </div>

        <div className="bg-[#2A2F37] rounded-xl p-4 text-sm text-[#A1A6AF] leading-relaxed">
          {otherDetails ||
            "A comprehensive review of sales performance for the second quarter, highlighting key achievements, challenges and future strategies."}
        </div>
      </div>
      {/* CTA */}
      <Link
        href={
          from === "wizard"
            ? `/presentation/${presentationId}`
            : `/presentation/${presentationId}/rehearsal`
        }
      >
        <button className="mt-8 w-11/12 bg-[#6AAE5E] hover:bg-[#5a9c4f] transition py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 text-white text-base">
          {from === "wizard" ? (
            "View Presentation Dashboard"
          ) : (
            <>
              <span className="text-lg">▶</span> Start Rehearsal
            </>
          )}
        </button>
      </Link>
    </>
  );
}
