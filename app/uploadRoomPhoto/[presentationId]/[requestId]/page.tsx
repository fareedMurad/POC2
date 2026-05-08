"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/icon.svg";
import AddImageIcon from "@/public/add-image.svg";
import {
  CheckCircle,
  ImagePlusIcon,
  InfoIcon,
  LibraryBig,
  UploadCloudIcon,
  X,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadUserPanoRoomPhoto } from "@/lib/apiServices";
import { useParams, useSearchParams } from "next/navigation";
import heic2any from "heic2any";

const validTypes = ["image/jpeg", "image/jpg", "image/heic", "image/heif"];

export default function UploadRoomPhoto() {
  const params = useParams();
  const searchParams = useSearchParams();
  const presentationId = params.presentationId as string;
  const mobilePanoUploadRequestId = params.requestId as string;
  const authToken = searchParams.get("token") || "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoomImage, setSelectedRoomImage] = useState<string | null>(
    null
  );
  const [uploadError, setUploadError] = useState(false);
  const [IsUploading, setIsUploading] = useState(false);
  const [IsUploaded, setIsUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (file.type === "image/heic" || file.type === "image/heif") {
      const blob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      return new File([blob as Blob], "converted.jpg", {
        type: "image/jpeg",
      });
    }

    return file;
  };

  const validateImage = async (file: File): Promise<string[]> => {
    const errors: string[] = [];

    const validTypes = ["image/jpeg", "image/jpg", "image/heic", "image/heif"];

    if (!validTypes.includes(file.type.toLowerCase())) {
      errors.push("File type must be JPG, JPEG, or HEIC.");
    }

    if (file.size > 25 * 1024 * 1024) {
      errors.push("File size must be 25MB or less.");
    }

    const image = new window.Image();
    const imageUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve) => {
      image.onload = () => {
        const width = image.width;
        const height = image.height;

        if (width / height < 1.8) {
          errors.push("Image must be panoramic (ratio ≥ 1.8).");
        }

        // if (width < 3000) {
        //   errors.push("Image width must be at least 3000px.");
        // }

        if (!validTypes.includes(file.type.toLowerCase())) {
          errors.push("File type must be JPG, JPEG, or HEIC.");
        }

        resolve();
      };

      // ✅ VERY IMPORTANT
      image.onerror = () => {
        errors.push("Unable to read image. Try JPG instead of HEIC.");
        resolve();
      };

      image.src = imageUrl;
    });

    return errors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setUploadErrors([]);

    // ✅ Convert HEIC first
    file = await convertHeicToJpeg(file);

    const errors = await validateImage(file);

    if (errors.length > 0) {
      setUploadErrors(errors);
      setSelectedFile(null);
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedRoomImage(imageUrl);
    setSelectedFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (progress >= 100) {
      setIsUploaded(true);
      setIsUploading(false);
    }
  }, [progress]);

  const generateThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const canvas = document.createElement("canvas");

      img.onload = () => {
        const ctx = canvas.getContext("2d")!;
        const width = 500; // thumbnail width
        const height = (img.height / img.width) * width;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob!], "thumbnail.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.8
        );
      };

      img.onerror = () => {
        // fallback (important)
        resolve(file); // use original file if thumbnail fails
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const totalMB = 20;
  const uploadedMB = ((progress / 100) * totalMB).toFixed(1);

  console.log(
    "mobilePanoUploadRequestId",
    presentationId,
    mobilePanoUploadRequestId
  );

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col justify-between px-6 py-4 md:px-12 md:pt-7">
      <div>
        <header className="bg-background-default flex justify-start items-center mt-4 w-full md:w-4/12 mx-auto">
          <Link href="/" className="focus:outline-none">
            <Image src={Logo} alt="Logo" className="h-10 w-10" priority />
          </Link>
          <h2 className="text-[22px] font-semibold mx-auto">
            {IsUploading && !IsUploaded ? "Loading..." : "Upload Room Photo"}
          </h2>
        </header>

        <div className="bg-[#25282E] p-4 rounded-xl w-full md:w-4/12 mx-auto mt-6">
          <p className="text-[16px] font-medium text-[#B4B4B4]">Instructions</p>
          <ol className="list-decimal pl-4">
            <li className="text-sm">Must be Panoramic photos</li>
            <li className="text-sm">File format is .HEIC, JPG, or JPEG</li>
            <li className="text-sm">Must be 25 MB or les</li>
          </ol>
        </div>
        {uploadErrors.length > 0 && (
          <div className="bg-[#25282E] border border-[#FF383C] p-4 rounded-xl w-full md:w-4/12 mx-auto mt-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-[#4b3131] flex justify-center items-center">
                <InfoIcon className="text-[#FF383C]" />
              </div>
              <p className="text-2xl font-semibold text-[#FF383C] ml-3">
                Upload Failed
              </p>
            </div>

            {uploadErrors.map((err, index) => (
              <div
                key={index}
                className="bg-[#1F1F1F] border border-[#3F3F3F] p-4 flex rounded-xl my-4"
              >
                <XCircleIcon size={20} className="text-[#FF383C] mr-2" />
                <div>
                  <p className="text-sm font-bold">
                    {err.includes("JPG, JPEG, or HEIC.") ||
                    err.includes("JPG or HEIC.")
                      ? "File type not supported."
                      : "File too large"}
                    .
                  </p>
                  <p className="text-[10px] font-medium text-[#B4B4B4]">
                    {err}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          className={`bg-[#25282E] p-4 rounded-xl w-full md:w-4/12 mx-auto mt-6 flex ${
            selectedRoomImage ? "items-start" : " items-center"
          } justify-center flex-col min-h-42`}
        >
          {selectedRoomImage ? (
            <>
              <img
                src={selectedRoomImage}
                alt="preview"
                className="rounded-lg max-h-48 w-full object-cover border border-[#3A3F4A]"
              />
              <p className="text-[16px] font-medium pt-2 text-left">
                Presentastion Hall
              </p>
              {IsUploading && (
                <div className="w-full text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-[#B4B4B4]">
                        {uploadedMB} MB of {totalMB} MB
                      </p>
                    </div>

                    <p className="text-xl font-semibold float-end inline-block text-[#68AD5C]">
                      {Math.min(progress, 100).toFixed(0)}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className=" w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#68AD5C] transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  {/* Footer Text */}
                  <p className="text-[10px] text-[#B4B4B4] mt-3">
                    Please do not close the app while uploading...
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <Image
                src={AddImageIcon}
                alt="add image"
                className="h-10 w-10"
                priority
              />
              <p className="text-[#BBBBBB] text-[16px] pt-2">
                No image selected
              </p>
            </>
          )}
        </div>
      </div>

      {IsUploaded ? (
        <div className="min-h-[50vh] flex flex-col justify-center items-center">
          <div className="h-24.5 w-24.5 rounded-full bg-[#25282E] flex justify-center items-center text-[#68AD5C]">
            <CheckCircle className="h-12.5 w-12.5" />
          </div>
          <p className="text-2xl font-bold my-2">Upload Complete</p>
          <p className="text-[16px] text-[#B4B4B4]">
            Return to desktop browser
          </p>
        </div>
      ) : uploadFailed ? (
        // ❌ FAILED UI (your screenshot)
        <div className="flex flex-col mt-8">
          {/* <button
            className="px-6 py-3 rounded-lg font-semibold bg-[#68AD5C] text-white md:w-95.5 md:mx-auto flex items-center justify-center"
            onClick={handleClick}
          >
            <ImagePlusIcon className="mr-2" />
            Choose another
          </button> */}
          <button
            className="px-6 py-3 rounded-lg font-semibold bg-[#68AD5C] hover:bg-[#008236] text-white md:w-95.5 md:mx-auto flex items-center justify-center cursor-pointer transition"
            onClick={handleClick}
          >
            <ImagePlusIcon className="mr-2" />
            Choose another
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden w-full h-full"
            />
          </button>

          <button
            className="px-6 py-3 rounded-lg font-semibold bg-[#FF3B3B] text-white md:w-95.5 md:mx-auto flex items-center justify-center mt-4"
            onClick={() => {
              setUploadFailed(false);
              setSelectedFile(null);
              setSelectedRoomImage(null);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {IsUploading ? (
            <button
              className="px-6 py-3 rounded-lg font-semibold bg-[#FF3B3B] hover:bg-[#008236] text-white md:w-95.5 md:mx-auto flex items-center justify-center cursor-pointer transition"
              onClick={() => setIsUploading(false)}
            >
              <X className="mr-2" />
              Cancel Upload
            </button>
          ) : (
            <div className="flex flex-col mt-8">
              {selectedRoomImage ? (
                <button
                  disabled={IsUploading}
                  className="px-6 py-3 rounded-lg font-semibold bg-[#68AD5C] hover:bg-[#008236] text-white md:w-95.5 md:mx-auto flex items-center justify-center cursor-pointer transition"
                  onClick={async () => {
                    if (!selectedFile) return;

                    try {
                      setIsUploading(true);
                      setProgress(0);
                      setIsUploaded(false);
                      setUploadFailed(false);

                      // optional fake progress while uploading
                      const interval = setInterval(() => {
                        setProgress((prev) =>
                          prev < 90 ? prev + Math.random() * 5 : prev
                        );
                      }, 200);

                      const thumbnail = await generateThumbnail(selectedFile);

                      // const authToken = localStorage.getItem("authToken") || "";

                      // ✅ CALL API
                      const result = await uploadUserPanoRoomPhoto(
                        presentationId,
                        mobilePanoUploadRequestId,
                        selectedFile,
                        thumbnail,
                        authToken
                      );

                      console.log("result", result);

                      clearInterval(interval);

                      setProgress(100);
                      setIsUploaded(true);
                    } catch (error) {
                      console.log("error::", error);
                      setUploadErrors(["Upload failed. Please try again."]);
                      setIsUploading(false);
                      setUploadFailed(true);
                    }
                  }}
                >
                  <UploadCloudIcon className="mr-2" />
                  Upload Image
                </button>
              ) : (
                <button
                  className="px-6 py-3 rounded-lg font-semibold bg-[#68AD5C] hover:bg-[#008236] text-white md:w-95.5 md:mx-auto flex items-center justify-center cursor-pointer transition"
                  onClick={handleClick}
                >
                  <LibraryBig className="mr-2" />
                  Choose from Photo Gallery
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden w-full h-full"
                  />
                </button>
              )}

              {selectedRoomImage ? (
                <button
                  className="px-6 py-3 rounded-lg font-semibold transition border border-[#68AD5C] hover:bg-[#008236] text-[#68AD5C] md:w-95.5 md:mx-auto cursor-not-allowed flex items-center justify-center mt-4"
                  onClick={handleClick}
                >
                  <ImagePlusIcon className="mr-2" />
                  Choose another
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden w-full h-full"
                  />
                </button>
              ) : (
                <button className="px-6 py-3 rounded-lg font-semibold transition border border-[#68AD5C] hover:bg-[#008236] text-[#68AD5C] md:w-95.5 md:mx-auto cursor-not-allowed flex items-center justify-center mt-4">
                  <UploadCloudIcon className="mr-2" />
                  Upload
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
