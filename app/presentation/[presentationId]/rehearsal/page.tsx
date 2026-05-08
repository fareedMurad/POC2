"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Upload, ImageIcon, Check, LibraryBig } from "lucide-react";
import {
  addToPresentationFavorites,
  CreateMobilePanoUploadRequest,
  GetMobilePanoUploadRequest,
  getPresentation,
  getUserPanoRoomPhoto,
  removeFromPresentationFavorites,
  getRoomLibraryFilters,
  filterRoomLibraryPaginated,
  uploadUserSlideDeck,
} from "@/lib/apiServices";
import {
  getPresentationTypeString,
  PresentationData,
} from "@/lib/apiServiceTypes";
import { OptionCard } from "@/components/OptionCard";
import QRCodeModal from "@/components/QRCodeModal";
import DecksIcon from "@/public/decks.svg";
import RoomsModal from "@/components/RoomsModal";
import RoomsLibraryModal from "@/components/RoomsLibraryModal";
import DecksModal from "@/components/DecksModal";
import FaceTracking from "@/components/FaceTracking";
import PresentationSidebar from "@/components/PresentationSidebar";
import { useRef } from "react";

interface Room {
  id: string;
  name: string;
  fileUrl?: string;
  image?: string;
  isLive?: boolean;
  isFavorite?: boolean;
}

interface Deck {
  id: string;
  name: string;
  pages?: string;
  image: string;
  isLive?: boolean;
}
type RoomSelectionType = "upload" | "myRooms" | "library" | null;

type deckSelectionType = "upload" | "decks" | null;

