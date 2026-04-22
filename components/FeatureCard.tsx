"use client";

import Image from "next/image";
import CheckCircleImg from "@/public/check-circle.svg";

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  footerText?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  footerText,
}: FeatureCardProps) {
  return (
    <div className="bg-[#101317] rounded-2xl p-4 md:px-10 md:pt-10 hover:border-[#2A3441] transition-all">
      <div className="w-13.5 h-13.5 flex items-center justify-center rounded-sm bg-[#1F1F1F] text-orange-500 mb-6">
        <Image src={icon} className="h-7.5 w-7.5" alt={title} />
      </div>
      <h3 className="text-white text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
      <hr className="mt-8" />
      <div className="flex items-center mt-4">
        <Image
          src={CheckCircleImg}
          className="h-5.5 w-5.5"
          alt={"Check Circle"}
        />
        <p className="text-[15px] text-[#68AD5C] ml-4">{footerText}</p>
      </div>
    </div>
  );
}
