"use client";

import { getPresentationTypeString } from "@/lib/apiServiceTypes";
import { Clock, Star } from "lucide-react";
import Link from "next/link";

interface PresentationCardProps {
  presentationId?: string;
  title: string;
  presentationType: number;
  duration: number;
  purpose: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function PresentationCard({
  presentationId,
  title,
  presentationType,
  duration,
  purpose,
  isFavorite = false,
  onToggleFavorite,
}: PresentationCardProps) {
  return (
    <div className="relative bg-[#24282E] rounded-xl p-4 md:p-6 border border-[#2E3238] hover:border-[#3A3F46] transition-all">
      {/* Favorite Icon */}
      <button
        className="absolute top-3 md:top-5 right-3 md:right-5 cursor-pointer focus:outline-none"
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

      {/* Title */}
      <Link
        href={`/presentation/${presentationId}`}
        className="focus:outline-none"
      >
        <h3 className="text-[#68AD5C] text-[16px] md:text-xl font-semibold leading-snug mb-2 mr-5 md:mr-8">
          {title}
        </h3>
      </Link>

      {/* presentationType */}
      <p className="text-sm text-[#BBBBBB] mb-3">
        {getPresentationTypeString(presentationType)}
      </p>

      {/* purpose */}
      <p className="text-sm text-white leading-relaxed mb-5">{purpose}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-6 h-6" />
          {duration} minutes
        </div>

        <Link
          href={`/presentation/${presentationId}`}
          className="focus:outline-none"
        >
          <button className="bg-[#3A3F46] text-white text-sm md:text-[16px] h-9 w-28.75 rounded-full transition cursor-pointer focus:outline-none">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
