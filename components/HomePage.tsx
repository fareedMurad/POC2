"use client";

import Image from "next/image";
import FeatureCard from "@/components/FeatureCard";
import HeroImg from "@/public/hero-img.png";
import AirPlayIcon from "@/public/airplay.svg";
import TargetIcon from "@/public/target.svg";
import RepeatIcon from "@/public/repeat.svg";
import { getAppInstallation } from "@/lib/apiServices";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import HomeHeader from "./HomeHeader";

export default function HomePage() {
  const router = useRouter();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // helper to read cookie
  const getCookieToken = () => {
    const match = document.cookie.match(/authToken=([^;]+)/);
    return match ? match[1] : null;
  };

  // detect authToken on page load
  useEffect(() => {
    const localToken = localStorage.getItem("authToken");
    const cookieToken = getCookieToken();

    const token = localToken || cookieToken;

    if (token) {
      setAuthToken(token);
    }
  }, []);

  const handleAppInstallation = async () => {
    const localToken = localStorage.getItem("authToken");
    const cookieToken = getCookieToken();
    const token = localToken || cookieToken;

    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");

    // 🚀 First-time visitor
    if (!token && !hasVisitedBefore) {
      router.push("/register");
      return;
    }

    // 🚀 Returning user but logged out
    if (!token && hasVisitedBefore) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const result = await getAppInstallation();

      if (result?.operationSuccessful) {
        router.push("/home");
      } else {
        localStorage.removeItem("authToken");
        document.cookie =
          "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <HomeHeader authToken={authToken} />
      <div className="min-h-screen bg-linear-to-br from-[#1A1A1A] to-[#1F1F1F] text-white px-6 py-4 md:px-24 md:py-7">
        <div className="grid grid-cols-12 gap-10 lg:gap-5 items-center justify-center mb-28 mt-12">
          {/* Left Content */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-5 px-10 md:px-auto">
            <h1 className="main-title">
              Practice Like It’s <br className="break-line" />
              the <span className="text-[#f3812e]">Real Thing.</span>
            </h1>

            <p className="hero-para text-[#BBBBBB] text-lg md:text-[22px] leading-relaxed mb-8 max-w-xl">
              Praktice puts you in a photorealistic replica of your actual venue
              - so when the moment arrives, you’re already ready.
            </p>

            <button
              className="bg-[#68AD5C] hover:bg-green-600 transition h-11 w-44 pl-1.5 rounded-lg font-medium flex justify-center items-center cursor-pointer focus:outline-none"
              disabled={isLoading}
              onClick={handleAppInstallation}
            >
              {isLoading ? "Loading..." : `Start Practicing`}
              {!isLoading && <ChevronRight className="text-sm px-0 mx-0" />}
            </button>
          </div>

          {/* Right Image */}
          <div
            id="hero-img"
            className="relative w-full mx-auto h-115 text-lg rounded-2xl overflow-hidden col-span-12 lg:col-span-6 xl:col-span-7"
          >
            <Image
              src={HeroImg}
              alt="Presentation"
              fill
              className="object-fill"
              priority
            />
          </div>
        </div>

        {/* FEATURES TITLE */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-5xl lg:text-5xl font-bold">
            Perform with Unshakable Confidence
          </h2>
          <p className="text-[#BBBBBB] text-lg md:text-xl text-center leading-relaxed mt-4">
            Stop practicing in front of mirrors. Step into the arena before the
            lights go up.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={AirPlayIcon}
            title="Practice in the Room Before you’re in the Room"
            description="The biggest confidence killer isn’t lack of preparation -  it’s the gap between where you practiced and where you perform. Praktice let’s you rehearse inside a photorealistic replica of your actual venue."
            footerText="More reps in the right environment = less anxiety, stronger delivery."
          />

          <FeatureCard
            icon={TargetIcon}
            title="Get coached every time you practice -  Not just After"
            description="Meaningful feedback usually arrives after the moment has passed. Praktice brings coaching into the rehearsal phase, with structured peer and AI feedback on delivery, pacing, vocal variety and content."
            footerText="Fix it before you take the stage - not after"
          />

          <FeatureCard
            icon={RepeatIcon}
            title="More Reps, Less Friction - On Your Schedule"
            description="Growth in public speaking comes from repetition. But coordinating with others is hard. Praktice removes the friction from solo practice -  no audience, no partner, no perfectly scheduled time required."
            footerText="Get quality reps in between meetings, whenever you need."
          />
        </div>
      </div>
    </div>
  );
}
