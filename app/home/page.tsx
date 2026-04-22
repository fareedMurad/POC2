"use client";

import Header from "@/components/Header";
import PresentationCard from "@/components/PresentationCard";
import { Star, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getPagedPresentations,
  getPagedFavoritePresentations,
  addToPresentationFavorites,
  removeFromPresentationFavorites,
  getAppInstallation,
} from "@/lib/apiServices";

interface Presentation {
  purpose: any;
  presentationType: any;
  maxDuration: number;
  presentationId: string;
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
}

export default function PresentationsPage() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>("");
  const [userName, setUserName] = useState<string | null>("");

  const [pageKey, setPageKey] = useState<string>(""); // current page key
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<string[]>([]); // stack

  const fetchPresentations = async (
    key: string = "",
    direction: "next" | "prev" | "init" = "init",
    silent = false
  ) => {
    try {
      if (!silent) setLoading(true);

      const result = showFavoritesOnly
        ? await getPagedFavoritePresentations(key)
        : await getPagedPresentations(key);

      if (result.operationSuccessful) {
        setPresentations(result.presentationDTOList || []);

        // ✅ store next page key from API
        setNextPageKey(result.pageKey || null);

        // ✅ manage history stack
        if (direction === "next") {
          setPageHistory((prev) => [...prev, pageKey]);
          setCurrentPage((prev) => prev + 1);
        } else if (direction === "prev") {
          setPageHistory((prev) => prev.slice(0, -1));
        } else {
          // init case
          setCurrentPage(1);
        }

        // ✅ update current key
        setPageKey(key);
      } else {
        setServerError(result.errorMessage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations("");
    setPageHistory([]);
  }, [showFavoritesOnly]);

  const token = localStorage.getItem("authToken");
  const fetchAppInstallation = async () => {
    try {
      const result = await getAppInstallation();

      const app = result?.appInstallation;

      const firstName = app.name.split(" ")[0] ?? app.name;

      if (app) {
        setUserName(firstName);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) fetchAppInstallation();
  }, [token]);

  // ✅ Filter Logic
  const filteredPresentations = showFavoritesOnly
    ? presentations.filter((p) => p.isFavorite)
    : presentations;

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    // optimistic UI
    setPresentations((prev) =>
      prev.map((p) =>
        p.presentationId === id ? { ...p, isFavorite: !isFavorite } : p
      )
    );

    try {
      if (isFavorite) {
        await removeFromPresentationFavorites(id);
      } else {
        await addToPresentationFavorites(id);
      }

      fetchPresentations(pageKey);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white">
      {/* Header Section */}
      <Header />
      {loading ? (
        <div className="text-center py-20 text-gray-400 mt-40">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#68AD5C]" />
          {showFavoritesOnly
            ? "Loading Favorite presentations..."
            : "Loading presentations..."}
        </div>
      ) : (
        <div className="px-6 py-4 md:px-10 md:py-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <p className="mb-2 text-xl md:text-2xl font-semibold">
                Welcome, {userName ? userName : "Alex"}!
              </p>
              <h1 className="text-2xl md:text-[32px] font-semibold mt-auto md:mt-3">
                Manage Your Presentations
              </h1>
              <p className="text-[#BBBBBB] mt-3 text-lg">
                View, practice and refine your presentations with intelligent
                feedback
              </p>
            </div>

            <div className="md:flex gap-2 md:gap-4 mt-6 md:mt-0">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex w-full md:w-auto items-center gap-2 px-2 md:px-5 py-1.5 rounded-lg border transition cursor-pointer focus:outline-none
          ${
            showFavoritesOnly
              ? "bg-[#68AD5C] text-white"
              : "border-[#68AD5C] text-[#68AD5C] hover:bg-[#68AD5C] hover:text-white"
          }
        `}
              >
                <Star
                  fill={showFavoritesOnly ? "currentColor" : "none"}
                  strokeWidth={showFavoritesOnly ? 0 : 2}
                  className="w-5 h-5"
                />
                Favorites
              </button>

              <Link href={"/presentationwizard"} className="focus:outline-none">
                <button className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 bg-[#68AD5C] hover:bg-green-600 px-2 md:px-5 py-2 rounded-lg transition font-medium focus:outline-none cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Create New Presentation
                </button>
              </Link>
            </div>
          </div>
          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {filteredPresentations.length > 0 ? (
              filteredPresentations.map((presentation) => (
                <PresentationCard
                  key={presentation.presentationId}
                  presentationId={presentation.presentationId}
                  title={presentation.title}
                  presentationType={presentation.presentationType}
                  purpose={presentation.purpose}
                  duration={presentation.maxDuration}
                  isFavorite={presentation.isFavorite}
                  onToggleFavorite={() =>
                    toggleFavorite(
                      presentation.presentationId,
                      presentation.isFavorite
                    )
                  }
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-[#BBBBBB] py-20 my-16 w-1/2 mx-auto border rounded-lg">
                {serverError
                  ? serverError
                  : showFavoritesOnly
                  ? "No Favorite Presentations Found"
                  : "No Presentations Found"}
              </div>
            )}
          </div>
          {/* Pagination */}
          {(nextPageKey || pageHistory.length > 0) && (
            <div className="flex justify-center items-center gap-6 mt-12">
              {/* Previous */}
              <button
                disabled={pageHistory.length === 0}
                onClick={() => {
                  const prevKey = pageHistory[pageHistory.length - 1] || "";
                  fetchPresentations(prevKey, "prev");
                }}
                className={`transition flex font-medium items-center px-2 text-[23px] py-3 rounded-lg ${
                  pageHistory.length === 0
                    ? "text-[#BBBBBB] cursor-not-allowed"
                    : "text-white cursor-pointer"
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
                    fetchPresentations(nextPageKey, "next");
                  }
                }}
                className={`px-2 py-3 font-medium text-[23px] rounded-lg transition flex items-center ${
                  !nextPageKey
                    ? "text-[#BBBBBB] cursor-not-allowed"
                    : "text-white cursor-pointer"
                }`}
              >
                Next <ChevronRight />
              </button>
            </div>
          )}{" "}
        </div>
      )}
    </div>
  );
}
