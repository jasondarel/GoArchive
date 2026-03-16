"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import BookCard, { Book } from "../../components/BookCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

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
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.get("/favorites");
      // Backend returns a flat array of book objects with is_favorited: true
      setBooks(res.data.data ?? res.data);
    } catch {
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteToggle = async (bookId: number) => {
    // Optimistically remove from the list (unfavoriting is the only action here)
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    try {
      await api.post(`/favorites/${bookId}`);
    } catch {
      // Revert on failure
      fetchFavorites();
    }
  };

  if (!user && !authLoading) return null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-1">
          Your collection
        </p>
        <h1 className="font-serif text-4xl text-[#1a1714]">Favorites</h1>
        {!isLoading && (
          <p className="text-sm text-[#8a7968] font-light mt-2">
            {books.length} {books.length === 1 ? "book" : "books"} saved
          </p>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
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
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
