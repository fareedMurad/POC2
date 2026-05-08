"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import {
  filterRoomLibraryPaginated,
  getFavoriteLibraryRooms,
  getRoomLibraryFilters,
} from "@/lib/apiServices";

interface Room {
  id: string;
  name: string;
  image: string;
  fileUrl?: string;
  isLive?: boolean;
  venueType?: string;
  audienceSize?: string;
  panoRoomMediaType?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (room: Room) => void;
  isFavorite?: boolean;
  roomsId?: string | null;
  presentationId: string;
}

export default function RoomsLibraryModal({
  isOpen,
  onClose,
  onSelect,
  presentationId,
}: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [availableRoomMediaTypeList, setAvailableRoomMediaTypeList] = useState<
    string[]
  >([]);
  const [availableaudienceSizeList, setAvailableaudienceSizeList] = useState<
    string[]
  >([]);
  const [availableVenueTypes, setAvailableVenueTypes] = useState<string[]>([]);

  const [mediaType, setMediaType] = useState<"PHOTO" | "VIDEO" | null>(null);

  const [roomTypes, setRoomTypes] = useState<
    | "MEETING ROOM"
    | "LECTURE HALL"
    | "CLASSROOM"
    | "COURTROOM"
    | "CONFERENCE ROOM"
    | "THEATER"
    | null
  >(null);

  const [audienceSize, setAudienceSize] = useState<
    "ZERO" | "ONE" | "FULL" | null
  >(null);
  const [favoriteRoomIds, setFavoriteRoomIds] = useState<string[]>([]);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const savedFavorites = Cookies.get("favoriteLibraryRooms");

    if (savedFavorites) {
      try {
        setFavoriteRoomIds(JSON.parse(savedFavorites));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const fetchFilters = async () => {
    try {
      const result = await getRoomLibraryFilters(presentationId);

      console.log("result::", result);

      setAvailableRoomMediaTypeList(result?.roomMediaTypeList || []);
      setAvailableaudienceSizeList(result?.audienceSizeList || []);
      setAvailableVenueTypes(result?.venueTypeList || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async (pageNumber: number = 1) => {
    try {
      setLoading(true);

      const result = await filterRoomLibraryPaginated({
        pageNumber,
        venueTypes: roomTypes ? [roomTypes] : [],
        audienceSizes: audienceSize ? [audienceSize] : [],
        roomMediaTypes: mediaType ? [mediaType] : [],
      });

      const items = result?.items || [];

      const mappedRooms: Room[] = items.map((item: any) => ({
        id: item.mediaId,
        name: item.venueType || "Room",
        image: item.thumbnailUrl || item.fileUrl,
        fileUrl: item.fileUrl,
        isLive: item.panoRoomMediaType === "VIDEO",
      }));

      setRooms(mappedRooms);

      setHasNextPage(result?.hasNextPage || false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchFilters();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || showFavoritesOnly) return;

    fetchRooms(page);
  }, [page, mediaType, roomTypes, audienceSize, isOpen, showFavoritesOnly]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRoom(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFavorite = (roomId: string) => {
    let updatedFavorites: string[] = [];

    if (favoriteRoomIds.includes(roomId)) {
      updatedFavorites = favoriteRoomIds.filter((id) => id !== roomId);
    } else {
      updatedFavorites = [...favoriteRoomIds, roomId];
    }

    setFavoriteRoomIds(updatedFavorites);

    Cookies.set("favoriteLibraryRooms", JSON.stringify(updatedFavorites), {
      expires: 365,
    });
  };

  const handleFavoritesToggle = async () => {
    const newValue = !showFavoritesOnly;

    setShowFavoritesOnly(newValue);
    setPage(1);

    if (!newValue) {
      fetchRooms(1);

      return;
    }

    try {
      if (favoriteRoomIds.length === 0) {
        setRooms([]);
        return;
      }

      const result = await getFavoriteLibraryRooms(favoriteRoomIds);

      const mappedRooms =
        result?.libPanoRoomMediaDTOList?.map((item: any) => ({
          id: item.mediaId,
          name: item.venueType || "Room",
          image: item.thumbnailUrl || item.fileUrl,
          fileUrl: item.fileUrl,
          isLive: item.panoRoomMediaType === "VIDEO",
        })) || [];

      setRooms(mappedRooms);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1E2126] w-266 rounded-2xl p-6 text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">Room Library</h2>

          <button
            className={`${
              showFavoritesOnly ? "bg-[#68AD5C]" : "bg-[#2A2E35]"
            } text-sm font-medium px-5 py-2.5 rounded-lg flex items-center cursor-pointer`}
            onClick={() => handleFavoritesToggle()}
          >
            <Star className="w-3.75 h-3.5 mr-1.5" />
            Favorites
          </button>
        </div>

        <div className="flex gap-5">
          <div className="w-87.5 bg-[#2A2E35] rounded-xl p-4">
            <h3 className="text-xl font-semibold mb-4">Filters</h3>

            <p className="text-lg font-medium mb-2 mt-8">Media Type</p>

            <div className="flex gap-3 mb-5">
              {availableRoomMediaTypeList.map((type) => {
                const active = mediaType === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setPage(1);

                      setMediaType((prev) =>
                        prev === type ? null : (type as any)
                      );
                    }}
                    className={`flex items-center gap-2 rounded-full py-1.5 px-3 text-sm transition border
                    ${
                      active
                        ? "bg-[#2e3934] text-[#68AD5C] border-[#68AD5C]"
                        : "bg-[#1F1F1F] text-[#BBBBBB] border-[#1F1F1F]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            <p className="text-lg font-medium mb-2 mt-6">Room Type</p>

            <div className="flex flex-wrap gap-3 mb-5">
              {availableVenueTypes.map((type) => {
                const active = roomTypes === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setPage(1);

                      setRoomTypes((prev) =>
                        prev === type ? null : (type as any)
                      );
                    }}
                    className={`flex items-center gap-2 rounded-full py-1.5 px-3 text-sm transition border
                    ${
                      active
                        ? "bg-[#2e3934] text-[#68AD5C] border-[#68AD5C]"
                        : "bg-[#1F1F1F] text-[#BBBBBB] border-[#1F1F1F]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            <p className="text-lg font-medium mb-2 mt-6">Audience Size</p>

            <div className="flex gap-3 mb-5">
              {availableaudienceSizeList.map((type) => {
                const active = audienceSize === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setPage(1);

                      setAudienceSize((prev) =>
                        prev === type ? null : (type as any)
                      );
                    }}
                    className={`flex items-center gap-2 rounded-full py-1.5 px-3 text-sm transition border
                    ${
                      active
                        ? "bg-[#2e3934] text-[#68AD5C] border-[#68AD5C]"
                        : "bg-[#1F1F1F] text-[#BBBBBB] border-[#1F1F1F]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROOMS */}
          <div className="flex-1 flex flex-col">
            <div className="space-y-4 max-h-134 overflow-y-auto pr-1">
              {loading ? (
                <div className="min-h-107 flex items-center justify-center">
                  Loading...
                </div>
              ) : rooms.length ? (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      const filteredRoom = rooms.find((r) => r.id === room.id);
                      if (filteredRoom) {
                        onSelect(filteredRoom);
                        onClose();
                      }
                    }}
                    className={`relative flex items-center gap-4 overflow-hidden rounded-xl cursor-pointer border transition shadow-2xl ${
                      selectedRoom === room.id
                        ? "border-2 border-[#4CAF50]"
                        : "border-transparent"
                    } hover:border-[#4CAF50]`}
                  >
                    <div className="relative w-full h-37.5 rounded-lg overflow-hidden">
                      <img
                        src={room.image}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />

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

                            toggleFavorite(room.id);
                          }}
                        >
                          <Star
                            className={`w-3.75 h-3.75 ${
                              favoriteRoomIds.includes(room.id)
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-400 hover:text-white"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="min-h-107 border border-[#68AD5C] flex justify-center items-center rounded-xl">
                  <p>No Room Library Found!</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-3 text-xl">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="hover:text-white flex items-center disabled:opacity-40"
                >
                  <ChevronLeft />
                  Prev
                </button>

                <span className="w-16 text-center border-2 border-[#3F3F3F] py-0.5 rounded-md">
                  {page}
                </span>

                <button
                  disabled={!hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="hover:text-white flex items-center disabled:opacity-40"
                >
                  Next
                  <ChevronRight />
                </button>
              </div>

              <button
                onClick={() => onClose()}
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
