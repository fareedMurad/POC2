"use client";

import { Key, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface Room {
  photoId: Key | null | undefined;
  isFavorite: boolean;
  fileUrl: string | Blob | undefined;
  id: string | any;
  name: string;
  image: string;
  isLive?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  qrUrl?: string;
  roomPhoto?: string;
  onSelect: (room: string) => void;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  qrUrl,
  roomPhoto,
  onSelect,
}: Props) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // 🔥 TEMP: Simulate image upload from phone (replace with real polling/websocket)
  useEffect(() => {
    if (!isOpen) return;

    // simulate upload after 5 seconds
    const timer = setTimeout(() => {
      setUploadedImage(
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc" // demo image
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {/* Modal Card */}
      <div
        className={`${
          uploadedImage ? "text-start" : "text-center"
        } bg-[#1F1F1F] rounded-2xl p-8 w-159 shadow-xl border border-[#3A3F4A]`}
      >
        <div className="bg-[#25282E] p-6 rounded-xl mb-6">
          {/* 🔥 Title changes */}
          {roomPhoto ? (
            <h2 className="text-white text-xl font-semibold mb-6">
              Room Photo Uploaded
            </h2>
          ) : (
            <h2 className="text-white text-xl text-center font-semibold mb-6">
              Upload Room Photo from Phone
            </h2>
          )}

          {/* 🔥 QR OR IMAGE */}
          <div className="flex justify-center my-8">
            {!roomPhoto ? (
              <QRCodeCanvas
                value={qrUrl || ""}
                size={232}
                bgColor="#2D313A"
                fgColor="#ffffff"
              />
            ) : (
              <img
                src={roomPhoto}
                alt="Uploaded Room"
                className="rounded-xl w-full max-h-65 object-cover"
              />
            )}
          </div>

          {/* 🔥 Hide instructions after upload */}
          {!roomPhoto && (
            <div className="text-left text-sm text-[#BBBBBB] space-y-1 my-6">
              <p className="text-white text-[16px] font-medium">
                Instructions:
              </p>
              <p>1. Scan this QR code with your phone's camera.</p>
              <p>2. Select a panoramic room photo to upload.</p>
              <p>3. Your photo will display here when upload completes.</p>
            </div>
          )}
        </div>

        {/* 🔥 Button changes */}
        {!roomPhoto ? (
          <button
            onClick={onClose}
            className="border border-[#68AD5C] text-[#68AD5C] px-6 py-2 rounded-lg hover:bg-[#008236] float-end hover:text-white transition"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => {
              onSelect(roomPhoto);
              onClose();
            }}
            className="bg-[#68AD5C] text-white px-8 py-2 rounded-lg float-end hover:bg-green-700 transition"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
