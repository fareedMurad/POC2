"use client";

import { formatDateTime } from "@/lib/utils";
import { Star, Calendar, Clock, Users, User } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  date?: string;
  duration?: number;
  audience?: string;
  isFavorite?: boolean;
  otherDetails?: string;
  presentationId: string;
  type: string;
  purpose: string;
}

export default function WizardSidebar({
  title,
  description,
  date,
  duration,
  audience,
  isFavorite = false,
  otherDetails,
  presentationId,
  type,
  purpose,
}: Props) {
  return (
    <div className="bg-[#25282E] rounded-xl p-6 text-white w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-2 border-b">
        <h3 className="text-[20px] font-semibold">Presentation Details</h3>
        <Star
          className={`w-5 h-5 ${
            isFavorite
              ? "fill-orange-400 text-orange-400"
              : "text-[#BBBBBB] hover:text-white"
          }`}
        />
      </div>

      {/* Title */}
      <p className="text-[#B4B4B4] text-sm">Title</p>
      <h4 className="text-sm font-medium mb-4">{title || "title"}</h4>

      <div className="flex justify-between items-center mb-4">
        {/* Type */}
        <p className="text-[#B4B4B4] text-sm">
          <p>Type</p>
          <span className="text-white pt-2 inline-block float-end">
            {type || "Other"}
          </span>
        </p>

        {/* Max duration */}
        <p className="text-[#B4B4B4] text-sm">
          <p> Max duration</p>
          <span className="text-white pt-2 inline-block float-end">
            {duration ? `${duration} min` : "43 min"}
          </span>
        </p>
      </div>

      {/* Purpose */}
      <p className="text-[#B4B4B4] text-sm">Purpose</p>
      <h4 className="text-sm font-medium mb-4">{purpose || "Purpose"}</h4>

      {/* Additional Details */}
      <p className="text-[#B4B4B4] text-sm">Additional Details</p>
      <h4 className="text-sm font-medium mb-4">
        {otherDetails || "Other Details"}
      </h4>

      {/* CTA */}
      <Link href={`/presentation/${presentationId}`}>
        <button className="mt-5 w-full bg-[#68AD5C] hover:bg-green-700 transition py-3 rounded-lg font-medium flex items-center justify-center gap-2">
          View Presentation Dashboard
        </button>
      </Link>
    </div>
  );
}
