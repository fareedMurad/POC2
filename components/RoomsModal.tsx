"use client";

import { getUserPanoRoomPhotos } from "@/lib/apiServices";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Key, useEffect, useState } from "react";

interface Room {
  photoId: Key | null | undefined;
  isFavorite: boolean;
  fileUrl: string | Blob | undefined;
  id: string | any;
  name: string;
  image: string;
  isLive?: boolean;
}

export default function RoomsModal({
  isOpen,
  onClose,
  onSelect,
  onToggleFavorite,
  roomsId,
  presentationId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (room: Room) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (roomId: string) => void;
  roomsId?: string | null;
  presentationId?: string;
}) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pageKey, setPageKey] = useState<string>("");
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPanoRoomPhotos = async (
    presentationId: string,
    key: string = "",
    direction: "next" | "prev" | "init" = "init"
  ) => {
    setIsLoading(true);

    try {
      const result = await getUserPanoRoomPhotos(presentationId, key);

      const list = result?.userPanoRoomPhotoDTOList || [];

      setRooms(list);
      setNextPageKey(result?.pageKey || null);

      if (direction === "next") {
        setPageHistory((prev) => [...prev, pageKey]); // push CURRENT page key
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev") {
        setPageHistory((prev) => prev.slice(0, -1)); // pop last
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else {
        setCurrentPage(1);
      }

      setPageKey(key);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // reset pagination when opening
    setPageKey("");
    setNextPageKey(null);
    setPageHistory([]);

    fetchUserPanoRoomPhotos(presentationId, pageKey ?? "", "init");
  }, [presentationId, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1E2126] w-172.25 rounded-2xl p-6 text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">My Rooms</h2>

          <div className="flex items-center gap-3">
            <button className="bg-[#2A2E35] text-sm font-medium px-5 py-2.5 rounded-lg flex items-center">
              <Star className="w-3.75 h-3.5 mr-1.5" /> Favorites
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-5">
          {/* RIGHT ROOMS */}
          <div className="flex-1 flex flex-col">
            {/* Rooms List */}
            <div className="space-y-4 max-h-134 overflow-y-auto pr-1">
              {isLoading ? (
                <p className="text-center py-10 h-94">Loading...</p>
              ) : rooms?.length ? (
                rooms.map((room) => (
                  <div
                    key={room.photoId}
                    onClick={() => {
                      const filteredRoom = rooms.find(
                        (r) => r.photoId === room.photoId
                      );
                      if (filteredRoom) {
                        onSelect(filteredRoom);
                        setSelectedRoom(room.photoId);
                        onClose();
                      }
                    }}
                    className={`relative flex items-center gap-4 overflow-hidden rounded-xl cursor-pointer border transition shadow-2xl ${
                      selectedRoom === room.photoId
                        ? "border-2 border-[#4CAF50]"
                        : "border-transparent"
                    } hover:border-[#4CAF50]`}
                  >
                    {/* Image */}
                    <div className="relative w-full h-37.5 rounded-lg overflow-hidden">
                      <img
                        src={room.fileUrl}
                        className="w-full h-full object-cover"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />

                      {/* Live badge */}
                      {room.isLive && (
                        <span className="absolute top-4 left-4 bg-[#FD3131] text-white text-[16px] font-bold px-3 py-0.75 rounded">
                          Live Pano
                        </span>
                      )}

                      <div className="h-7 w-7 bg-[#4C4B4B33] rounded-[5px] absolute top-4 right-4 flex justify-center items-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleFavorite?.(room.photoId);
                          }}
                        >
                          <Star
                            className={`w-3.75 h-3.75 ${
                              room.isFavorite && roomsId === room.photoId
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-400 hover:text-white"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Text */}
                      <div className="absolute bottom-3 left-4">
                        <p className="text-lg font-bold">{room.name}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="min-h-107 border border-[#68AD5C] flex justify-center items-center rounded-xl">
                  <p>No Rooms Found!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5">
              {/* Pagination */}

              <div className="flex items-center gap-3 text-xl">
                {/* Prev */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    const prevKey = pageHistory[pageHistory.length - 1] || "";
                    fetchUserPanoRoomPhotos(presentationId!, prevKey, "prev");
                  }}
                  className={`flex items-center ${
                    pageHistory.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <ChevronLeft /> Prev
                </button>

                {/* Page */}
                <span className="w-16 text-center border-2 border-[#3F3F3F] py-0.5 rounded-md">
                  {currentPage}
                </span>

                {/* Next */}
                <button
                  disabled={!nextPageKey}
                  onClick={() => {
                    if (nextPageKey) {
                      fetchUserPanoRoomPhotos(
                        presentationId!,
                        nextPageKey,
                        "next"
                      );
                    }
                  }}
                  className={`flex items-center ${
                    !nextPageKey ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Next <ChevronRight />
                </button>
              </div>

              {/* Done */}
              <button
                onClick={() => {
                  const room = rooms.find((r) => r.photoId === selectedRoom);
                  if (room) {
                    onSelect(room);
                  }
                  onClose();
                }}
                className="bg-[#4CAF50] hover:bg-[#43a047] px-10 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
