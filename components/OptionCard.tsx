"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface Room {
  id: string;
  name: string;
  image: string;
  isLive?: boolean;
}

interface Deck {
  id: string;
  name: string;
  pages?: string;
  image: string;
  isLive?: boolean;
}

export function OptionCard({
  icon,
  image,
  title,
  description,
  isUpload = false,
  onClick,
  onInputClick,
  onImageSelect,
  inputType,
  selectedImage,
  selectedRoom,
  selectedDeck,
  isSelected,
  onFileSelect,
  uploadErrorMessage,
  isUploading,
}: {
  icon?: React.ReactNode;
  image?: any;
  title: string;
  description: string;
  isUpload?: boolean;
  onClick?: () => void;
  onInputClick?: () => void;
  onImageSelect?: (image: string) => void;
  inputType?: string;
  selectedImage?: string | null;
  selectedRoom?: Room;
  selectedDeck?: Deck;
  isSelected?: boolean;
  onFileSelect?: (file: File) => void;
  uploadErrorMessage?: string | null;
  isUploading?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoomImage, setSelectedRoomImage] = useState<string | null>(
    null
  );
  const [selectedSlidesFile, setSelectedSlidesFile] = useState<string | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleClick = () => {
    if (isUpload) {
      fileInputRef.current?.click();
      onInputClick();
    } else if (onClick) {
      onClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setUploadError(null);
      return;
    }

    // ✅ IMAGE MODE
    if (inputType !== "file") {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedRoomImage(imageUrl);
      onImageSelect?.(imageUrl);
    }

    // ✅ FILE MODE (.pptx only)
    // ✅ FILE MODE (.pptx only)
    else {
      const MAX_SIZE = 15 * 1024 * 1024;

      const extension = file.name.split(".").pop()?.toLowerCase();

      // Validate extension
      if (extension !== "pptx") {
        setUploadError(`.${extension} is not supported`);
        return;
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        setUploadError(".pptx must be 15 MB or less");
        return;
      }

      setUploadError(null);

      setSelectedSlidesFile(file.name);

      // Send actual file to parent
      onFileSelect?.(file);

      // optional filename callback
      onImageSelect?.(file.name);
    }

    setUploadError(null);
  };

  return (
    <div
      onClick={handleClick}
      className={`border rounded-xl p-5 flex items-start gap-4 cursor-pointer transition
        ${
          isSelected
            ? "border-2 border-[#68AD5C]"
            : "border-[#3A3F4A] hover:border-[#68AD5C]"
        }`}
    >
      {/* Hidden Input */}
      {isUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept={inputType === "file" ? ".pptx" : "image/*"}
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Icon */}
      {isSelected ? (
        <div className="mt-3 h-6 w-6 border-3 border-[#68AD5C] rounded-full flex justify-center items-center">
          <div className="bg-[#68AD5C] h-3.5 w-3.5 rounded-full"></div>
        </div>
      ) : (
        <div className="mt-3 h-6 w-6 border-3 border-[#bababa] rounded-full"></div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h4 className="text-white textsm md:text-xl font-semibold flex items-center">
          {image ? (
            <Image
              src={image}
              className="mt-1 h-8 w-8 text-[#68AD5C] mr-2"
              alt="icon"
            />
          ) : (
            <div className="mt-2 h-8 w-8 text-[#68AD5C]">{icon}</div>
          )}

          {title}
        </h4>
        <p className="text-[16px] pt-1.5 text-[#BBBBBB]">{description}</p>

        {(selectedImage || selectedSlidesFile) && (
          <div className="mt-2 max-h-48 w-full relative">
            {(selectedDeck?.id || selectedRoom?.id) && (
              <span className="absolute top-4 right-4 bg-[#4C4B4B33] text-white text-xs font-bold h-8 w-8 flex justify-center items-center rounded">
                <Star className="h-4.25 w-4.25" />
              </span>
            )}
            <img
              src={selectedImage || ""}
              alt="preview"
              className="rounded-lg max-h-48 w-full object-cover border border-[#3A3F4A]"
            />
            {selectedRoom?.isLive && (
              <span className="absolute top-4 left-4 bg-[#FD3131] text-white text-xs font-bold px-2 py-1 rounded">
                Live Pano
              </span>
            )}
            {selectedDeck?.name && selectedDeck.pages && (
              <div className="absolute bottom-2 left-3 m-2">
                <p className="text-lg font-bold">{selectedDeck.name}</p>
                <p className="text-sm font-medium">
                  {selectedDeck.pages} Pages
                </p>
              </div>
            )}

            <button
              onClick={(e) => {
                if (!isUpload) e.stopPropagation();
                onClick?.(); // reopen modal
              }}
              className="bg-[#25282E] text-[#68AD5C] text-sm font-semibold absolute bottom-2 right-2 px-4 py-1.5 rounded-lg"
            >
              Change
              {isUpload && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={inputType === "file" ? ".pptx" : "image/*"}
                  onChange={handleFileChange}
                  className="hidden"
                />
              )}
            </button>
          </div>
        )}
        {(uploadError || uploadErrorMessage) && (
          <p className="text-[#FF383C] text-[16px] font-semibold mt-2">
            *{uploadError || uploadErrorMessage}
          </p>
        )}
        {isUpload && isUploading && (
          <p className="text-[#68AD5C] text-sm font-medium mt-2">
            Uploading slide deck...
          </p>
        )}
      </div>
    </div>
  );
}
