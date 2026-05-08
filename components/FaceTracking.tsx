"use client";

import { useEffect, useRef, useState } from "react";

export default function FaceTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsCameraOn(false);
  };

  useEffect(() => {
    return () => stopCamera(); // cleanup on unmount
  }, []);

  return (
    <div className="bg-black w-102.25 h-56.25 mx-auto rounded-xl p-3 relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-lg"
      />

      <div className="flex absolute bottom-2">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="bg-green-600 px-3 py-1.5 rounded-lg"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="bg-red-500 px-3 py-1.5 rounded-lg"
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
