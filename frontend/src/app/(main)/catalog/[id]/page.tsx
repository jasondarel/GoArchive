"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Edit2, Trash2, Loader2 } from "lucide-react";
import { Book } from "../..//../components/BookCard";
import { useAuth } from "../../../../context/AuthContext";
import BookFormModal from "../../../components/BookFormModal";
import ConfirmModal from "../../../components/ConfirmModal";
import api from "@/lib/axios";
import { AnimatePresence } from "framer-motion";

const coverPalettes = [
  { bg: "#2c2420", accent: "#d4b896" },
  { bg: "#1e2a2a", accent: "#9ec4b8" },
  { bg: "#251f2e", accent: "#c4a8d4" },
  { bg: "#2a2218", accent: "#e8c87a" },
  { bg: "#1e2428", accent: "#8ab4d4" },
];

function PlaceholderCover({
  title,
  bookId,
}: {
  title: string;
  bookId: number;
}) {
  const palette = coverPalettes[bookId % coverPalettes.length];
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-4 relative"
      style={{ background: palette.bg }}
    >
      <div
        className="absolute inset-6 border opacity-10"
        style={{ borderColor: palette.accent }}
      />
      <span
        className="font-serif text-6xl font-bold relative z-10"
        style={{ color: palette.accent }}
      >
        {initials}
      </span>
      <span
        className="text-[0.65rem] tracking-[0.2em] uppercase relative z-10 text-center px-6 leading-relaxed"
        style={{ color: palette.accent, opacity: 0.6 }}
      >
        {title}
      </span>
    </div>
  );
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchBook = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/books/${params.id}`);
      setBook(res.data);
    } catch {
      setBook(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleFavoriteToggle = async () => {
    if (!book || favLoading) return;
    const isAdding = !book.is_favorited;

    // Optimistic update
    setBook((prev) =>
      prev
        ? {
            ...prev,
            is_favorited: !prev.is_favorited,
            favorites_count: (prev.favorites_count || 0) + (isAdding ? 1 : -1),
          }
        : prev,
    );

    setFavLoading(true);
    try {
      await api.post(`/favorites/${book.id}`);
    } catch {
      // Revert on failure
      setBook((prev) =>
        prev
          ? {
              ...prev,
              is_favorited: !prev.is_favorited,
              favorites_count:
                (prev.favorites_count || 0) + (isAdding ? -1 : 1),
            }
          : prev,
      );
    } finally {
      setFavLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/books/${book!.id}`);
      router.push("/catalog");
    } catch {
      alert("Failed to delete book. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-4 bg-[#d4b896]/20 rounded w-24 mb-10" />
        <div className="flex gap-10">
          <div className="w-64 aspect-2/3 bg-[#d4b896]/20 shrink-0" />
          <div className="flex-1 space-y-4 pt-4">
            <div className="h-3 bg-[#d4b896]/20 rounded w-24" />
            <div className="h-8 bg-[#d4b896]/20 rounded w-3/4" />
            <div className="h-3 bg-[#d4b896]/20 rounded w-full mt-6" />
            <div className="h-3 bg-[#d4b896]/20 rounded w-full" />
            <div className="h-3 bg-[#d4b896]/20 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto text-center py-32">
        <p className="font-serif text-2xl text-[#1a1714] mb-2">
          Book not found
        </p>
        <p className="text-sm text-[#8a7968] font-light mb-6">
          This book may have been removed.
        </p>
        <button
          onClick={() => router.push("/catalog")}
          className="px-6 py-2.5 bg-[#1a1714] text-[#f5f0e8] text-[0.72rem] tracking-[0.12em] uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#8a7968] hover:text-[#1a1714] text-[0.72rem] tracking-widest uppercase font-medium transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex flex-col sm:flex-row gap-10">
          {/* Cover */}
          <div className="w-full sm:w-64 shrink-0">
            <div className="aspect-2/3 overflow-hidden relative">
              {book.image_url ? (
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlaceholderCover title={book.title} bookId={book.id} />
              )}
            </div>

            {/* Actions below cover */}
            <div className="mt-4 space-y-2">
              {user && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 text-[0.72rem] tracking-widest uppercase font-medium transition-colors duration-300 border disabled:opacity-60 ${
                    book.is_favorited
                      ? "bg-[#1a1714] text-[#d4b896] border-[#1a1714]"
                      : "border-[#d4b896]/40 text-[#8a7968] hover:border-[#d4b896] hover:text-[#1a1714]"
                  }`}
                >
                  {favLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Heart
                      size={13}
                      className={book.is_favorited ? "fill-[#d4b896]" : ""}
                    />
                  )}
                  {book.is_favorited
                    ? "Saved to Favorites"
                    : "Add to Favorites"}
                </button>
              )}

              {isAdmin() && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEdit(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#d4b896]/40 text-[0.68rem] tracking-widest uppercase text-[#8a7968] hover:text-[#1a1714] hover:border-[#d4b896] transition-colors"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#c0735a]/30 text-[0.68rem] tracking-widest uppercase text-[#c0735a] hover:bg-[#c0735a] hover:text-[#f5f0e8] transition-colors"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-2">
              Book Details
            </p>
            <h1 className="font-serif text-4xl text-[#1a1714] leading-tight mb-4">
              {book.title}
            </h1>

            {/* Book Attributes */}
            <div className="flex items-center gap-0 mb-6 divide-x divide-[#d4b896]/30">
              {book.year && (
                <div className="pr-5">
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#b0a090] mb-0.5">
                    Year
                  </p>
                  <p className="text-sm font-medium text-[#1a1714]">
                    {book.year}
                  </p>
                </div>
              )}

              {book.genre?.name && (
                <div className={book.year ? "px-5" : "pr-5"}>
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#b0a090] mb-0.5">
                    Genre
                  </p>
                  <p className="text-sm font-medium text-[#1a1714]">
                    {book.genre.name}
                  </p>
                </div>
              )}

              {book.rating !== undefined && book.rating !== null && (
                <div
                  className={book.year || book.genre?.name ? "pl-5" : "pr-5"}
                >
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#b0a090] mb-0.5">
                    Rating
                  </p>
                  <p className="text-sm font-bold text-[#1a1714]">
                    {book.rating} <span className="text-[#c4a882]">★</span>
                  </p>
                </div>
              )}

              {book.favorites_count !== undefined && (
                <div
                  className={
                    book.year || book.genre?.name || book.rating !== undefined
                      ? "pl-5"
                      : "pr-5"
                  }
                >
                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#b0a090] mb-0.5">
                    Favorited By
                  </p>
                  <p className="text-sm font-medium text-[#1a1714]">
                    {book.favorites_count}{" "}
                    {book.favorites_count === 1 ? "Person" : "People"}
                  </p>
                </div>
              )}
            </div>

            <div className="w-12 h-px bg-[#d4b896] mb-6" />

            <p className="text-[0.9rem] text-[#5a4f42] font-light leading-relaxed">
              {book.description}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEdit && (
          <BookFormModal
            key="edit-details-modal"
            editBook={book}
            onClose={() => setShowEdit(false)}
            onSuccess={() => {
              setShowEdit(false);
              fetchBook();
            }}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </>
  );
}
