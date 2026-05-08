"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  InfoIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Loading from "@/public/Loading.svg";
import loaderImg from "@/public/loader.svg";
import flimImg from "@/public/film.svg";
import ExportImg from "@/public/external-link.svg";
import NoContentImg from "@/public/slash.svg";
import Link from "next/link";
import avaterImg from "@/public/avatar.svg";
import avaterImg1 from "@/public/avatar1.svg";
import avaterImg2 from "@/public/avatar2.svg";
import avaterImg3 from "@/public/avatar3.svg";
import CalendarIcon from "@/public/calendar.svg";
import {
  getAiFeedbackRequest,
  getpagedPeerFeedbackList,
  getRehearsalMedia,
  submitAiFeedbackRequest,
  getPresentation,
} from "@/lib/apiServices";
import {
  type AiFeedbackRequest,
  type PeerFeedback,
  type DeliveryAnalysisResult,
} from "@/lib/apiServiceTypes";
import {
  parseDeliveryMetrics,
  getTrianglePositionClass,
  type DeliveryMetrics,
} from "@/lib/deliveryFeedbackUtils";
import Header from "@/components/Header";
import { formatDateTime } from "@/lib/utils";
import ScoreCircle from "@/components/ScoreCircle";
import EvaluationCard from "@/components/EvaluationCard";

function FeedbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presentationId = searchParams.get("presentationId");
  const rehearsalMediaId = searchParams.get("rehearsalMediaId");
  const aiFeedbackRequestId = searchParams.get("aiFeedbackRequestId");
  const rehearsalTitle = searchParams.get("title") || "Rehearsal";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  const [activeAITab, setActiveAITab] = useState<"delivery" | "content">(
    "delivery"
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [aiFeedRequestStatus, setAiFeedRequestStatus] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [peerPageKey, setPeerPageKey] = useState<string>("");
  const [peerNextPageKey, setPeerNextPageKey] = useState<string | null>(null);
  const [peerPageHistory, setPeerPageHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to format time in MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    if (!timeInSeconds) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  const [isMuted, setIsMuted] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState<string>(
    "The science of sleep: How to optimize your rest for better performance"
  );

  // API Data States
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackRequest | null>(null);
  const [peerFeedbackList, setPeerFeedbackList] = useState<PeerFeedback[]>([]);
  const [deliveryMetrics, setDeliveryMetrics] =
    useState<DeliveryMetrics | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingPeer, setIsLoadingPeer] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);
  const [errorPeer, setErrorPeer] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load presentation title from backend
  useEffect(() => {
    const fetchPresentation = async () => {
      if (presentationId) {
        const result = await getPresentation(presentationId);
        setPresentationTitle(result?.presentationDTO?.title || "");
      }
    };
    fetchPresentation();
  }, [presentationId]);

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
          // Set video URL for playback
          setVideoUrl(result.rehearsalMediaDTO.fileUrl || null);
          // Set thumbnail from API
          setVideoThumbnail(result.rehearsalMediaDTO.thumbnailUrl || null);
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };
    fetchVideoData();
  }, [presentationId, rehearsalMediaId]);

  // Fetch rehearsal media to get current status
  const fetchRehearsalStatus = async () => {
    if (!presentationId || !rehearsalMediaId) {
      return;
    }

    try {
      const result = await getRehearsalMedia(presentationId, rehearsalMediaId);

      if (result.rehearsalMediaDTO) {
        const status =
          result.rehearsalMediaDTO.aiFeedbackRequestStatus || "NONE";
        setAiFeedRequestStatus(status);

        // If status is COMPLETED and we have aiFeedbackRequestId, fetch the feedback
        if (status === "COMPLETE" || status === "COMPLETED") {
          const feedbackId = result.rehearsalMediaDTO.aiFeedbackRequestId;
          if (feedbackId) {
            await fetchAIFeedback(feedbackId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching rehearsal status:", error);
    }
  };

  const fetchAIFeedback = async (feedbackId?: string) => {
    const requestId = feedbackId || aiFeedbackRequestId;

    if (!presentationId || !rehearsalMediaId || !requestId) {
      console.log("Missing parameters for AI feedback fetch");
      return;
    }

    setIsLoadingAI(true);
    setErrorAI(null);
    try {
      const result = await getAiFeedbackRequest(
        presentationId,
        rehearsalMediaId,
        requestId
      );

      if (result.aiFeedbackRequestDTO) {
        setAiFeedback(result.aiFeedbackRequestDTO);

        // Parse delivery metrics
        if (result.aiFeedbackRequestDTO.deliveryAnalysisResult) {
          try {
            const deliveryData: DeliveryAnalysisResult = JSON.parse(
              result.aiFeedbackRequestDTO.deliveryAnalysisResult
            );
            const metrics = parseDeliveryMetrics(deliveryData);
            setDeliveryMetrics(metrics);
          } catch (parseError) {
            console.error("Error parsing delivery analysis:", parseError);
          }
        }

        const aiFeedStatus =
          result.aiFeedbackRequestDTO.aiFeedbackRequestStatus;

        if (aiFeedStatus) {
          setAiFeedRequestStatus(aiFeedStatus);
        }
      }
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      setErrorAI("Failed to load AI feedback");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Fetch rehearsal status on mount
  useEffect(() => {
    fetchRehearsalStatus();
  }, [presentationId, rehearsalMediaId]);

  // Poll for PROCESSING status every 30 seconds
  useEffect(() => {
    if (!presentationId || !rehearsalMediaId) return;
    if (aiFeedRequestStatus !== "PROCESSING") return;

    console.log("AI Feedback is PROCESSING. Starting polling...");

    const pollInterval = setInterval(async () => {
      try {
        const result = await getRehearsalMedia(
          presentationId,
          rehearsalMediaId
        );
        const status =
          result.rehearsalMediaDTO?.aiFeedbackRequestStatus || "NONE";

        console.log(`Poll update - Status: ${status}`);
        setAiFeedRequestStatus(status);

        // If status changed from PROCESSING, fetch the feedback
        if (status !== "PROCESSING") {
          console.log(
            `Status changed to ${status}. Stopping poll and fetching feedback...`
          );
          clearInterval(pollInterval);

          if (status === "COMPLETE" || status === "COMPLETED") {
            const feedbackId = result.rehearsalMediaDTO?.aiFeedbackRequestId;
            if (feedbackId) {
              await fetchAIFeedback(feedbackId);
            }
          }
        }
      } catch (error) {
        console.error("Error polling AI feedback status:", error);
      }
    }, 30000); // Poll every 30 seconds

    // Cleanup
    return () => {
      console.log("Stopping AI feedback polling");
      clearInterval(pollInterval);
    };
  }, [aiFeedRequestStatus, presentationId, rehearsalMediaId]);

  // Fetch Peer Feedback
  const fetchPeerFeedback = async (
    key: string = "",
    direction: "next" | "prev" | "init" = "init"
  ) => {
    if (!presentationId || !rehearsalMediaId) return;

    setIsLoadingPeer(true);
    setErrorPeer(null);

    try {
      const result = await getpagedPeerFeedbackList(
        presentationId,
        rehearsalMediaId,
        key
      );

      if (result.peerFeedbackDTOList) {
        setPeerFeedbackList(result.peerFeedbackDTOList);

        // ✅ next page key
        setPeerNextPageKey(result.pageKey || null);

        // ✅ history stack
        if (direction === "next") {
          setPeerPageHistory((prev) => [...prev, peerPageKey]);
          setCurrentPage((prev) => prev + 1);
        } else if (direction === "prev") {
          setPeerPageHistory((prev) => prev.slice(0, -1));
          setCurrentPage((prev) => prev - 1);
        } else {
          setCurrentPage(1);
        }

        // ✅ update current key
        setPeerPageKey(key);
      }
    } catch (error) {
      console.error(error);
      setErrorPeer("Failed to load peer feedback");
    } finally {
      setIsLoadingPeer(false);
    }
  };

  useEffect(() => {
    fetchPeerFeedback("", "init");
  }, [presentationId, rehearsalMediaId]);

  // Fetch rehearsal video from API
  useEffect(() => {
    const fetchRehearsalVideo = async () => {
      if (!presentationId || !rehearsalMediaId) {
        console.log("Missing parameters for fetching rehearsal video");
        return;
      }

      try {
        console.log("Fetching rehearsal media data...");
        const result = await getRehearsalMedia(
          presentationId,
          rehearsalMediaId
        );

        if (result.rehearsalMediaDTO?.fileUrl) {
          console.log("Video URL fetched:", result.rehearsalMediaDTO.fileUrl);
          setVideoUrl(result.rehearsalMediaDTO.fileUrl);
        } else {
          console.log("No video URL found in API response");
        }
      } catch (error) {
        console.error("Error fetching rehearsal video:", error);
      }
    };

    fetchRehearsalVideo();
  }, [presentationId, rehearsalMediaId]);

  const handleBack = () => {
    if (presentationId) {
      router.push(`/presentation/${presentationId}`);
    } else {
      router.push("/");
    }
  };

  // Helper function to convert frames to time format
  const framesToTime = (frames: number, fps: number = 30): string => {
    const totalSeconds = Math.floor(frames / fps);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Helper function to strip markdown characters from text
  const stripMarkdown = (text: string): string => {
    return (
      text
        // Remove headers (###, ##, #)
        .replace(/^#{1,6}\s+/gm, "")
        // Remove bold (**text** or __text__)
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        // Remove italic (*text* or _text_)
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        // Remove strikethrough (~~text~~)
        .replace(/~~(.+?)~~/g, "$1")
        // Remove horizontal rules (---, ***, ___)
        .replace(/^[-*_]{3,}$/gm, "")
        // Remove extra whitespace
        .trim()
    );
  };

  const url = `${window.location.origin}/peerfeedback?presentationId=${presentationId}&rehearsalId=${rehearsalMediaId}`;

  // Format content feedback with proper markdown hierarchy
  // ### (largest) > ** (medium) > - (smallest)
  const formatContentFeedback = (text: string): React.ReactNode => {
    if (!text) return null;

    const lines = text.split("\n");

    const lastLine = lines?.length - 1;

    return (
      <div className="text-white leading-snug">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("####")) {
            const content = trimmed.replace(/^####\s*/, "");
            return (
              <div
                key={index}
                className="text-[18px] font-semibold text-white mt-8 pl-4"
              >
                {content}
              </div>
            );
          }

          // Level 1: Lines starting with ###
          if (trimmed.startsWith("###")) {
            const content = trimmed.replace(/^###\s*/, "");
            return (
              <div
                key={index}
                className="text-[18px] font-semibold text-white mt-8 pl-2"
              >
                {content}
              </div>
            );
          }

          // Level 2: Lines starting with **
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            const content = trimmed.replace(/^\*\*/, "").replace(/\*\*$/, "");
            return (
              <div
                key={index}
                className="text-[16px] font-medium text-white mb-2 mt-3 pl-6"
              >
                {content}
              </div>
            );
          }

          // Level 3: Numeric list (1. 2. 3. ...)
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)/);

            const number = match?.[1];
            let content = match?.[2] || "";

            // Remove ** markers
            content = content.replace(/\*\*/g, "");

            return (
              <div
                key={index}
                className="text-[14px] text-[#BBBBBB] mb-1 flex pl-8"
              >
                <div className="w-4 shrink-0">{number}.</div>
                <div className="grow">{content}</div>
              </div>
            );
          }

          // Level 4: Lines starting with -
          if (trimmed.startsWith("-")) {
            const dashIndex = line.indexOf("-");
            let content = line.substring(dashIndex + 1).trim();
            // Remove all ** markers from the content
            content = content.replace(/\*\*/g, "");
            return (
              <div
                key={index}
                className="text-[14px] text-[#BBBBBB] mb-1 flex pl-10"
              >
                <div className="w-4 flex-shrink-0">-</div>
                <div className="flex-grow">{content}</div>
              </div>
            );
          }
          // Regular text (if any)
          if (trimmed) {
            const content = trimmed.replace(/\*\*/g, "");
            return (
              <div
                key={index}
                className={`${
                  index === 0 || index === lastLine ? "" : "pl-4"
                }  text-[14px] text-[#BBBBBB] mb-1`}
              >
                {content}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const showGetAiFeedbackButton =
    aiFeedRequestStatus === "NONE" || aiFeedRequestStatus === "FAILED";

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

      console.log("Step 2: Fetching updated status...");
      // Step 2: Fetch updated status
      await fetchRehearsalStatus();

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

  const parseContentAnalysis = (data?: string) => {
    try {
      if (!data) return null;

      const parsed = JSON.parse(data);

      return {
        evaluations: Array.isArray(parsed?.evaluations)
          ? parsed.evaluations
          : [],
        overallScore: parsed?.overall_score || null,
        summary: parsed?.summary || "",
        recommendations: parsed?.recommendations || "",
      };
    } catch (err) {
      console.error("Invalid content analysis JSON", err);
      return null;
    }
  };

  const splitBullets = (text?: string) => {
    if (!text || typeof text !== "string") return [];

    return text
      .split("|")
      .map((item) => item.trim())
      .filter((item) => item && item !== "N/A" && item !== "Not applicable");
  };

  const avatars = [avaterImg, avaterImg1, avaterImg2, avaterImg3];

  const parsed = parseContentAnalysis(aiFeedback?.contentAnalysisResult);

  return (
    <main className="min-h-screen bg-[#1F1F1F] px-2">
      {/* Header */}
      <Header />
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
      {/* Content */}
      <div className="max-w-296 mx-auto px-2 py-6">
        {/* Back Button and Title */}
        <div className="flex justify-start py-3 lg:py-5">
          <button
            onClick={handleBack}
            className="text-white hover:text-slate-400 transition flex items-center w-6 md:w-10"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          <h1 className="text-white text-[16px] md:text-[18px] lg:text-[22px] font-medium text-center flex-2  overflow-hidden text-wrap max-w-full">
            {presentationTitle}
          </h1>
        </div>
        <div className="rounded-lg overflow-hidden bg-[#25282E] my-3 md:my-5 p-4 md:p-8">
          {/* Rehearsal Label */}
          <div className="flex items-center gap-2 mb-4">
            <Image
              src={flimImg}
              alt="flimImg"
              className="md:w-8 md:h-8 w-6 h-6"
            />
            <span className="text-white text-lg md:text-2xl font-medium">
              {rehearsalTitle?.split(" ")[0]} #
              {rehearsalTitle?.split(" ")[1] || "1"}
            </span>
          </div>

          {/* Video Player */}
          <div className="relative w-full max-w-4xl mx-auto mb-8 ">
            <div
              className={`${
                videoUrl || videoThumbnail ? "" : "bg-black"
              } relative w-full rounded-lg overflow-hidden h-50 md:h-105 group`}
            >
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover rounded-lg"
                    crossOrigin="anonymous"
                    preload="metadata"
                    playsInline
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) {
                          videoRef.current.pause();
                        } else {
                          videoRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    onLoadStart={() => setIsVideoLoading(false)}
                    onLoadedMetadata={() => {
                      setIsVideoLoading(false);
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                      }
                    }}
                    onCanPlay={() => setIsVideoLoading(false)}
                    onWaiting={() => setIsVideoLoading(true)}
                    onPlaying={() => setIsVideoLoading(false)}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        const currentTimeValue = videoRef.current.currentTime;
                        const durationValue = videoRef.current.duration;
                        const progress =
                          (currentTimeValue / durationValue) * 100;
                        setCurrentTime(currentTimeValue);
                        setProgress(progress);
                      }
                    }}
                    onEnded={() => setIsPlaying(false)}
                    poster={videoThumbnail || undefined}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Loading Indicator */}
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                      <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-[#68AD5C] animate-spin" />
                    </div>
                  )}

                  {/* Play button overlay (shown when paused) */}
                  {!isPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.play();
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <button className="w-16 h-16 md:w-20 md:h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all hover:scale-110">
                        <svg
                          className="w-8 h-8 md:w-10 md:h-10 text-slate-800 ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Custom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-transparent p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      {/* Current Time / Duration Display */}
                      <div className="text-white text-xs md:text-sm font-mono">
                        {formatTime(currentTime)}
                      </div>

                      {/* Play/Pause Button */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                            } else {
                              videoRef.current.play();
                            }
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="text-white hover:text-green-400 transition"
                      >
                        {isPlaying ? (
                          <svg
                            className="w-5 h-5 md:w-6 md:h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 md:w-6 md:h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Progress Bar */}
                      <div
                        className="flex-1 h-1.5 md:h-2 bg-slate-600 rounded-full relative cursor-pointer"
                        onClick={(e) => {
                          if (videoRef.current) {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            videoRef.current.currentTime =
                              pos * videoRef.current.duration;
                          }
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-[#68AD5C] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="text-white text-xs md:text-sm font-mono">
                        {formatTime(duration)}
                      </div>

                      {/* Volume Button */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isMuted) {
                              videoRef.current.muted = false;
                              setIsMuted(false);
                            } else {
                              videoRef.current.muted = true;
                              setIsMuted(true);
                            }
                          }
                        }}
                        className="text-white hover:text-green-400 transition"
                      >
                        {isMuted ? (
                          <svg
                            className="w-5 h-5 md:w-6 md:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 md:w-6 md:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            } else {
                              videoRef.current.requestFullscreen();
                            }
                          }
                        }}
                        className="text-white hover:text-green-400 transition"
                      >
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-lg">
                        No video uploaded for this rehearsal
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden bg-[#25282E] my-3 p-4 md:my-5 md:p-8">
          {/* AI Feedback Section */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 md:mb-6 mb-3">
              <MessageSquare className="w-5 h-5 text-white" />
              <h2 className="text-white text-[20px] md:text-[22px] font-medium">
                AI Feedback
              </h2>
            </div>

            {/* AI Feedback Tabs */}
            <div className="flex justify-center mb-6 md:mb-10 bg-[#3A3F4A] text-slate-300 hover:bg-[#454A55 rounded-full  md:max-w-94 max-w-full  h-14 mx-auto w-65 md:w-94 ">
              <button
                onClick={() => setActiveAITab("delivery")}
                className={`px-3 md:px-14 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                  activeAITab === "delivery"
                    ? "bg-[#68AD5C] text-white"
                    : "bg-[#3A3F4A] text-slate-300"
                }`}
              >
                Delivery Style
              </button>
              <button
                onClick={() => setActiveAITab("content")}
                className={`px-3 md:px-6 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                  activeAITab === "content"
                    ? "bg-[#68AD5C] text-white"
                    : "bg-[#3A3F4A] text-slate-300"
                }`}
              >
                Content Feedback
              </button>
            </div>
            {activeAITab == "delivery" ? (
              <>
                {isLoadingAI ? (
                  <div className="flex justify-center items-center py-12 flex-col">
                    <Image
                      src={Loading}
                      alt="Loading"
                      className="md:w-23 md:h-23 w-40 h-12.5 animate-spin"
                    />
                    <p className="text-[14px] font-medium mt-2.5">Loading</p>
                  </div>
                ) : aiFeedRequestStatus === "PROCESSING" ? (
                  <div className="flex justify-center items-center py-12">
                    <Image
                      src={loaderImg}
                      alt="loader"
                      className="w-4 h-4 animate-spin"
                    />
                    <p className="text-[16px] font-medium ml-1 text-slate-400">
                      Processing AI Feedback for this rehearsal video
                    </p>
                  </div>
                ) : errorAI ? (
                  <div className="text-center py-12 text-[#FF3B3B]">
                    {errorAI}
                  </div>
                ) : deliveryMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Pace */}
                    {deliveryMetrics.pace && (
                      <div className="bg-[#2D313A] rounded-lg p-4">
                        <h3 className="text-slate-300 text-lg md:text-xl font-medium mb-3">
                          Pace
                        </h3>
                        <div className="relative h-8 bg-[#25282E] rounded-sm mb-4">
                          <div className="flex justify-around items-center h-full">
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">Slow</p>
                            </div>
                            <div className="h-8 bg-[#2D313A] w-1.5 md:w-3"></div>
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">
                                Moderate
                              </p>
                            </div>
                            <div className="h-8 bg-[#2D313A] w-1.5 md:w-3"></div>
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">Fast</p>
                            </div>
                          </div>
                          <div
                            className={`absolute ${getTrianglePositionClass(
                              deliveryMetrics.pace.position
                            )} -bottom-8 -translate-x-1/2 -translate-y-1/2`}
                          >
                            <div className="border-10 md:border-14 border-transparent border-b-white"></div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                          {deliveryMetrics.pace.value.toFixed(0)} WPM
                        </p>
                      </div>
                    )}

                    {/* Filler Words */}
                    {deliveryMetrics.fillerWords && (
                      <div className="bg-[#2D313A] rounded-lg p-4">
                        <h3 className="text-slate-300 text-lg md:text-xl font-medium mb-3">
                          Filler Words
                        </h3>

                        <div className="relative">
                          {/* Hover trigger */}
                          <p className="peer text-[#FF8C42] text-lg md:text-2xl font-semibold cursor-pointer">
                            {deliveryMetrics.fillerWords.totalCount} Fillers
                          </p>

                          {/* Tooltip */}
                          {deliveryMetrics.fillerWords.breakdown &&
                            Object.keys(deliveryMetrics.fillerWords.breakdown)
                              .length > 0 && (
                              <div
                                className="
                    absolute top-full left-0 mt-3
                    bg-[#181818] w-4/12 rounded-[12px] p-3
                    opacity-0 invisible
                    peer-hover:opacity-100 peer-hover:visible
                    transition-opacity duration-200
                    pointer-events-none z-10
                  "
                              >
                                {Object.entries(
                                  deliveryMetrics.fillerWords.breakdown
                                )
                                  .sort(([, a], [, b]) => b - a)
                                  .map(([word, count]) => (
                                    <div
                                      key={word}
                                      className="flex justify-between items-center py-1"
                                    >
                                      <span className="text-white capitalize text-sm">
                                        {word}:
                                      </span>
                                      <span className="text-slate-300 text-sm font-medium">
                                        {count}
                                      </span>
                                    </div>
                                  ))}

                                {/* Arrow */}
                                <div className="absolute -top-4 left-8 -translate-x-1/2">
                                  <div className="border-l-6 border-r-6 border-b-12 md:border-l-8 md:border-r-8 md:border-b-16 border-transparent border-b-[#181818]" />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Confidence */}
                    {deliveryMetrics.confidence && (
                      <div className="bg-[#2D313A] rounded-lg p-4">
                        <h3 className="text-slate-300 text-lg md:text-xl font-medium mb-3">
                          Confidence
                        </h3>
                        <div className="relative h-8 bg-[#25282E] rounded-sm mb-4">
                          <div className="flex justify-around items-center h-full">
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">Low</p>
                            </div>
                            <div className="h-8 bg-[#2D313A] w-1.5 md:w-3"></div>
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">
                                Moderate
                              </p>
                            </div>
                            <div className="h-8 bg-[#2D313A] w-1.5 md:w-3"></div>
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">High</p>
                            </div>
                          </div>
                          <div
                            className={`absolute ${getTrianglePositionClass(
                              deliveryMetrics.confidence.position
                            )} -bottom-8 -translate-x-1/2 -translate-y-1/2`}
                          >
                            <div className="border-10 md:border-14 border-transparent border-b-white"></div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                          Score: {deliveryMetrics.confidence.value.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Energy */}
                    {deliveryMetrics.energy && (
                      <div className="bg-[#2D313A] rounded-lg p-4">
                        <h3 className="text-slate-300 text-lg md:text-xl font-medium mb-3">
                          Energy
                        </h3>
                        <div className="relative h-8 bg-[#25282E] rounded-sm mb-4">
                          <div className="flex justify-around items-center h-full">
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">Low</p>
                            </div>
                            <div className="h-8 bg-[#2D313A] w-1.5 md:w-3"></div>
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">
                                Moderate
                              </p>
                            </div>
                            <div className="h-8 bg-[#2D313A] w-1.5 md:w-3"></div>
                            <div className="flex-1 flex items-center justify-center h-full">
                              <p className="text-[16px] font-medium">High</p>
                            </div>
                          </div>
                          <div
                            className={`absolute ${getTrianglePositionClass(
                              deliveryMetrics.energy.position
                            )} -bottom-8 -translate-x-1/2 -translate-y-1/2`}
                          >
                            <div className="border-10 md:border-14 border-transparent border-b-white"></div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                          Score: {deliveryMetrics.energy.value.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 text-white bg-[#2D313A] rounded-lg p-4 overflow-hidden py-12 flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center text-[16px] text-slate-400">
                      <Image
                        src={NoContentImg}
                        alt="slash"
                        className="mr-1"
                        width={20}
                        height={20}
                      />{" "}
                      No delivery feedback available
                    </div>
                    {showGetAiFeedbackButton && (
                      <button
                        onClick={handleGetAiFeedback}
                        disabled={isRequesting}
                        className="px-6 py-2.5 bg-[#68AD5C] hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRequesting ? "Requesting..." : "Get AI Feedback"}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6 text-white rounded-lg p-4 overflow-hidden">
                {aiFeedRequestStatus === "PROCESSING" ? (
                  <div className="flex justify-center items-center py-12">
                    <Image
                      src={loaderImg}
                      alt="loader"
                      className="w-4 h-4 animate-spin"
                    />
                    <p className="text-[16px] font-medium ml-1 text-slate-400">
                      Processing AI Feedback for this rehearsal video
                    </p>
                  </div>
                ) : isLoadingAI ? (
                  <div className="flex justify-center items-center py-12 flex-col">
                    <Image
                      src={Loading}
                      alt="Loading"
                      className="md:w-23 md:h-23 w-40 h-12.5 animate-spin"
                    />
                    <p className="text-[14px] font-medium mt-2.5">Loading</p>
                  </div>
                ) : errorAI ? (
                  <div className="text-center py-12 text-[#FF3B3B]">
                    {errorAI}
                  </div>
                ) : aiFeedback?.contentAnalysisResult ? (
                  <div className="max-h-239.75 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {parsed ? (
                      <div className="space-y-6">
                        {/* Top Section */}
                        <div className="bg-[#2D313A] rounded-lg p-8 grid grid-cols-12 gap-6 mb-8">
                          {/* Score */}
                          <div className="col-span-12 md:col-span-4">
                            <ScoreCircle score={parsed.overallScore} />
                          </div>

                          {/* Summary + Recommendations */}
                          <div className="col-span-12 md:col-span-8 px-4">
                            {parsed.summary && (
                              <>
                                <h3 className="text-white text-lg font-medium mb-2">
                                  Executive Summary
                                </h3>
                                <p className="text-[#BBBBBB] text-[16px] mb-4">
                                  {parsed.summary}
                                </p>
                              </>
                            )}

                            <div className="border-b w-1/3 mt-8 mb-6" />
                            {parsed.recommendations && (
                              <>
                                <h3 className="text-white text-lg font-medium mb-2">
                                  Key Recommendations
                                </h3>
                                <ul className="space-y-1">
                                  {splitBullets(parsed.recommendations).map(
                                    (rec: string, i: number) => {
                                      const formattedRec =
                                        rec.charAt(0).toUpperCase() +
                                        rec.slice(1);

                                      return (
                                        <li
                                          key={i}
                                          className="text-[#BBBBBB] text-[16px] flex py-1"
                                        >
                                          <span className="w-2 h-2 bg-[#68AD5C] rounded-full mt-2 mr-2"></span>
                                          {formattedRec}
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Evaluations Grid */}
                        {parsed.evaluations.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 rounded-lg">
                            {parsed.evaluations.map(
                              (item: any, index: number) => (
                                <EvaluationCard key={index} item={item} />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        No structured content feedback available
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center text-[16px] text-slate-400 mb-6">
                      <Image
                        src={NoContentImg}
                        alt="slash"
                        className="mr-1"
                        width={20}
                        height={20}
                      />{" "}
                      No content feedback available
                    </div>
                    {showGetAiFeedbackButton && (
                      <button
                        onClick={handleGetAiFeedback}
                        disabled={isRequesting}
                        className="px-6 py-2.5 bg-[#68AD5C] hover:bg-green-700 text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRequesting ? "Requesting..." : "Get AI Feedback"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden bg-[#25282E] my-3 p-4 md:my-5 md:p-10">
          {/* Peer Feedback Section */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Users className="w-6 h-5 text-white" />
              <h2 className="text-white text-[20px] md:text-[22px] font-medium">
                Peer Feedback
              </h2>
            </div>

            {isLoadingPeer ? (
              <div className="flex justify-center items-center py-12 flex-col">
                <Image
                  src={Loading}
                  alt="Loading"
                  className="md:w-23 md:h-23 w-40 h-12.5 animate-spin"
                />
                <p className="text-[14px] font-medium mt-2.5">Loading</p>
              </div>
            ) : errorPeer ? (
              <div className="text-center py-12 text-[#FF3B3B]">
                {errorPeer}
              </div>
            ) : peerFeedbackList.length > 0 ? (
              <div className="space-y-4">
                {peerFeedbackList.map((feedbackDTO, index) => (
                  <div
                    key={index}
                    className="bg-[#2D313A] rounded-lg p-4 relative"
                  >
                    <div className="flex items-start gap-3 md:flex-row flex-col">
                      <Image
                        src={avatars[index % avatars.length]}
                        alt={`User ${index + 1}`}
                        className="w-10 h-10 md:w-16 md:h-16"
                      />
                      <div className="flex-1">
                        {feedbackDTO.peerFeedbackSegments &&
                          feedbackDTO.peerFeedbackSegments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {feedbackDTO.peerFeedbackSegments.map(
                                (segment, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-full ${
                                      idx !==
                                      feedbackDTO?.peerFeedbackSegments
                                        ?.length -
                                        1
                                        ? "border-b"
                                        : ""
                                    }`}
                                  >
                                    <div className="text-[#BBBBBB] md:mb-2 font-medium text-[16px]">
                                      {framesToTime(segment.startingFrame)} -{" "}
                                      {framesToTime(segment.endingFrame)}
                                    </div>

                                    <p className="text-[#BBBBBB] text-[16px] font-normal mb-2 md:mb-3">
                                      {segment.feedback}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                      <Image
                        src={CalendarIcon}
                        alt="calender"
                        className="w-5 h-5 absolute right-45 top-6"
                      />
                      <p className="text-sm text-[#BBBBBB] absolute right-5 top-6">
                        {formatDateTime(feedbackDTO.creationDateTime || "")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 text-white bg-[#2D313A] rounded-lg py-10 overflow-hidden">
                <div className="flex justify-center items-center text-[16px] text-slate-400">
                  <Image
                    src={NoContentImg}
                    alt="slash"
                    className="mr-1"
                    width={20}
                    height={20}
                  />{" "}
                  No peer feedback available yet
                </div>
                <Link
                  href={url}
                  target="_blank"
                  className="flex justify-center items-center mx-auto mt-6 text-sm cursor-pointer"
                >
                  <p>Share link to peer feedback form</p>
                  <Image
                    src={ExportImg}
                    alt="external link"
                    className="ml-1"
                    width={20}
                    height={20}
                  />
                </Link>
              </div>
            )}
          </div>
          {(peerNextPageKey || peerPageHistory.length > 0) && (
            <div className="flex justify-center items-center gap-6 mt-8">
              {/* Previous */}
              <button
                disabled={peerPageHistory.length === 0}
                onClick={() => {
                  const prevKey =
                    peerPageHistory[peerPageHistory.length - 1] || "";
                  fetchPeerFeedback(prevKey, "prev");
                }}
                className={`transition flex font-medium text-[23px] items-center px-2 py-3 rounded-lg ${
                  peerPageHistory.length === 0
                    ? "text-[#BBBBBB] cursor-not-allowed"
                    : "text-white cursor-pointer"
                }`}
              >
                <ChevronLeft />
                Prev
              </button>

              <div className="px-8 py-1.5 text-white border border-[#3F3F3F] font-medium text-[23px] rounded-lg">
                {currentPage}
              </div>

              {/* Next */}
              <button
                disabled={!peerNextPageKey}
                onClick={() => {
                  if (peerNextPageKey) {
                    fetchPeerFeedback(peerNextPageKey, "next");
                  }
                }}
                className={`px-2 py-3 font-medium text-[23px] rounded-lg transition flex items-center ${
                  !peerNextPageKey
                    ? "text-[#BBBBBB] cursor-not-allowed"
                    : "text-white cursor-pointer"
                }`}
              >
                Next <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <FeedbackPageContent />
    </Suspense>
  );
}