export default function RehearsalSetupPage() {
  const params = useParams();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const presentationId = params.presentationId as string;
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [presentationData, setPresentationData] =
    useState<PresentationData | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [slidesToggle, setSlidesToggle] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSlidesFile, setSelectedSlidesFile] = useState<File | null>(
    null
  );

  const [uploadedDeckThumbnail, setUploadedDeckThumbnail] = useState<
    string | null
  >(null);

  const [slideUploadError, setSlideUploadError] = useState<string | null>(null);

  const [isUploadingSlides, setIsUploadingSlides] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<deckSelectionType>(null);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [roomIsFavorite, setRoomIsFavorite] = useState(false);
  const [isRoomsLibraryModalOpen, setIsRoomsLibraryModalOpen] = useState(false);
  const [isDecksModalOpen, setIsDecksModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedMobileRoom, setSelectedMobileRoom] = useState<string | null>(
    null
  );
  const [selectedRoomLibrary, setSelectedLibraryRoom] = useState<Room | null>(
    null
  );
  const [selectedDecks, setSelectedDecks] = useState<Deck | null>(null);
  const [roomSelection, setRoomSelection] = useState<RoomSelectionType>(null);
  const [slideDuration, setSlideDuration] = useState(3);
  const [roomsId, setRoomsId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [uploadedRoomId, setUploadedRoomId] = useState<string | null>(null);
  const [mobilePanoUploadRequestId, setMobilePanoUploadRequestId] = useState<
    string | null
  >(null);
  const [roomPhoto, setRoomPhoto] = useState<string | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const steps = ["Pick Room", "Pick Slides", "Head Tracking", "Voice Controls"];

  const fetchPresentationData = async () => {
    if (!presentationId) return;

    // setIsLoadingObjectives(true);
    try {
      const result = await getPresentation(presentationId);
      if (result.presentationDTO) {
        const dto = result.presentationDTO;

        // Set presentation data for display
        setPresentationData({
          title: dto.title || "",
          type: getPresentationTypeString(dto.presentationType || 0),
          otherType: dto.otherPresentationType,
          duration: dto.maxDuration || 30,
          purpose: dto.purpose || "",
          audience: dto.audience || "Professional",
          additionalNotes: dto.otherDetails || "",
          objectives: dto.objectives,
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
      // setIsLoadingObjectives(false);
    }
  };

  // Fetch presentation data from API based on URL parameter
  useEffect(() => {
    fetchPresentationData();
  }, [presentationId]);

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
    else router.push("/rehearsalspace");
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleRoomSelection = (type: RoomSelectionType) => {
    setRoomSelection(type);

    // reset others
    setSelectedImage(null);
    setSelectedRoom(null);
    setSelectedLibraryRoom(null);
  };

  const handleSelectedDeck = (type: deckSelectionType) => {
    setSelectedDeck(type);
  };

  const increment = () => {
    setSlideDuration((prev) => prev + 1);
  };

  const decrement = () => {
    setSlideDuration((prev) => (prev > 1 ? prev - 1 : 1)); // prevent 0 or negative
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

  const handleRoomFavoriteToggle = (roomId: string) => {
    setRoomsId(roomId);
    setRoomIsFavorite(!roomIsFavorite);
  };

  const handleUploadFromDevice = async (presentationId: string) => {
    try {
      const result = await CreateMobilePanoUploadRequest(presentationId);

      if (result.operationSuccessful) {
        const requestId =
          result?.mobilePanoUploadRequestDTO?.mobilePanoUploadRequestId;

        setMobilePanoUploadRequestId(requestId);

        const authToken = localStorage.getItem("authToken") || "";

        // ✅ Step 2: Build URL

        const uploadUrl = `192.168.1.27:3000/uploadRoomPhoto/${presentationId}/${requestId}?token=${authToken}`;

        console.log("uploadUrl", uploadUrl);

        setQrUrl(uploadUrl);

        // ✅ Step 4: Open modal
        setIsQrModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserPanoRoomPhoto = async (presentationId: string, id: string) => {
    try {
      setIsPhotoLoading(true);

      const result = await getUserPanoRoomPhoto(presentationId, id);

      // adjust field name depending on API response
      const photoUrl =
        result?.userPanoRoomPhotoDTO?.photoUrl ||
        result?.userPanoRoomPhotoDTO?.fileUrl;

      setRoomPhoto(photoUrl || null);
    } catch (err) {
      console.error("Failed to fetch room photo", err);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    if (!mobilePanoUploadRequestId || !isQrModalOpen || !presentationId) return;

    stopPolling(); // ensure no duplicate intervals

    pollingRef.current = setInterval(async () => {
      try {
        const result = await GetMobilePanoUploadRequest(
          presentationId,
          mobilePanoUploadRequestId
        );

        const data = result?.mobilePanoUploadRequestDTO;

        if (data?.userPanoRoomPhotoId) {
          const roomId = data.userPanoRoomPhotoId;

          setUploadedRoomId(roomId);

          stopPolling();
          // setIsQrModalOpen(false);

          // 🔥 STEP 2: fetch image immediately
          const result = await fetchUserPanoRoomPhoto(presentationId, roomId);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => stopPolling(); // cleanup on unmount / deps change
  }, [presentationId, mobilePanoUploadRequestId, isQrModalOpen]);

  const generateSHA256 = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleSlideDeckUpload = async (file: File) => {
    try {
      setSlideUploadError(null);
      setIsUploadingSlides(true);

      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      // Generate SHA256 hash
      const fileHash = await generateSHA256(file);

      // Upload API
      const result = await uploadUserSlideDeck(
        presentationId,
        fileHash as any,
        file,
        authToken || ""
      );

      // Save selected file
      setSelectedSlidesFile(file);

      // Thumbnail from API response
      const thumbnail =
        result?.userSlideDeckDTO?.slides[0].fileUrl ||
        result?.userSlideDeckDTO?.fileName;

      if (thumbnail) {
        setUploadedDeckThumbnail(thumbnail);
      }
    } catch (error: any) {
      console.error(error);

      setSlideUploadError(error?.message || "Failed to upload slide deck.");
    } finally {
      setIsUploadingSlides(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] pb-10">
      <Header />

      <div className="px-4 md:px-10 mt-10 grid grid-cols-12 gap-8">
        {/* LEFT SIDEBAR */}
        <div className="col-span-12 md:col-span-4">
          <div className="max-w-150 w-full mx-auto">
            <PresentationSidebar
              title={presentationData?.title || ""}
              description={presentationData?.purpose}
              duration={presentationData?.duration}
              audience={presentationData?.audience}
              isFavorite={presentationData?.isFavorite}
              date={presentationData?.creationDateTime}
              otherDetails={presentationData?.otherDetails}
              presentationId={presentationId || ""}
              from="wizard"
              type={""}
              onToggleFavorite={() =>
                toggleFavorite(
                  presentationId,
                  presentationData?.isFavorite || false
                )
              }
            />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-span-12 md:col-span-8">
          {/* ================= STEPPER ================= */}
          <div className="flex items-center justify-end mb-10 max-w-150 w-full mx-auto">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div
                  key={step}
                  className="flex-1 flex flex-col items-center relative"
                >
                  {/* Line */}
                  {index !== steps.length - 1 && (
                    <div
                      className={`absolute top-5 md:top-7 left-1/2 w-[58%] ml-8 h-px    ${
                        isCompleted ? "bg-[#68AD5C]" : "bg-[#3F3F3F]"
                      }  opacity-85 z-0`}
                    ></div>
                  )}

                  {/* Circle */}
                  <div
                    className={`w-10 md:w-12.75 h-10 md:h-12.75 rounded-full flex items-center text-xl font-semibold justify-center z-10
                    ${
                      isActive
                        ? "bg-[#68AD5C] text-white"
                        : isCompleted
                        ? "bg-[#68AD5C] text-white"
                        : "bg-[#2D313A] text-white"
                    }`}
                  >
                    {isCompleted ? <Check size={32} /> : stepNumber}
                  </div>

                  {/* Label */}
                  <span className="text-xs md:text-[15px] font-medium mt-2 text-white">
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ================= STEP CONTENT ================= */}
          <div className="bg-[#25282E] p-6 rounded-xl max-w-150 w-full mx-auto">
            {currentStep === 1 && (
              <>
                <h2 className="text-white text-xl md:text-2xl font-semibold mb-6">
                  Step 1: Pick Room
                </h2>

                <div className="space-y-4">
                  <OptionCard
                    icon={<Upload />}
                    title="Upload From Device"
                    isSelected={roomSelection === "upload"}
                    description="Upload a panoramic photo of your presentation room"
                    selectedImage={selectedMobileRoom}
                    onImageSelect={() => {
                      const img = "library-image-url"; // your logic
                      setSelectedImage(img);
                    }}
                    onClick={() => {
                      handleUploadFromDevice(presentationId);
                      handleRoomSelection("upload");
                    }}
                  />

                  <OptionCard
                    icon={<ImageIcon />}
                    title="Pick From My Rooms"
                    selectedImage={selectedRoom?.fileUrl}
                    selectedRoom={selectedRoom}
                    description="Choose a previously uploaded room"
                    // isUpload={true}
                    onImageSelect={() => {
                      const img = "room-image-url"; // your logic
                      setSelectedImage(img);
                    }}
                    // inputType="image"
                    isSelected={roomSelection === "myRooms"}
                    onClick={() => {
                      handleRoomSelection("myRooms");
                      setIsRoomsModalOpen(true);
                    }}
                  />

                  <OptionCard
                    icon={<LibraryBig />}
                    title="Pick From Room Library"
                    isSelected={roomSelection === "library"}
                    description="Choose from a curated set of rooms"
                    onImageSelect={() => {
                      const img = "library-image-url"; // your logic
                      setSelectedImage(img);
                    }}
                    selectedImage={selectedRoomLibrary?.image}
                    selectedRoom={selectedRoomLibrary}
                    onClick={() => {
                      handleRoomSelection("library");
                      setIsRoomsLibraryModalOpen(true);
                    }}
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-white text-xl md:text-2xl font-semibold mb-6">
                  Step 2: Pick Slides
                </h2>
                <div className="flex items-center my-4">
                  <div className="flex items-center">
                    <p className="text-xl font-semibold ml-4">Use Slides</p>
                  </div>
                  <div
                    className={`${
                      slidesToggle ? "bg-[#68AD5C]" : "bg-[#4F575D]"
                    } w-8 h-4.25 rounded-full relative cursor-pointer ml-2`}
                    onClick={() => setSlidesToggle(!slidesToggle)}
                  >
                    <div
                      className={`bg-[#25282E] w-4 h-4 rounded-full absolute top-[0.5px] ${
                        slidesToggle ? "right-px" : "left-px"
                      }`}
                    ></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <OptionCard
                    icon={<Upload />}
                    title="Upload From Device"
                    isSelected={selectedDeck === "upload"}
                    description="Upload a slide deck from your computer"
                    isUpload={true}
                    inputType="file"
                    isUploading={isUploadingSlides}
                    uploadErrorMessage={slideUploadError}
                    selectedImage={uploadedDeckThumbnail}
                    onInputClick={() => {
                      handleSelectedDeck("upload");
                    }}
                    onFileSelect={async (file) => {
                      await handleSlideDeckUpload(file);
                    }}
                    onImageSelect={(fileName) => {
                      console.log(fileName);
                    }}
                  />

                  <OptionCard
                    image={DecksIcon}
                    title="Pick From My Decks"
                    isSelected={selectedDeck === "decks"}
                    description="Choose a previously uploaded slide deck"
                    onImageSelect={() => {
                      const img = "library-image-url"; // your logic
                      setSelectedImage(img);
                    }}
                    selectedImage={selectedDecks?.image}
                    selectedDeck={selectedDecks}
                    onClick={() => {
                      setIsDecksModalOpen(true);
                      handleSelectedDeck("decks");
                    }}
                  />
                  <div className="border rounded-xl p-5 flex items-start gap-4 transition">
                    <p className="text-[#BBBBBB] text-sm md:text-[16px]">
                      Slides are only displayed for a brief period of time while
                      rehearsing. Set your slide visibility duration (in
                      seconds)
                    </p>

                    <div className="bg-[#1F1F1F] w-40 h-7 md:h-10 flex justify-between items-center rounded overflow-hidden">
                      <button
                        onClick={decrement}
                        className="bg-[#4F575D] h-full w-1/3 text-xl hover:bg-[#5a636a] transition"
                      >
                        -
                      </button>

                      <p className="w-1/3 text-center text-lg font-medium">
                        {slideDuration}
                      </p>

                      <button
                        onClick={increment}
                        className="bg-[#4F575D] h-full w-1/3 text-xl hover:bg-[#5a636a] transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="border border-[#3A3F4A] rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-2 bg-[#1F1F1F] px-6 py-4 text-[#BBBBBB] text-sm font-medium">
                      <span>Navigation Keys</span>
                      <span>Action</span>
                    </div>

                    {/* Rows */}
                    {[
                      { key: "Up Arrow", action: "Show Current slide" },
                      { key: "Right Arrow", action: "Show Next slide" },
                      { key: "Left Arrow", action: "Show Previous slide" },
                      { key: "Down Arrow", action: "Show Current slide" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-2 px-6 py-4 border-t border-[#3A3F4A] text-sm"
                      >
                        <span className="text-[#68AD5C] font-medium">
                          {item.key}
                        </span>
                        <span className="text-white">{item.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h2 className="text-white text-2xl font-semibold mb-6">
                  Step 3: Head Tracking
                </h2>
                <div className="border border-[#3F3F3F] rounded-xl px-6 pt-3 pb-6">
                  <div className="flex items-center my-3">
                    <div className="flex items-center">
                      <p className="text-xl font-semibold">Use Head Tracking</p>
                    </div>
                    <div
                      className={`${
                        slidesToggle ? "bg-[#68AD5C]" : "bg-[#4F575D]"
                      } w-8 h-4.25 rounded-full relative cursor-pointer ml-3`}
                      onClick={() => setSlidesToggle(!slidesToggle)}
                    >
                      <div
                        className={`bg-[#25282E] w-4 h-4 rounded-full absolute top-[0.5px] ${
                          slidesToggle ? "right-px" : "left-px"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold my-4 pt-4">
                    Head Tracking Calibration
                  </h4>
                  <p className="text-sm text-[#BBBBBB] pr-4">
                    We need to take a quick reading of your neutral face
                    position—this gives the app a perfect baseline for tracking
                    your head movements later! Center the crosshair on your
                    forehead, hit the "Calibrate Head Tracking" button, and then
                    hold perfectly still while keeping your eyes on the camera.
                    Once calibration is complete, the Next button will be
                    enabled.
                  </p>
                  <div className="text-center my-8">
                    <button className="px-6 py-2 rounded-lg border border-[#68AD5C] text-[#68AD5C] disabled:opacity-40">
                      Calibrate Head Tracking
                    </button>
                  </div>
                  <FaceTracking />
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <h2 className="text-white text-2xl font-semibold mb-6">
                  Step 4: Voice Controls
                </h2>
                <div className="border border-[#3F3F3F] rounded-xl px-6 pb-6">
                  <div className="flex items-center my-8">
                    <div className="flex items-center">
                      <p className="text-xl font-semibold">
                        Use Voice Controls
                      </p>
                    </div>
                    <div
                      className={`${
                        slidesToggle ? "bg-[#68AD5C]" : "bg-[#4F575D]"
                      } w-8 h-4.25 rounded-full relative cursor-pointer ml-3`}
                      onClick={() => setSlidesToggle(!slidesToggle)}
                    >
                      <div
                        className={`bg-[#25282E] w-4 h-4 rounded-full absolute top-[0.5px] ${
                          slidesToggle ? "right-px" : "left-px"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <div className="border border-[#3A3F4A] rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-2 bg-[#1F1F1F] px-6 py-4 text-[#BBBBBB] text-sm font-medium">
                      <span>Voice Commands</span>
                      <span>Action</span>
                    </div>

                    {/* Rows */}
                    {[
                      { key: "Reset Timer", action: "Resets the Timer" },
                      { key: "Start Recording", action: "Starts Recording" },
                      { key: "Stop Recording", action: "Stops Recording" },
                      { key: "Exit", action: "Exits the practice session" },
                      {
                        key: "Current Slide",
                        action: `Displays the current slide for ${slideDuration} seconds`,
                      },
                      {
                        key: "Next Slide",
                        action: `Displays the next slide for ${slideDuration} seconds`,
                      },
                      {
                        key: "Previous Slide",
                        action: `Displays the previous slide for ${slideDuration} seconds`,
                      },
                      {
                        key: "Pause Head Tracking",
                        action: "Pauses Head Tracking",
                      },
                      {
                        key: "Resume Head Tracking",
                        action: "Resumes Head Tracking",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-2 px-6 py-4 border-t border-[#3A3F4A] text-sm"
                      >
                        <span className="text-[#68AD5C] font-medium">
                          {item.key}
                        </span>
                        <span className="text-white">{item.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ================= NAV BUTTONS ================= */}
          <div className="flex justify-end gap-4 mt-6 max-w-150 w-full mx-auto">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="w-31 px-6 py-2 rounded-lg border border-[#68AD5C] text-[#68AD5C] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={
                (currentStep === 1 &&
                  !selectedImage &&
                  !selectedRoom?.fileUrl &&
                  !selectedRoomLibrary?.image) ||
                (currentStep === 2 &&
                  slidesToggle &&
                  !selectedDecks &&
                  !selectedSlidesFile)
              }
              onClick={nextStep}
              className={`${
                currentStep === 4 ? "w-42" : "w-31"
              } px-6 py-3 rounded-lg font-semibold transition ${
                selectedImage ||
                selectedRoom?.fileUrl ||
                selectedRoomLibrary?.image
                  ? "bg-[#68AD5C] text-white"
                  : "bg-[#68AD5C] opacity-50 text-gray-300 cursor-not-allowed"
              }`}
            >
              {currentStep === 4 ? "Start Rehearsal" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          stopPolling();
        }}
        qrUrl={qrUrl}
        roomPhoto={roomPhoto || ""}
        onSelect={(room) => {
          setSelectedMobileRoom(room);
          setRoomPhoto("");
        }}
      />
      <RoomsModal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        onSelect={(room) => {
          setSelectedRoom(room);
        }}
        roomsId={roomsId}
        isFavorite={roomIsFavorite}
        presentationId={presentationId}
        onToggleFavorite={(roomId) => handleRoomFavoriteToggle(roomId)}
      />
      <RoomsLibraryModal
        presentationId={presentationId}
        isOpen={isRoomsLibraryModalOpen}
        onClose={() => setIsRoomsLibraryModalOpen(false)}
        onSelect={(image) => {
          setSelectedLibraryRoom(image); // 🔥 store here
        }}
        roomsId={roomsId}
        isFavorite={roomIsFavorite}
      />
      <DecksModal
        isOpen={isDecksModalOpen}
        onClose={() => setIsDecksModalOpen(false)}
        onSelect={(image) => {
          setSelectedDecks(image); // 🔥 store here
        }}
        decksId={roomsId}
        isFavorite={roomIsFavorite}
        onToggleFavorite={(roomId) => handleRoomFavoriteToggle(roomId)}
        presentationId={presentationId}
      />
    </div>
  );
}
