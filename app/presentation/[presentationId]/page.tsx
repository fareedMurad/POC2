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
import SlashGreenIcon from "@/public/slash-green.svg";
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
  removeFromPresentationFavorites,
  addToPresentationFavorites,
} from "@/lib/apiServices";
import {
  getPresentationTypeString,
  type RehearsalMedia,
  type AiFeedbackRequestStatus,
} from "@/lib/apiServiceTypes";
import Header from "@/components/Header";
import PresentationSidebar from "@/components/PresentationSidebar";
import RoadMapIcon from "@/public/roadmap.svg";
import ObjectiveCard from "@/components/ObjectiveCard";

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
          isFavorite: dto?.isFavorite || false,
          creationDateTime: dto?.creationDateTime || new Date(),
          otherDetails: dto?.otherDetails || "",
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

  // Fetch presentation data from API based on URL parameter
  useEffect(() => {
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

  const parseObjectives = (objectives: string) => {
    try {
      const parsed = JSON.parse(objectives);

      if (!parsed?.objectives || !Array.isArray(parsed.objectives)) {
        return [];
      }

      return parsed.objectives;
    } catch (err) {
      console.error("Invalid objectives JSON", err);
      return [];
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await removeFromPresentationFavorites(id);
      } else {
        await addToPresentationFavorites(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      fetchPresentationData();
    }
  };

  const supportManualRehearsalUpload =
    process.env.NEXT_PUBLIC_SUPPORT_MANUAL_REHEARSAL_UPLOAD === "true";

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
          <div className="grid grid-cols-12 gap-8 mt-14">
            <div className="col-span-12 md:col-span-4">
              <PresentationSidebar
                title={presentationTitle}
                description={presentationData?.purpose}
                duration={presentationData?.duration}
                type={presentationData?.otherType ?? presentationData?.type}
                audience={presentationData?.audience}
                isFavorite={presentationData?.isFavorite}
                date={presentationData?.creationDateTime}
                otherDetails={presentationData?.otherDetails}
                presentationId={presentationId || ""}
                onToggleFavorite={() =>
                  toggleFavorite(
                    presentationId,
                    presentationData?.isFavorite || false
                  )
                }
              />
            </div>
            <div className="col-span-12 md:col-span-8">
              {supportManualRehearsalUpload && (
                <h3 className="text-[20px] md:text-2xl font-semibold text-white mb-4">
                  Presentation Objectives
                </h3>
              )}

              {/* Accordion for Presentation Details */}
              {supportManualRehearsalUpload && (
                <>
                  <div className="rounded-lg overflow-hidden bg-[#25282E] my-5 focus:outline-none">
                    <button
                      type="button"
                      onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                      className="w-full flex items-center justify-between focus:outline-none px-7 py-4 text-left hover:bg-[#2D313A] cursor-pointer transition"
                    >
                      <div className="flex items-center">
                        <Image
                          className="h-7.5 w-7.5"
                          src={RoadMapIcon}
                          alt="roadmap"
                        />
                        <h3 className="text-lg text-white text-start ml-2">
                          Your presentation roadmap
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-white transition-transform  ${
                          isAccordionOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isAccordionOpen && (
                      <div className="px-6 py-2 space-y-4">
                        {isLoadingObjectives ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-text-secondary">
                              Loading objectives...
                            </div>
                          </div>
                        ) : objectives ? (
                          <div
                            className={`${
                              parseObjectives(objectives)?.length ? "h-165" : ""
                            } overflow-y-auto pr-2 space-y-4 [scrollbar-width:thin]
    [scrollbar-color:#55575B_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#55575B]
    [&::-webkit-scrollbar-thumb]:rounded-lg`}
                          >
                            <div className="text-[15px] text-text-secondary">
                              {isLoadingObjectives ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-text-secondary">
                                    Loading objectives...
                                  </div>
                                </div>
                              ) : parseObjectives(objectives)?.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 ml-2 pb-4 gap-y-8">
                                  {parseObjectives(objectives).map(
                                    (item: any, index: number) => (
                                      <ObjectiveCard
                                        key={index}
                                        category={item?.category}
                                        objective={item?.objective}
                                        bullets={item?.bullets}
                                      />
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-[15px] text-text-secondary py-4 text-center">
                                  No JSON objectives available. Please try
                                  again.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[15px] text-text-secondary py-4">
                            No objectives available. Please try again.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h3 className="text-[20px] md:text-2xl font-semibold text-white mb-4 mt-4">
                    Upload Rehearsal Video
                  </h3>
                </>
              )}

              {/* Upload Rehearsal Video */}
              {supportManualRehearsalUpload && (
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
                      <div className="absolute top-8 right-[50%] bg-[#68AD5C] text-white px-3 py-1 rounded-md text-sm font-semibold">
                        {uploadProgress}%
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-6 py-4 md:px-8 text-center transition-all cursor-pointer mb-5 ${
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
                    <div className="flex justify-between flex-col md:flex-row items-center">
                      <div className="flex items-center">
                        <Image
                          src={UploadImg}
                          alt="upload"
                          className="bg-[#313539] p-1 rounded-full"
                        />
                        <p className="text-lg text-white font-medium py-2 ml-1">
                          {isUploading
                            ? "Uploading..."
                            : isDragging
                            ? "Drop video file here"
                            : "Drag and drop video file"}{" "}
                          <span className="text-[13px] text-[#BBBBBB] font-normal">
                            (.mp4 only, 200 MB max)
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isUploading}
                        className="rounded-md bg-[#68AD5C] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-70 w-38 md:w-41 my-2 cursor-pointer"
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
              )}

              {rehearsals.length > 0 && (
                <h3 className="text-[20px] md:text-2xl font-semibold text-white mb-4 mt-4">
                  Rehearsal Recordings
                </h3>
              )}

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
                          uploadDateTime={rehearsal?.uploadDateTime}
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
                <div className="py-8 bg-[#25282E] h-75 flex justify-center flex-col items-center rounded-lg">
                  <div className="bg-[#1F1F1F] h-16 w-16 rounded-full flex justify-center items-center">
                    <Image
                      src={SlashGreenIcon}
                      className="h-8 w-8"
                      alt="SlashGreenIcon"
                    />
                  </div>
                  <h3 className="text-[20px] md:text-2xl font-semibold text-white my-3">
                    Rehearsal Recordings
                  </h3>
                  <p className="text-[#BBBBBB] text-sm">
                    No Rehearsal Recordings Found
                  </p>
                </div>
              )}
            </div>
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
