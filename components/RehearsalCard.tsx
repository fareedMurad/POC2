"use client";

import {
  Calendar,
  Clock,
  Copy,
  Eye,
  InfoIcon,
  Loader2,
  Trash2Icon,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  submitAiFeedbackRequest,
  getRehearsalMedia,
  deleteRehearsalMedia,
  type AiFeedbackRequestStatus,
} from "@/lib/apiServices";
import { useState, useEffect, useRef } from "react";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import AIIcon from "@/public/AI-icon.svg";

interface RehearsalCardProps {
  id: number;
  title: string;
  peerFeedbackCount: number;
  url?: string;
  aiFeedbackRequestStatus?: AiFeedbackRequestStatus;
  onAiFeedbackRequest?: () => void;
  onDelete?: () => void;
  uploadDateTime?: any;
  presentationId?: string;
  rehearsalMediaId?: string;
  aiFeedbackRequestId?: string;
  currentlyPlayingId?: string | null;
  onPlay?: (rehearsalMediaId: string) => void;
}

export default function RehearsalCard({
  id,
  title,
  url,
  aiFeedbackRequestStatus = "NONE",
  onAiFeedbackRequest,
  onDelete,
  uploadDateTime,
  presentationId,
  rehearsalMediaId,
  aiFeedbackRequestId,
  currentlyPlayingId,
  onPlay,
}: RehearsalCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch video URL and thumbnail from API
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!presentationId || !rehearsalMediaId) return;

      try {
        // Fetch rehearsal media to get video URL and thumbnail
        const result = await getRehearsalMedia(
          presentationId,
          rehearsalMediaId
        );

        if (result.rehearsalMediaDTO) {
          setVideoUrl(result.rehearsalMediaDTO.fileUrl || null);
          setThumbnailUrl(result.rehearsalMediaDTO.thumbnailUrl || null);
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();
  }, [presentationId, rehearsalMediaId]);

  // Handle when another video starts playing
  useEffect(() => {
    if (currentlyPlayingId && currentlyPlayingId !== rehearsalMediaId) {
      // Another video is playing, pause this one
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentlyPlayingId, rehearsalMediaId, isPlaying]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (!videoRef.current || !rehearsalMediaId) return;

    if (isPlaying) {
      // Pause this video
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play this video and notify parent
      videoRef.current.play();
      setIsPlaying(true);
      if (onPlay) {
        onPlay(rehearsalMediaId);
      }
    }
  };

  // Debug: Log the status to see what we're receiving
  console.log(`Rehearsal ${title} status:`, aiFeedbackRequestStatus);

  const handleCopyUrl = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      alert("Peer feedback link copied to clipboard!");
    }
  };

  // Handle Get AI Feedback button click
  const handleGetAiFeedback = async () => {
    if (!presentationId || !rehearsalMediaId) {
      alert("Missing presentation or rehearsal information");
      return;
    }

    setIsRequesting(true);
    try {
      console.log("Step 1: Calling SubmitAiFeedbackRequest API...");
      // Step 1: Call SubmitAiFeedbackRequest API
      const submitResult = await submitAiFeedbackRequest(
        presentationId,
        rehearsalMediaId
      );
      console.log("SubmitAiFeedbackRequest result:", submitResult);

      console.log("Step 2: Calling GetRehearsalMedia API...");
      // Step 2: Call GetRehearsalMedia API to get updated status
      const mediaResult = await getRehearsalMedia(
        presentationId,
        rehearsalMediaId
      );
      console.log("GetRehearsalMedia result:", mediaResult);

      console.log("Step 3: Refreshing rehearsals list...");
      // Step 3: Notify parent component to refresh the list
      if (onAiFeedbackRequest) {
        onAiFeedbackRequest();
      }

      console.log("AI Feedback request completed successfully!");
    } catch (error) {
      console.error("Error requesting AI feedback:", error);
      setServerError(
        error?.message ?? "Failed to request AI feedback. Please try again."
      );
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle Delete button click
  const handleDelete = async () => {
    if (!presentationId || !rehearsalMediaId) {
      alert("Missing presentation or rehearsal information");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Deleting rehearsal media...");
      await deleteRehearsalMedia(presentationId, rehearsalMediaId);
      console.log("Rehearsal deleted successfully!");

      // Notify parent component to refresh the list
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting rehearsal:", error);
      alert("Failed to delete rehearsal. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Business Logic: Show "Get AI Feedback" button when status is NONE or FAILED
  // NONE = user has never requested AI feedback
  // FAILED = previous request failed, allow retry
  const showGetAiFeedbackButton =
    aiFeedbackRequestStatus === "NONE" || aiFeedbackRequestStatus === "FAILED";

  return (
    <div className="border border-[#3A3F4A] rounded-lg p-4 bg-[#2A2F3A] flex lg:flex-row flex-col gap-6 relative">
      {serverError && (
        <div className="fixed flex items-center top-28 right-5 w-1/3 p-4 border border-[#FD575B] bg-[#3A3F4A] rounded-lg z-10">
          <InfoIcon className="w-14 h-14 text-[#FD575B]" />
          <p className="text-[15px] text-[#FD575B] float-end ml-4">
            {serverError}
          </p>
          <X
            className="w-12 h-12 ml-8 cursor-pointer"
            onClick={() => setServerError("")}
          />
        </div>
      )}
      {/* Right Side - Status and Actions */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Video Player  */}
        <div className="shrink-0 w-full md:w-auto">
          <div
            className={`
                        relative w-full md:w-48 h-30 rounded-lg overflow-hidden ${
                          videoUrl || thumbnailUrl ? "" : "bg-slate-800"
                        }`}
          >
            {/* Video Element */}
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover rounded-lg"
                crossOrigin="anonymous"
                preload="metadata"
                playsInline
                onLoadStart={() => setIsVideoLoading(false)}
                onCanPlay={() => setIsVideoLoading(false)}
                onWaiting={() => setIsVideoLoading(true)}
                onPlaying={() => setIsVideoLoading(false)}
                onEnded={() => setIsPlaying(false)}
                poster={thumbnailUrl || undefined}
              />
            ) : thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : null}

            {/* Video Loading Indicator */}
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-[#68AD5C] animate-spin" />
              </div>
            )}

            {/* Play/Pause Button Overlay */}
            {!isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                onClick={handlePlayPause}
              >
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <svg
                    className="w-full h-full text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Click overlay to pause when playing */}
            {isPlaying && (
              <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={handlePlayPause}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Status and Actions */}
      <div className="flex flex-col">
        <div className="flex flex-col">
          {/* Title + Feedback */}
          <div className="max-w-[calc(100%-1.5rem)]">
            <h4 className="text-[20px] font-semibold text-white mb-0.5 drop-shadow-lg truncate">
              {title?.split(" ")[0]} #{title?.split(" ")[1] || "1"}
            </h4>
            <p className="text-[12px] md:text-[14px] text-[#BBBBBB] drop-shadow-lg truncate flex items-center mt-2">
              <Calendar className="h-6 w-6 mr-2" />
              {formatDateTime(uploadDateTime).split(" - ")[0]}{" "}
              <Clock className="h-6 w-6 ml-6 mr-2" />
              {formatDateTime(uploadDateTime).split(" - ")[1]}
            </p>
            {/* Status Indicator at Top Right - Based on aiFeedbackRequestStatus */}
            <div className="absolute top-5 right-5 lg:mb-8 mb-4">
              {/* PROCESSING Status */}
              {aiFeedbackRequestStatus === "PROCESSING" && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#3A4556] rounded-full ">
                  <Loader2 className="w-5 h-5 text-[#0088FF] animate-spin" />
                  <span className="text-[14px] text-[#0088FF] font-medium">
                    Processing AI Feedback
                  </span>
                </div>
              )}

              {/* COMPLETE Status */}
              {aiFeedbackRequestStatus === "COMPLETE" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#68AD5C]/20 border border-[#68AD5C]/30 rounded-full">
                  <svg
                    className="w-4 h-4 text-[#68AD5C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-[13px] text-[#34C759] font-medium">
                    AI Feedback Completed
                  </span>
                </div>
              )}

              {/* FAILED Status */}
              {aiFeedbackRequestStatus === "FAILED" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
                  <svg
                    className="w-4 h-4 text-[#FF3B3B]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-[13px] text-[#FF3B3B] font-medium">
                    AI Feedback process failed. Try again
                  </span>
                </div>
              )}

              {/* NONE Status - No display needed */}
            </div>
          </div>

          {/* Action Buttons and URL Section */}
          <div className="mt-4 space-y-3">
            {/* Action Buttons */}
            <div className="flex md:flex-row items-start flex-col md:justify-end md:items-center gap-4">
              <Link
                href={`/feedback?presentationId=${presentationId}&rehearsalMediaId=${rehearsalMediaId}&aiFeedbackRequestId=${
                  aiFeedbackRequestId || ""
                }&title=${encodeURIComponent(title)}&id=${id}`}
                className="flex items-center px-4 py-2.5 bg-[#68AD5C] hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors"
              >
                <Eye className="h-[15.86] w-4.75 mr-2" />
                View Feedback
              </Link>
              <div className="relative group">
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center px-4 py-2.5 bg-[#68AD5C] hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors"
                >
                  <User className="h-[15.86] w-[15.86] mr-2" />
                  Get Peer Feedback
                </button>
                {/* URL Popup on Hover */}
                {url && (
                  <div className="absolute top-13 left-0 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-[#2A2F3A] border border-[#3A3F4A] rounded-md shadow-lg p-2 min-w-75">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-slate-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <input
                          type="text"
                          readOnly
                          value={url}
                          className="flex-1 bg-transparent text-[12px] text-slate-300 outline-none border-none"
                        />
                        <button
                          onClick={handleCopyUrl}
                          className="p-1.5 bg-[#68AD5C] hover:bg-green-700 rounded text-white transition-colors pointer-events-auto"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Arrow */}
                      <div className="absolute bottom-full right-1 -translate-x-1/2 -mt-px">
                        <div className="border-8 border-transparent border-b-[#3A3F4A]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Show Get AI Feedback button only if status is NONE or FAILED */}
              {showGetAiFeedbackButton && (
                <button
                  onClick={handleGetAiFeedback}
                  disabled={isRequesting}
                  className="flex items-center px-4 py-2.5 bg-[#68AD5C] hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src={AIIcon}
                    alt="ai-icon"
                    className="h-4 w-4.5 mr-2"
                  />
                  {isRequesting ? "Requesting..." : "Get AI Feedback"}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-41 px-4 py-2.5 bg-[#68AD5C] hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2Icon className="h-[15.86] w-[15.86]" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>

            {/* URL Field below buttons (only for processing status) */}
            {/* {status === "processing" && url && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-[#3A3F4A] border border-[#4A4F5A] rounded-md px-3 py-2 max-w-md">
                    <svg
                      className="w-4 h-4 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <input
                      type="text"
                      readOnly
                      value={url}
                      className="flex-1 bg-transparent text-[13px] text-slate-300 outline-none border-none"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="p-1.5 bg-[#4A7C59] hover:bg-[#5A8C69] rounded text-white transition-colors flex-shrink-0"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )} */}
          </div>
        </div>
        {serverError && (
          <div className="flex items-center p-2 border border-[#FD575B] bg-[#3A3F4A] rounded-lg mt-4">
            <InfoIcon className="w-6 h-6 text-[#FD575B]" />
            <p className="text-[14px] text-[#FD575B]  ml-4">
              {serverError ||
                "You've reached your monthly limit of 10 Video Uploads. To upload more rehearsals this month, contact support at help@praktice.com"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
