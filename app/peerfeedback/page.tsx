"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";
import AddFeedbackForm from "@/components/AddFeedbackForm";
import Image from "next/image";
import flimImg from "@/public/film.svg";
import { useSearchParams } from "next/navigation";
import {
  savePeerFeedback,
  type PeerFeedbackSegment,
  getRehearsalMediaAnonymously,
} from "@/lib/apiServices";
import Logo from "@/public/logo.svg";
import Link from "next/link";

interface Feedback {
  id: string;
  startTime: string;
  endTime: string;
  feedback: string;
  category?: string;
}

function VideoFeedbackPageContent() {
  const searchParams = useSearchParams();
  const rehearsalId = searchParams.get("rehearsalId") || searchParams.get("id"); // Support both formats
  const presentationId = searchParams.get("presentationId");
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loadedVideoUrl, setLoadedVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(3600); // Default 60 minutes
  const [showAddFeedback, setShowAddFeedback] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState<string>("");
  const [rehearsalTitle, setRehearsalTitle] = useState<string>();
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const fetchRehearsalData = async () => {
      if (!presentationId || !rehearsalId) return;

      try {
        console.log("Fetching rehearsal media...");
        const result = await getRehearsalMediaAnonymously(
          presentationId,
          rehearsalId
        );

        const media = result.rehearsalMediaDTO;
        if (!media) return;

        // Title
        if (media.title) {
          setRehearsalTitle(media.title);
        }
        if (result?.presentationTitle) {
          setPresentationTitle(result?.presentationTitle);
        }

        const duration = result.rehearsalMediaDTO?.duration;
        if (!duration) return;

        setVideoDuration(duration);

        // Video URL
        if (media.fileUrl) {
          setLoadedVideoUrl(media.fileUrl);
        }

        // Set thumbnail from API
        setVideoThumbnail(media.thumbnailUrl || null);
      } catch (error) {
        console.error("Error fetching rehearsal media:", error);
        setServerError(error?.message || "Something went wrong");
      }
    };

    fetchRehearsalData();
  }, [presentationId, rehearsalId]);

  // DO NOT fetch existing peer feedback - each user should start with a clean slate
  // This prevents showing other people's feedback when sharing the same link

  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [originalFeedbackList, setOriginalFeedbackList] = useState<Feedback[]>(
    []
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAddFeedback = (values: {
    startTime: string;
    endTime: string;
    feedback: string;
  }) => {
    if (editingFeedback) {
      // Update existing feedback - preserve the original ID
      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === editingFeedback.id
            ? {
                ...item,
                startTime: values.startTime,
                endTime: values.endTime,
                feedback: values.feedback,
              }
            : item
        )
      );
      setEditingFeedback(null);
    } else {
      // Add new feedback
      const newFeedback: Feedback = {
        id: `new-${Date.now()}`,
        startTime: values.startTime,
        endTime: values.endTime,
        feedback: values.feedback,
        category: "Informative", // Default category
      };
      setFeedbackList((prev) => [...prev, newFeedback]);
    }
    setShowAddFeedback(false);
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setShowAddFeedback(true);
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedbackList((prev) => prev.filter((item) => item.id !== id));
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

  // Convert time string (MM:SS) to frames (assuming 30 FPS)
  const timeToFrames = (timeStr: string, fps: number = 30): number => {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;
    return Math.floor(totalSeconds * fps);
  };

  // Check if feedback has been modified
  const hasChanges = () => {
    if (feedbackList.length !== originalFeedbackList.length) {
      return true;
    }

    // Compare each feedback item
    for (let i = 0; i < feedbackList.length; i++) {
      const current = feedbackList[i];
      const original = originalFeedbackList.find(
        (item) =>
          item.startTime === current.startTime &&
          item.endTime === current.endTime
      );

      if (!original || original.feedback !== current.feedback) {
        return true;
      }
    }

    return false;
  };

  // Handle saving feedback to the backend
  const handleSaveFeedback = async () => {
    if (!presentationId || !rehearsalId) {
      setServerError("Missing presentation or rehearsal information");
      // Auto-clear error after 10 seconds
      setTimeout(() => setServerError(null), 10000);
      return;
    }

    if (feedbackList.length === 0) {
      setServerError("No feedback to save");
      // Auto-clear error after 10 seconds
      setTimeout(() => setServerError(null), 10000);
      return;
    }

    // Check if there are any changes
    if (!hasChanges()) {
      setServerError(
        "No changes detected. Feedback already exists with no updates."
      );
      // Auto-clear error after 10 seconds
      setTimeout(() => setServerError(null), 10000);
      return;
    }

    setIsSaving(true);
    setServerError(null);
    setSaveSuccess(false);

    try {
      // Convert new feedback to API format
      const newSegments: PeerFeedbackSegment[] = feedbackList.map(
        (feedback, index) => ({
          segmentIndex: index,
          startingFrame: timeToFrames(feedback.startTime),
          endingFrame: timeToFrames(feedback.endTime),
          feedback: feedback.feedback,
        })
      );

      // Merge existing and new segments
      const allSegments = [...newSegments];

      // Call the API with combined feedback
      await savePeerFeedback(presentationId, rehearsalId, allSegments);

      // Clear the feedback list immediately
      setFeedbackList([]);

      // Show success message
      setSaveSuccess(true);

      // Clear success message after 10 seconds
      // setTimeout(() => {
      //   setSaveSuccess(false);
      // }, 10000);
    } catch (error) {
      console.error("Error saving peer feedback:", error);
      setServerError(
        error instanceof Error
          ? error.message
          : "Failed to save feedback. Please try again."
      );
      // Auto-clear API error after 10 seconds
      setTimeout(() => setServerError(null), 10000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] pb-8 md:pb-25 ">
      {/* Header - No navigation */}
      <header className="border-b border-background-border bg-background-default px-6 py-4 md:px-12 md:pt-7 flex items-center justify-between">
        <Link href="/" className="focus:outline-none">
          <Image
            src={Logo}
            alt="Logo"
            className="w-40 h-12 md:w-47.5 md:h-13.75"
            priority
          />
        </Link>
        <div>
          <Link href={"/register"} className="focus:outline-none">
            <button className="h-10 w-43 rounded-md border border-[#68AD5C] text-[16px] font-medium transition cursor-pointer text-[#68AD5C] ml-6 hover:bg-[#68AD5C] hover:text-white focus:outline-none">
              Try Praktice Free
            </button>
          </Link>
          <Link href={"/login"} className="focus:outline-none">
            <button className="ml-4 h-10 rounded-md border px-4 bg-[#68AD5C] text-[16px] font-medium text-white hover:bg-[#008236] focus:outline-none">
              Log in
            </button>
          </Link>
        </div>
      </header>
      {serverError ? (
        <div className="flex justify-center items-center mt-18 md:h-150">
          <div className=" flex justify-center items-center flex-col py-20 w-1/2 mx-auto border rounded-lg">
            <p className="text-center text-[#BBBBBB]">{serverError}</p>
          </div>
        </div>
      ) : (
        <div className="max-w-296 mx-auto py-3 md:py-6 px-4 ">
          {/* Title */}
          <div className="flex justify-start lg:py-5 px-2">
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
            <div className="relative w-full max-w-4xl mx-auto mb-8">
              <div
                className={`${
                  loadedVideoUrl || videoThumbnail ? "" : "bg-black"
                } relative w-full rounded-lg overflow-hidden h-50 md:h-105 group`}
              >
                {loadedVideoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={loadedVideoUrl}
                      className="w-full h-full object-cover rounded-lg"
                      crossOrigin="anonymous"
                      preload="auto"
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
                      }}
                      onCanPlay={() => setIsVideoLoading(false)}
                      onWaiting={() => setIsVideoLoading(true)}
                      onPlaying={() => setIsVideoLoading(false)}
                      onTimeUpdate={() => {
                        if (!videoRef.current) return;
                        const c = videoRef.current.currentTime;
                        const d = videoRef.current.duration;
                        setCurrentTime(c);
                        setProgress((c / d) * 100);
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
                    <div className="absolute bottom-0 left-0 right-0 bg-[#2D2D2D]/30 p-3">
                      <div className="flex items-center gap-3 md:gap-4">
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
                        <span className="text-xs text-slate-300">
                          {formatTime(currentTime)}
                        </span>

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
                        <span className="text-xs text-slate-300 text-right">
                          {formatTime(videoDuration)}
                        </span>

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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-lg">
                        No video uploaded for this rehearsal
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Feedback Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Feedback Form */}
            <div className="rounded-lg bg-[#24282e] px-6 pt-6 pb-1 border border-background-border h-105">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingFeedback ? "Edit Feedback" : "Add Feedback"}
              </h2>

              {serverError ? (
                <div className="mb6 flex items-center gap-2 rounded-lg bg-red-900/20 p-4 text-[#FF3B3B] border border-red-900/30">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{serverError}</p>
                  <button
                    className="ml-auto text-sm hover:text-red-300"
                    onClick={() => setServerError(null)}
                  >
                    ×
                  </button>
                </div>
              ) : null}

              <AddFeedbackForm
                onSubmit={handleAddFeedback}
                isEditing={!!editingFeedback}
                setEditingFeedback={setEditingFeedback}
                maxDuration={videoDuration}
                initialValues={
                  editingFeedback
                    ? {
                        startTime: editingFeedback.startTime,
                        endTime: editingFeedback.endTime,
                        feedback: editingFeedback.feedback,
                      }
                    : undefined
                }
              />
            </div>

            {/* Feedback List */}
            <div className="rounded-lg bg-[#24282e] px-6 pb-3 pt-6 border border-background-border relative">
              {/* Large Loading Spinner Overlay */}
              {isSaving && (
                <div className="absolute inset-0 bg-[#24282e]/95 rounded-lg flex flex-col items-center justify-center z-50">
                  <Loader2 className="h-16 w-16 animate-spin text-[#68AD5C]" />
                  <p className="mt-4 text-white text-lg font-medium">
                    Saving your feedback...
                  </p>
                  <p className="mt-2 text-text-secondary text-sm">
                    Please wait
                  </p>
                </div>
              )}

              <h2 className="text-xl font-semibold text-white mb-6">
                Feedback
              </h2>

              {/* Success Message in Right Box */}
              {saveSuccess && feedbackList.length === 0 && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-900/20 p-4 text-green-400 border border-green-900/30">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-sm">Feedback saved successfully!</p>
                </div>
              )}

              {isLoadingFeedback ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 text-[#68AD5C] animate-spin" />
                </div>
              ) : saveSuccess && feedbackList.length === 0 ? (
                <div
                  className={`${
                    saveSuccess ? "md:h-[80%]" : "md:h-full"
                  } text-center text-slate-400 w-full`}
                >
                  <span className="flex items-center bg-[#2D313A] md:h-[80%] py-2 md:py-4 rounded-lg justify-center w-full text-slate-400">
                    Saved Feedback
                  </span>
                </div>
              ) : feedbackList.length === 0 ? (
                <div
                  className={`${
                    saveSuccess ? "md:h-[80%]" : "md:h-full"
                  } text-center text-slate-400 w-full`}
                >
                  <span className="flex items-center bg-[#2D313A] md:h-[80%] py-2 md:py-4 rounded-lg justify-center w-full text-slate-400">
                    No feedback added yet
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackList.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="rounded-lg bg-[#24282e] p-4 border border-slate-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[16px] text-[#BBBBBB] bg-[#24282e] px-2 py-1 rounded">
                          {feedback.startTime} - {feedback.endTime}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFeedback(feedback)}
                            className="text-[#BBBBBB] hover:text-white transition"
                          >
                            <Edit className="h-4 w-4 text-[#68AD5C]" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="text-[#BBBBBB] hover:text-[#FF3B3B] transition"
                          >
                            <Trash2 className="h-4 w-4 text-[#68AD5C]" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[16px] text-[#BBBBBB]">
                        {feedback.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {feedbackList.length > 0 && (
                <div className="mt-6 justify-end flex ">
                  <button
                    onClick={handleSaveFeedback}
                    disabled={isSaving}
                    className="w-auto rounded-md bg-[#68AD5C] px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Feedback"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <VideoFeedbackPageContent />
    </Suspense>
  );
}
