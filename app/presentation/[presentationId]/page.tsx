"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  InfoIcon,
  Loader2,
  X,
} from "lucide-react";
import { PresentationData } from "@/components/PresentationWizard";
import Image from "next/image";
import UploadImg from "@/public/upload-cloud.svg";
import WizardStep3 from "@/components/WizardStep3";
import RehearsalCard from "@/components/RehearsalCard";
import Link from "next/link";
import {
  getPresentation,
  beginRehearsalMediaUpload,
  uploadToPresignedUrl,
  completeRehearsalMediaUpload,
  getPagedRehearsalMediaList,
  getVideoDuration,
  pollAiFeedbackStatus,
  getPresentationTypeString,
  type RehearsalMedia,
  type AiFeedbackRequestStatus,
} from "@/lib/apiServices";
import Header from "@/components/Header";

export default function PresentationPage() {
  const params = useParams();
  const presentationId = params.presentationId as string;

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // State to manage rehearsals list from API
  const [rehearsals, setRehearsals] = useState<RehearsalMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingRehearsals, setIsLoadingRehearsals] = useState(false);
  const rehearsalsListRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [objectives, setObjectives] = useState<string>("");
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(false);
  const [havePresentation, setHavePresentation] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const [presentationTitle, setPresentationTitle] = useState<string>("");
  const [presentationData, setPresentationData] =
    useState<PresentationData | null>(null);

  const [pageKey, setPageKey] = useState<string>("");
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  // Handle when a video starts playing
  const handleVideoPlay = (rehearsalMediaId: string) => {
    setCurrentlyPlayingId(rehearsalMediaId);
  };

  // Page URL for sharing - use presentation-specific URL
  const pageUrl =
    typeof window !== "undefined" && presentationId
      ? `${window.location.origin}/presentation/${presentationId}`
      : typeof window !== "undefined"
      ? window.location.href
      : "https://example.com/presentation";

  // Handle copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    alert("Presentation link copied to clipboard!");
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  // Fetch rehearsals from API
  const fetchRehearsals = async (
    key: string = "",
    direction: "next" | "prev" | "init" = "init"
  ) => {
    if (!presentationId) return;

    setIsLoadingRehearsals(true);

    try {
      const result = await getPagedRehearsalMediaList(presentationId, key);

      const list = result.rehearsalMediaDTOList || [];

      // ✅ Sort only (no slicing)
      const sorted = [...list].sort((a, b) => {
        const dateA = a.uploadDateTime
          ? new Date(a.uploadDateTime).getTime()
          : 0;
        const dateB = b.uploadDateTime
          ? new Date(b.uploadDateTime).getTime()
          : 0;
        return dateB - dateA;
      });

      setRehearsals(sorted);
      setNextPageKey(result.pageKey || null);

      // ✅ HANDLE PAGE HISTORY + PAGE NUMBER
      if (direction === "next") {
        setPageHistory((prev) => [...prev, pageKey]);
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev") {
        setPageHistory((prev) => prev.slice(0, -1));
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else {
        // init case
        setCurrentPage(1);
      }

      setPageKey(key);
    } catch (error) {
      console.error("Error fetching rehearsals:", error);
    } finally {
      setIsLoadingRehearsals(false);
    }
  };

  // Process file - Optimized API implementation with parallel processing
  const processFile = async (file: File) => {
    if (!presentationId) {
      alert("No presentation ID found. Please create a presentation first.");
      return;
    }

    // Validate file type
    const isValidType =
      file.type.startsWith("video/") || file.type.startsWith("audio/");

    if (!isValidType) {
      alert("Please upload a valid video or audio file");
      return;
    }

    // Validate file size (150MB max)
    const maxSize = 150 * 1024 * 1024; // 150MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 150MB");
      return;
    }

    setVideoFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // OPTIMIZATION: Start metadata extraction immediately and in parallel
      console.log("Starting parallel metadata extraction...");
      const metadataPromise = Promise.all([
        getVideoDuration(file),
        (async () => {
          try {
            const { extractVideoThumbnailBlob } = await import(
              "@/lib/apiServices"
            );
            return await extractVideoThumbnailBlob(file);
          } catch (error) {
            console.error("Error extracting thumbnail:", error);
            return null; // Continue without thumbnail
          }
        })(),
      ]);

      // Step 1: Begin upload - get presigned URL
      console.log("Step 1: Beginning upload...");
      const beginResult = await beginRehearsalMediaUpload(presentationId);

      if (!beginResult.presignedFileUrl || !beginResult.fileName) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload video file with progress tracking
      console.log("Step 2: Uploading video to presigned URL...");
      await uploadToPresignedUrl(
        beginResult.presignedFileUrl,
        file,
        (progress) => {
          setUploadProgress(Math.round(progress * 0.8)); // Video upload is 80% of total progress
        }
      );

      // Step 3: Wait for metadata extraction to complete (should be done by now)
      console.log("Step 3: Finalizing metadata...");
      const [duration, thumbnailBlob] = await metadataPromise;
      setUploadProgress(85);

      // Step 4: Upload thumbnail if available
      let thumbnailFileName: string | undefined;
      if (
        thumbnailBlob &&
        beginResult.presignedThumbnailUrl &&
        beginResult.thumbnailFileName
      ) {
        try {
          console.log("Step 4: Uploading thumbnail...");
          const thumbnailFile = new File(
            [thumbnailBlob],
            beginResult.thumbnailFileName,
            {
              type: "image/webp",
            }
          );
          await uploadToPresignedUrl(
            beginResult.presignedThumbnailUrl,
            thumbnailFile
          );

          thumbnailFileName = beginResult.thumbnailFileName;
          console.log("Thumbnail uploaded successfully");
        } catch (thumbnailError) {
          console.error("Error uploading thumbnail:", thumbnailError);
          // Continue without thumbnail - not critical
        }
      }

      setUploadProgress(90);

      // Step 5: Complete the upload
      console.log("Step 5: Completing upload...");
      await completeRehearsalMediaUpload(
        presentationId,
        beginResult.fileName,
        file.size,
        duration,
        thumbnailFileName
      );

      // Set progress to 100%
      setUploadProgress(100);

      console.log("Step 6: Refreshing rehearsals list...");
      // Step 6: Refresh the rehearsals list
      await fetchRehearsals(pageKey, "init");

      // Scroll to top of the list to show newly added video
      setTimeout(() => {
        if (rehearsalsListRef.current) {
          rehearsalsListRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 100);

      // Hide progress bar after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (error: any) {
      console.error("Upload error:", error);
      // alert(error.message || "Upload failed. Please try again.");
      setServerError(error.message || "Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Fetch presentation data from API based on URL parameter
  useEffect(() => {
    const fetchPresentationData = async () => {
      if (!presentationId) return;

      setIsLoadingObjectives(true);
      try {
        const result = await getPresentation(presentationId);
        if (result.presentationDTO) {
          const dto = result.presentationDTO;

          // Set presentation title
          setPresentationTitle(dto.title || "");

          // Set objectives
          setObjectives(dto.objectives || "");

          console.log("dto", dto);

          // Set presentation data for display
          setPresentationData({
            title: dto.title || "",
            type: getPresentationTypeString(dto.presentationType || 0),
            otherType: dto.otherPresentationType,
            duration: dto.maxDuration || 30,
            purpose: dto.purpose || "",
            audience: dto.audience || "Professional",
            additionalNotes: dto.otherDetails || "",
            videoFile: videoFile,
            feedbackPreferences: {
              aiGenerated: true,
              peerFeedback: true,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching presentation:", error);
      } finally {
        setIsLoadingObjectives(false);
      }
    };

    fetchPresentationData();
  }, [presentationId]);

  // Fetch rehearsals list on mount
  useEffect(() => {
    setPageKey("");
    setNextPageKey(null);
    setPageHistory([]);

    fetchRehearsals("", "init");
  }, [presentationId]);

  // Poll for PROCESSING rehearsals every 30 seconds
  useEffect(() => {
    if (!presentationId || rehearsals.length === 0) return;

    // Find all rehearsals with PROCESSING status
    const processingRehearsals = rehearsals.filter(
      (r) => r.aiFeedbackRequestStatus === "PROCESSING"
    );

    if (processingRehearsals.length === 0) return;

    console.log(
      `Found ${processingRehearsals.length} rehearsal(s) with PROCESSING status. Starting polling...`
    );

    // Start polling for each PROCESSING rehearsal
    processingRehearsals.forEach((rehearsal) => {
      if (!rehearsal.rehearsalMediaId) return;

      pollAiFeedbackStatus(
        presentationId,
        rehearsal.rehearsalMediaId,
        (newStatus: AiFeedbackRequestStatus) => {
          console.log(`Poll update for ${rehearsal.title}: ${newStatus}`);

          // Refresh the list when status changes
          if (newStatus !== "PROCESSING") {
            console.log(
              `Status changed to ${newStatus}. Refreshing rehearsals list...`
            );
            fetchRehearsals(pageKey, "init");
          }
        },
        30000 // Poll every 30 seconds
      );
    });

    // Cleanup is handled by the polling function automatically
  }, [rehearsals, presentationId]);

  // Presentation values for display (from API data or default)
  const displayValues: PresentationData = presentationData || {
    title:
      "The science of sleep: How to optimize your rest for better performance",
    type: "Professional",
    otherType: "",
    duration: 30,
    purpose: "",
    audience: "Professional",
    additionalNotes: "",
    videoFile: videoFile,
    feedbackPreferences: {
      aiGenerated: true,
      peerFeedback: true,
    },
  };

  // Handle file upload from input
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Show loading state while presentationId is missing
  if (!presentationId) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">No presentation ID found</p>
          <Link href="/" className="text-[#68AD5C] hover:underline">
            Create a new presentation
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (presentationData === null || presentationData === undefined) {
      setHavePresentation(false);
    } else {
      setHavePresentation(true);
    }
  }, [presentationData]);

  return (
    <div className="min-h-screen bg-[#1F1F1F] pb-10 md:pb-28">
      {serverError && (
        <div className="fixed flex items-center top-40 right-5 w-1/3 p-4 border border-[#FD575B] bg-[#3A3F4A] rounded-lg z-10">
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
      {/* Header */}
      <Header />
      <div className="md:px-12 px-4 ">
        {havePresentation || isLoadingRehearsals ? (
          <div className="max-w-296 mx-auto">
            <h3 className="text-[16px] md:text-[18px] lg:text-[22px] font-semibold text-white text-center my-3 md:my-7 ">
              {presentationTitle}
            </h3>

            {/* Accordion for Presentation Details */}
            <div className="rounded-lg overflow-hidden bg-[#25282E] my-5 ">
              <button
                type="button"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between p-7 text-left hover:bg-[#2D313A] cursor-pointer transition"
              >
                <h3 className="text-[20px] md:text-[22px] font-medium text-white text-start">
                  Presentation Details
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-white transition-transform  ${
                    isAccordionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isAccordionOpen && (
                <div className="p-6 space-y-4">
                  <WizardStep3
                    values={displayValues}
                    showHeader={false}
                    objectives={objectives}
                    isLoadingObjectives={isLoadingObjectives}
                  />
                </div>
              )}
            </div>

            {/* Upload Rehearsal Video */}
            <div className="rounded-lg p-6 transition-colors bg-[#25282E] mb-5">
              <h3 className="text-[20px] md:text-[22px] font-medium text-white mb-4">
                Upload Rehearsal Video
              </h3>
              <div className="relative">
                {/* Progress Border */}
                {isUploading && uploadProgress > 0 && (
                  <div className="absolute inset-0 rounded-lg pointer-events-none z-10">
                    <svg className="w-full h-full">
                      {/* Background border */}
                      <rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        rx="8"
                        fill="none"
                        stroke="#2D313A"
                        strokeWidth="4"
                      />

                      {/* Progress border */}
                      <rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        rx="8"
                        fill="none"
                        stroke="#68AD5C"
                        strokeWidth="4"
                        pathLength={100}
                        strokeDasharray="100"
                        strokeDashoffset={100 - uploadProgress}
                        className="transition-[stroke-dashoffset] duration-300 ease-linear"
                      />
                    </svg>
                    {/* Progress Percentage */}
                    <div className="absolute top-2 right-2 bg-[#68AD5C] text-white px-3 py-1 rounded-md text-sm font-semibold">
                      {uploadProgress}%
                    </div>
                  </div>
                )}

                <div
                  className={`rounded-lg px-6 py-8 md:px-8 md:py-12 text-center transition-all cursor-pointer mb-5 ${
                    isDragging
                      ? "border-2 border-[#68AD5C] bg-[#68AD5C]/10"
                      : "bg-[#2D313A]"
                  } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() =>
                    !isUploading &&
                    document.getElementById("video-upload")?.click()
                  }
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <Image src={UploadImg} alt="upload" />
                    <p className="text-[13px] text-text-secondary py-2">
                      {isUploading
                        ? "Uploading..."
                        : isDragging
                        ? "Drop video file here"
                        : "Drag and drop video file"}
                      <br />
                      (.mp4 only, 150 MB max)
                    </p>
                    <button
                      type="button"
                      disabled={isUploading}
                      className="rounded-md bg-[#68AD5C] px-8 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-70 my-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploading) {
                          document.getElementById("video-upload")?.click();
                        }
                      }}
                    >
                      {isUploading ? "Uploading..." : "Browse"}
                    </button>
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            {/* Uploaded Rehearsals List */}
            {isLoadingRehearsals && (
              <div className="text-center text-white py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#68AD5C]" />
                <p className="mt-2">Loading rehearsals...</p>
              </div>
            )}

            {!isLoadingRehearsals && rehearsals.length > 0 && (
              <>
                <div ref={rehearsalsListRef} className="space-y-4">
                  {rehearsals.map((rehearsal, index) => {
                    // Calculate the actual index in the full sorted list
                    // const actualIndex = (currentPage - 1) * PAGE_SIZE + index;
                    return (
                      <RehearsalCard
                        key={rehearsal.rehearsalMediaId || index}
                        id={index + 1}
                        title={rehearsal.title || `Rehearsal ${index + 1}`}
                        peerFeedbackCount={
                          rehearsal.totalPeerFeedbackReceived || 0
                        }
                        url={`${window.location.origin}/peerfeedback?presentationId=${presentationId}&rehearsalId=${rehearsal.rehearsalMediaId}`}
                        aiFeedbackRequestStatus={
                          rehearsal.aiFeedbackRequestStatus || "NONE"
                        }
                        presentationId={presentationId}
                        rehearsalMediaId={rehearsal.rehearsalMediaId}
                        aiFeedbackRequestId={
                          rehearsal.aiFeedbackRequestId || ""
                        }
                        currentlyPlayingId={currentlyPlayingId}
                        onPlay={handleVideoPlay}
                        onAiFeedbackRequest={fetchRehearsals}
                        onDelete={fetchRehearsals}
                      />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {(nextPageKey || pageHistory.length > 0) && (
                  <div className="flex justify-center items-center gap-6 mt-10">
                    {/* Previous */}
                    <button
                      disabled={pageHistory.length === 0}
                      onClick={() => {
                        const prevKey =
                          pageHistory[pageHistory.length - 1] || "";
                        fetchRehearsals(prevKey, "prev");
                      }}
                      className={`px-2 py-3 font-medium text-[23px] rounded-lg flex items-center ${
                        pageHistory.length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
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
                      disabled={!nextPageKey}
                      onClick={() => {
                        if (nextPageKey) {
                          fetchRehearsals(nextPageKey, "next");
                        }
                      }}
                      className={`px-2 py-3 font-medium text-[23px] rounded-lg flex items-center ${
                        !nextPageKey
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      Next
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLoadingRehearsals && rehearsals.length === 0 && (
              <div className="text-center text-text-secondary py-8">
                No rehearsals uploaded yet. Upload your first rehearsal above!
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center mt-18 md:h-150">
            <div className=" flex justify-center items-center flex-col py-20 w-1/2 mx-auto border rounded-lg">
              <p className="text-center text-[#BBBBBB]">
                Presentation Not Found
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
