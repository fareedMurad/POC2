"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import {
  getAppInstallation,
  getUserActivityLimits,
  getUserActivityStats,
} from "@/lib/apiServices";
import Link from "next/link";
import { ProfileCard } from "@/components/profileCard";
import PresentaionIcon from "@/public/presentations.svg";
import VideoUploadsIcon from "@/public/video-uploads.svg";
import AIFeedbackIcon from "@/public/ai-feedback.svg";
import ChroneIcon from "@/public/chrone.svg";
import RoomsUploadIcon from "@/public/rooms-upload.svg";
import DecksIcon from "@/public/deck-upoads.svg";
import { Clock } from "lucide-react";

interface userLimitsProps {
  DeckUploads: number;
  PresentationCreations: number;
  RehearsalMediaAiAnalysis: number;
  RoomUploads: number;
  VideoUploads: number;
}

interface userStatsProps {
  errorCode: null;
  errorMessage: null;
  firstDayOfNextMonth: string;
  mtD_AudioRecordingUploads: number;
  mtD_AudioRecordings: number;
  mtD_PanoPhotoUploads: number;
  mtD_PresentationCreations: number;
  mtD_RehearsalAiAnalysis: number;
  mtD_Rehearsals: number;
  mtD_SlideDeckUploads: number;
  mtD_VideoRecordingUploads: number;
  mtD_VideoRecordings: number;
  operationSuccessful: true;
  ytD_AudioRecordingUploads: number;
  ytD_AudioRecordings: number;
  ytD_PanoPhotoUploads: number;
  ytD_PresentationCreations: number;
  ytD_RehearsalAiAnalysis: number;
  ytD_Rehearsals: number;
  ytD_SlideDeckUploads: number;
  ytD_VideoRecordingUploads: number;
  ytD_VideoRecordings: number;
}

/* -------------------- Page -------------------- */
export default function ProfilePage() {
  const [profile, setProfile] = useState({
    accountType: 0,
    name: "",
    email: "",
    password: "",
  });

  const [userLimits, setUserLimits] = useState<userLimitsProps>();
  const [userStats, setUserStats] = useState<userStatsProps>();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const token = localStorage.getItem("authToken");
  const fetchAppInstallation = async () => {
    try {
      const result = await getAppInstallation();
      const userStats = await getUserActivityStats();
      const userLimits = await getUserActivityLimits();

      setUserLimits(userLimits?.userActivityLimits);
      setUserStats(userStats);

      const app = result?.appInstallation;

      if (app) {
        setProfile({
          accountType: app.accountType ?? 0,
          name: app.name ?? "",
          email: app.email ?? "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) fetchAppInstallation();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Header />

      <div className="flex flex-1 items-center justify-center flex-col px-3 md:px-4 py-5 md:py-10">
        <div className="flex justify-between items-center w-full max-w-3xl bg-[#25282E] rounded-xl px-4 md:px-8 py-8 mb-8">
          <div className="flex items-end">
            <div className="mr-3">
              <h3 className="text-xl font-semibold">{profile?.name}</h3>
              <p className="text-[16px]">{profile?.email}</p>
            </div>
            <p className="text-[14px] font-medium bg-[#3F3F3F] px-4 h-7 flex justify-center items-center text-center rounded-full">
              {profile?.accountType === 0
                ? "Basic Plan"
                : profile?.accountType === 1
                ? "Standard Plan"
                : "Premium Plan"}
            </p>
          </div>
          <Link href={"/editprofile"}>
            <button
              type="button"
              className="w-21.25 h-8.75 rounded-md bg-[#68AD5C] cursor-pointer hover:bg-[#008236] text-white text-lg font-medium disabled:opacity-60 focus:outline-none"
            >
              Edit
            </button>
          </Link>
        </div>
        <div className="w-full max-w-3xl bg-[#25282E] rounded-xl">
          <div className="flex justify-between items-center border-b px-4 md:px-8 pt-8 pb-2">
            <h1 className="text-white text-2xl font-semibold text-center mb-6">
              This Month
            </h1>
            <button
              type="button"
              className="w-39 h-8.75 flex justify-center items-center rounded-md border border-[#68AD5C] text-[#68AD5C] hover:bg-[#68AD5C] hover:text-white text-[16px] font-medium disabled:opacity-60 focus:outline-none"
            >
              <Clock className="w-4.25 h-4.25 mr-2" />
              Resets {userStats?.firstDayOfNextMonth}
            </button>
          </div>
          <div className="px-4 md:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileCard
                value={userStats?.mtD_PresentationCreations || 0}
                total={userLimits?.PresentationCreations || 0}
                title="Presentations"
                icon={PresentaionIcon}
              />
              <ProfileCard
                value={userStats?.mtD_VideoRecordingUploads || 0}
                total={userLimits?.VideoUploads || 0}
                title="Video Uploads"
                icon={VideoUploadsIcon}
              />
              <ProfileCard
                value={userStats?.mtD_RehearsalAiAnalysis || 0}
                total={userLimits?.RehearsalMediaAiAnalysis || 0}
                title="AI Feedback"
                icon={AIFeedbackIcon}
              />
              <ProfileCard
                value={userStats?.mtD_PanoPhotoUploads || 0}
                total={userLimits?.RoomUploads || 0}
                title="Room Uploads"
                icon={RoomsUploadIcon}
              />
              <ProfileCard
                value={userStats?.mtD_SlideDeckUploads || 0}
                total={userLimits?.DeckUploads || 0}
                title="Slide Deck Uploads"
                icon={DecksIcon}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center w-full max-w-3xl bg-[#25282E] rounded-xl px-4 md:px-8 py-8 mt-8">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <div className="bg-[#1A1D23] w-14 h-14 rounded-full flex justify-center items-center">
                <Image src={ChroneIcon} alt="chrone" />
              </div>
              <div className="ml-2">
                <p className="text-lg font-semibold">
                  Unlock Higher Monthly LImits
                </p>
                <p className="text-sm">
                  {`You're on the ${
                    profile?.accountType === 0
                      ? "Basic Plan"
                      : profile?.accountType === 1
                      ? "Standard Plan"
                      : "Premium Plan"
                  }. Upgrade to increase your monthly limits.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-25.5 h-8.75 rounded-md bg-[#68AD5C] cursor-pointer hover:bg-[#008236] text-white text-lg font-medium disabled:opacity-60 focus:outline-none"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-xl bg-[#1F242B] rounded-2xl p-8 text-center shadow-lg">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-white hover:text-white text-xl"
            >
              ✕
            </button>

            <div className="flex justify-center mb-6">
              <div className="bg-[#1A1D23] w-14 h-14 rounded-full flex justify-center items-center">
                <Image src={ChroneIcon} alt="chrone" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-3">
              Upgrade Account
            </h2>

            <p className="text-gray-300 text-lg">
              Contact{" "}
              <a
                href="mailto:help@praktice.com"
                className="text-white underline"
              >
                help@praktice.com
              </a>{" "}
              to upgrade your account
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
