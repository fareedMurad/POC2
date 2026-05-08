"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  AddToUserSlideDeckFavorites,
  getPagedFavoriteUserSlideDecks,
  getPagedUserSlideDecks,
  RemoveFromUserSlideDeckFavorites,
} from "@/lib/apiServices";

interface Deck {
  id: string;
  name: string;
  pages?: string;
  image: string;
  isLive?: boolean;
  isFavorite?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (room: Deck) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (roomId: string) => void;
  decksId?: string | null;
  presentationId: string;
}

export default function DecksModal({
  isOpen,
  onClose,
  onSelect,
  isFavorite,
  onToggleFavorite,
  decksId,
  presentationId,
}: Props) {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState<string>("");
  const [nextPageKey, setNextPageKey] = useState<string>("");
  const [pageKeys, setPageKeys] = useState<Record<number, string>>({
    1: "",
  });
  const [favoriteDeckIds, setFavoriteDeckIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchDecks = async (currentPageKey: string = "") => {
    try {
      setLoading(true);

      const result = await getPagedUserSlideDecks(
        presentationId,
        currentPageKey
      );

      const items = result?.slideDeckDTOList || [];

      const mappedDecks: Deck[] = items.map((item: any) => ({
        id: item.id || item.slideDeckId,
        name: item.title || "Deck",
        pages: item.slideCount || "0",
        image: item.slides[0]?.fileUrl || item.imageUrl || "",
        isLive: false,
        isFavorite: item.isFavorite,
      }));

      setDecks(mappedDecks);

      setFavoriteDeckIds(
        mappedDecks.filter((deck) => deck.isFavorite).map((deck) => deck.id)
      );

      const receivedNextPageKey = result?.pageKey || "";

      setNextPageKey(receivedNextPageKey);

      setPageKeys((prev) => ({
        ...prev,
        [page + 1]: receivedNextPageKey,
      }));
    } catch (error) {
      console.error(error);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedFavorites = Cookies.get("favoriteDecks");

    if (savedFavorites) {
      try {
        setFavoriteDeckIds(JSON.parse(savedFavorites));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const toggleFavorite = async (deckId: string) => {
    try {
      const targetDeck = decks.find((deck) => deck.id === deckId);

      if (!targetDeck) return;

      const isAlreadyFavorite = targetDeck.isFavorite;

      // OPTIMISTIC UI UPDATE
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId
            ? {
                ...deck,
                isFavorite: !isAlreadyFavorite,
              }
            : deck
        )
      );

      if (isAlreadyFavorite) {
        setFavoriteDeckIds((prev) => prev.filter((id) => id !== deckId));

        await RemoveFromUserSlideDeckFavorites(presentationId, deckId);

        // remove instantly from favorites screen
        if (showFavoritesOnly) {
          setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
        }
      } else {
        setFavoriteDeckIds((prev) => [...prev, deckId]);

        await AddToUserSlideDeckFavorites(presentationId, deckId);
      }
    } catch (error) {
      console.error(error);

      // rollback on failure
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId
            ? {
                ...deck,
                isFavorite: !deck.isFavorite,
              }
            : deck
        )
      );
    }
  };

  const handleFavoritesToggle = async () => {
    const newValue = !showFavoritesOnly;

    setShowFavoritesOnly(newValue);
    setPage(1);

    // BACK TO ALL DECKS
    if (!newValue) {
      setPageKey("");
      setPageKeys({ 1: "" });

      fetchDecks("");

      return;
    }

    // FAVORITES
    try {
      setLoading(true);

      const result = await getPagedFavoriteUserSlideDecks(
        presentationId,
        pageKey
      );

      const items = result?.slideDeckDTOList || [];

      const mappedDecks: Deck[] = items.map((item: any) => ({
        id: item.id || item.slideDeckId,
        name: item.title || "Deck",
        pages: item.slideCount || "0",
        image: item.slides[0]?.fileUrl || item.imageUrl || "",
        isLive: false,
        isFavorite: item.isFavorite,
      }));

      setDecks(mappedDecks);

      setFavoriteDeckIds(mappedDecks.map((deck) => deck.id));
    } catch (error) {
      console.error(error);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || showFavoritesOnly) return;

    const currentPageKey = pageKeys[page] || "";

    setPageKey(currentPageKey);

    fetchDecks(currentPageKey);
  }, [page, isOpen, showFavoritesOnly]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDeck(null);
      setPage(1);
      setPageKey("");
      setNextPageKey("");
      setPageKeys({
        1: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1E2126] w-246 rounded-2xl p-6 text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">My Decks</h2>

          <div className="flex items-center gap-3">
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
        </div>

        {/* Content */}
        <div className="flex gap-5">
          {/* RIGHT DECKS */}
          <div className="flex-1 flex flex-col">
            {/* Decks List */}
            <div className="grid grid-cols-2 gap-8 space-y-4 max-h-134 overflow-y-auto pr-1">
              {loading ? (
                <div className="col-span-2 min-h-107 flex items-center justify-center">
                  Loading...
                </div>
              ) : decks?.length ? (
                decks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => {
                      const filteredDeck = decks.find((r) => r.id === deck?.id);

                      if (filteredDeck) {
                        onSelect(filteredDeck);
                        onClose();
                      }
                    }}
                    className={`relative flex items-center gap-4 h-54.25 overflow-hidden rounded-xl cursor-pointer border transition shadow-2xl ${
                      selectedDeck === deck.id
                        ? "border-2 border-[#4CAF50]"
                        : "border-transparent"
                    } hover:border-[#4CAF50]`}
                  >
                    {/* Image */}
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <img
                        src={deck.image}
                        className="w-full h-full object-cover"
                        alt={deck.name}
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />

                      <div className="h-7 w-7 bg-[#4C4B4B33] rounded-[5px] absolute top-2 right-2 flex justify-center items-center m-2">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            await toggleFavorite(deck.id);

                            onToggleFavorite?.(deck.id);
                          }}
                        >
                          <Star
                            className={`w-3.75 h-3.75 ${
                              deck.isFavorite
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-400 hover:text-white"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Text */}
                      <div className="absolute bottom-2 left-3 m-2">
                        <p className="text-lg font-bold mb-1">{deck.name}</p>

                        <p className="text-sm font-medium">
                          {deck.pages} Pages
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 min-h-107 border border-[#68AD5C] flex justify-center items-center rounded-xl">
                  <p>No Decks Found!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5">
              {/* Pagination */}
              <div className="flex items-center gap-3 text-xl">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className="hover:text-white flex items-center disabled:opacity-40"
                >
                  <ChevronLeft className="text-xl" />
                  Prev
                </button>

                <span className="w-17 text-center border-2 border-[#3F3F3F] py-0.5 rounded-md">
                  {page}
                </span>

                <button
                  disabled={!nextPageKey}
                  onClick={() => {
                    if (!nextPageKey) return;

                    setPage((p) => p + 1);
                  }}
                  className="hover:text-white flex items-center disabled:opacity-40"
                >
                  Next
                  <ChevronRight />
                </button>
              </div>

              {/* Done */}
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
