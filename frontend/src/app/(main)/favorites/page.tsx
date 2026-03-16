"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import BookCard, { Book } from "../../components/BookCard";
import BookFilter from "../../components/BookFilter";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";


const REMOVE_ANIMATION_MS = 500; // must match CSS transition duration below

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#ede8de] border border-[#d4b896]/10 animate-pulse">
      <div className="aspect-[2/3] bg-[#d4b896]/20" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-[#d4b896]/20 rounded w-3/4" />
        <div className="h-2 bg-[#d4b896]/20 rounded w-full" />
        <div className="h-2 bg-[#d4b896]/20 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function FavoritePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchParams.get("q")) params.search = searchParams.get("q")!;
      if (searchParams.get("sort")) params.sort = searchParams.get("sort")!;
      if (searchParams.get("genre")) params.genre = searchParams.get("genre")!;
      if (searchParams.get("year_min")) params.year_min = searchParams.get("year_min")!;
      if (searchParams.get("year_max")) params.year_max = searchParams.get("year_max")!;
      if (searchParams.get("rating_min")) params.rating_min = searchParams.get("rating_min")!;

      const res = await api.get("/favorites", { params });
      setBooks(res.data.data ?? res.data);
    } catch {
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchParams]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteToggle = async (bookId: number) => {
    // 1. Mark as removing — triggers fade-out transition
    setRemovingIds((prev) => new Set(prev).add(bookId));

    // 2. Fire API immediately (don't await UI)
    api.post(`/favorites/${bookId}`).catch(() => {
      // On failure: snap it back
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    });

    // 3. After animation completes, actually remove from list
    setTimeout(() => {
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }, REMOVE_ANIMATION_MS);
  };

  if (!user && !authLoading) return null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-1">
          Your collection
        </p>

        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-4xl text-[#1a1714]">Favorites</h1>

          <BookFilter />
        </div>

        {!isLoading && (
          <p className="text-sm text-[#8a7968] font-light mt-2">
            {/* Show count excluding ones currently being removed */}
            {books.length - removingIds.size}{" "}
            {books.length - removingIds.size === 1 ? "book" : "books"} saved
          </p>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#ede8de] flex items-center justify-center mb-4">
            <Heart size={28} className="text-[#c4a882]" />
          </div>
          <p className="font-serif text-xl text-[#1a1714] mb-1">
            No favorites yet
          </p>
          <p className="text-sm text-[#8a7968] font-light mb-6">
            Browse the catalog and save books you love.
          </p>
          <button
            onClick={() => router.push("/catalog")}
            className="px-6 py-2.5 bg-[#1a1714] text-[#f5f0e8] text-[0.72rem] tracking-[0.12em] uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {books.map((book) => {
            const isRemoving = removingIds.has(book.id);
            return (
              <div
                key={book.id}
                style={{
                  transition: `opacity ${REMOVE_ANIMATION_MS}ms ease, transform ${REMOVE_ANIMATION_MS}ms ease`,
                  opacity: isRemoving ? 0 : 1,
                  transform: isRemoving
                    ? "scale(0.93) translateY(6px)"
                    : "scale(1) translateY(0px)",
                  pointerEvents: isRemoving ? "none" : "auto",
                }}
              >
                <BookCard book={book} onFavoriteToggle={handleFavoriteToggle} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
