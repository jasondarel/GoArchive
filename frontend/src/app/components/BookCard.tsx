"use client";

import { Heart, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export interface Book {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  is_favorited?: boolean;
  user?: { id: number; name: string };
}

interface BookCardProps {
  book: Book;
  onFavoriteToggle?: (bookId: number) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: number) => void;
}

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
      className="w-full h-full flex flex-col items-center justify-center gap-3 relative"
      style={{ background: palette.bg }}
    >
      <div
        className="absolute inset-4 border opacity-10"
        style={{ borderColor: palette.accent }}
      />
      <span
        className="font-serif text-3xl font-bold relative z-10"
        style={{ color: palette.accent }}
      >
        {initials}
      </span>
      <span
        className="text-[0.6rem] tracking-[0.2em] uppercase relative z-10 text-center px-4 leading-relaxed"
        style={{ color: palette.accent, opacity: 0.6 }}
      >
        {title}
      </span>
    </div>
  );
}

export default function BookCard({
  book,
  onFavoriteToggle,
  onEdit,
  onDelete,
}: BookCardProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  return (
    <div className="group relative flex flex-col bg-[#f5f0e8] border border-[#d4b896]/20 hover:border-[#d4b896]/60 transition-all duration-300 hover:-translate-y-1">
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#2c2420]">
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderCover title={book.title} bookId={book.id} />
        )}

        {/* Hover overlay — navigate to detail */}
        <div
          className="absolute inset-0 bg-[#1a1714]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
          onClick={() => router.push(`/catalog/${book.id}`)}
        >
          <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#f5f0e8] border border-[#d4b896]/50 px-4 py-2 hover:bg-[#d4b896]/20 transition-colors">
            View Details
          </span>
        </div>

        {/* Favorite button */}
        {user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(book.id);
            }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-[#1a1714]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#1a1714]"
            aria-label={
              book.is_favorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              size={14}
              className={
                book.is_favorited
                  ? "fill-[#d4b896] text-[#d4b896]"
                  : "text-[#f5f0e8]"
              }
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-serif text-[0.95rem] text-[#1a1714] leading-snug mb-1.5 line-clamp-2 cursor-pointer hover:text-[#c4a882] transition-colors"
          onClick={() => router.push(`/catalog/${book.id}`)}
        >
          {book.title}
        </h3>
        <p className="text-[0.75rem] text-[#8a7968] font-light leading-relaxed line-clamp-2 flex-1">
          {book.description}
        </p>

        {/* Admin actions */}
        {isAdmin() && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#d4b896]/20">
            <button
              onClick={() => onEdit?.(book)}
              className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.1em] uppercase text-[#8a7968] hover:text-[#1a1714] transition-colors"
            >
              <Edit2 size={11} /> Edit
            </button>
            <button
              onClick={() => onDelete?.(book.id)}
              className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.1em] uppercase text-[#c0735a] hover:text-[#a0532a] transition-colors ml-auto"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
