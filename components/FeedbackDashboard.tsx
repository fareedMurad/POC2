"use client";

import { useState } from "react";
import AiFeedback from "./AiFeedback";
import PeerFeedback from "./PeerFeedback";
import VideoFeedback from "./VideoFeedback";
// import VideoFeedbackPage from "@/components/VideoFeedbackPage";
import { Save, AlertCircle, ArrowLeft } from "lucide-react";

interface FeedbackDashboardProps {
  presentationData: any;
  onBack: () => void;
}

export default function FeedbackDashboard({
  presentationData,
  onBack,
}: FeedbackDashboardProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "peer" | "video">("ai");
  const [showVideoFeedbackPage, setShowVideoFeedbackPage] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message or handle error
    }, 1000);
  };

  // if (showVideoFeedbackPage) {
  //   return (
  //     <VideoFeedbackPage
  //       presentationTitle={presentationData?.title}
  //       onBack={() => setShowVideoFeedbackPage(false)}
  //     />
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#1F1F1F] py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="h-8 w-8" />
                Back to Setup
              </button>
              <h1 className="text-3xl font-bold text-white">
                {presentationData?.title}
              </h1>
              <p className="mt-2 text-slate-400">
                {presentationData?.type} presentation •{" "}
                {presentationData?.duration} min max
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Page"}
            </button>
          </div>

          {serverError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-900/20 p-4 text-[#FF3B3B] border border-red-900/30">
              <AlertCircle className="h-5 w-5" />
              <p>{serverError}</p>
              <button
                className="ml-auto text-sm hover:text-red-300"
                onClick={() => setServerError(null)}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-background-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("ai")}
              className={`pb-4 font-medium transition border-b-2 ${
                activeTab === "ai"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              AI Feedback
            </button>
            <button
              onClick={() => setActiveTab("peer")}
              className={`pb-4 font-medium transition border-b-2 ${
                activeTab === "peer"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Peer Feedback
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`pb-4 font-medium transition border-b-2 ${
                activeTab === "video"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Video Analysis
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="py-6">
          {activeTab === "ai" && <AiFeedback />}
          {activeTab === "peer" && <PeerFeedback />}
          {activeTab === "video" && (
            <div>
              <VideoFeedback presentationTitle={presentationData?.title} />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowVideoFeedbackPage(true)}
                  className="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700"
                >
                  Add Peer Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
