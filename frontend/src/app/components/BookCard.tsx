"use client";

import { Heart, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface Book {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  is_favorited?: boolean;
  user?: { id: number; name: string };
  genre?: { id: number; name: string };
  author?: { id: number; name: string };
  year?: number | null;
  rating?: number | null;
  favorites_count?: number;
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

// Each burst particle: angle (deg) + distance (px) + slight size variation
const BURST_PARTICLES = [
  { angle: 0, dist: 28, size: 7 },
  { angle: 45, dist: 32, size: 5 },
  { angle: 90, dist: 26, size: 8 },
  { angle: 135, dist: 30, size: 5 },
  { angle: 180, dist: 28, size: 7 },
  { angle: 225, dist: 32, size: 5 },
  { angle: 270, dist: 26, size: 6 },
  { angle: 315, dist: 30, size: 5 },
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
  const [isBursting, setIsBursting] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  // Inject keyframes once into the document head
  useEffect(() => {
    const styleId = "book-card-heart-keyframes";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes heartPop {
        0%   { transform: scale(1); }
        30%  { transform: scale(1.7); }
        55%  { transform: scale(0.85); }
        75%  { transform: scale(1.25); }
        100% { transform: scale(1); }
      }
      @keyframes heartBurst {
        0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        60%  { opacity: 0.8; }
        100% { transform: translate(
                  calc(-50% + var(--tx)),
                  calc(-50% + var(--ty))
               ) scale(0.3);
               opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  function handleFavoriteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onFavoriteToggle?.(book.id);

    // Trigger pop
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 450);

    // Only burst when adding to favorites, not removing
    if (!book.is_favorited) {
      setIsBursting(true);
      setTimeout(() => setIsBursting(false), 600);
    }
  }

  return (
    <div className="group relative flex flex-col bg-[#f5f0e8] border border-[#d4b896]/20 hover:border-[#d4b896]/60 transition-all duration-300 hover:-translate-y-1">
      {/* Cover */}
      <div className="relative aspect-2/3 overflow-hidden bg-[#2c2420]">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={book.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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

        {/* Favorite button + burst container */}
        {user && (
          <div className="absolute top-3 right-3 w-6 h-6">
            {/* Burst particles */}
            {isBursting &&
              BURST_PARTICLES.map((p, i) => {
                const rad = (p.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * p.dist;
                const ty = Math.sin(rad) * p.dist;
                return (
                  <span
                    key={i}
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: p.size,
                      height: p.size,
                      pointerEvents: "none",
                      // pass CSS vars for the animation endpoint
                      ["--tx" as string]: `${tx}px`,
                      ["--ty" as string]: `${ty}px`,
                      animation: "heartBurst 0.55s ease-out forwards",
                      animationDelay: `${i * 18}ms`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width={p.size}
                      height={p.size}
                      style={{ display: "block" }}
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="#d4b896"
                      />
                    </svg>
                  </span>
                );
              })}

            {/* Main favorite button */}
            <button
              onClick={handleFavoriteClick}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-[#1a1714]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#1a1714]"
              style={{
                animation: isPopping
                  ? "heartPop 0.45s cubic-bezier(.36,.07,.19,.97) forwards"
                  : "none",
              }}
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
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-serif text-[0.95rem] text-[#1a1714] leading-snug mb-0.5 line-clamp-2 min-h-[1.5em] cursor-pointer hover:text-[#c4a882] transition-colors"
          onClick={() => router.push(`/catalog/${book.id}`)}
        >
          {book.title}
        </h3>
        {book.author && (
          <p className="text-[0.65rem] tracking-wider uppercase text-[#c4a882] mb-1.5 line-clamp-1">
            by {book.author.name}
          </p>
        )}
        <p className="text-[0.75rem] text-[#8a7968] font-light leading-relaxed line-clamp-3 min-h-[4.875em] flex-1">
          {book.description}
        </p>

        {/* Meta tags: genre, year, rating */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {book.genre && (
            <span className="text-[0.6rem] tracking-widest uppercase px-1.5 py-0.5 bg-[#d4b896]/20 text-[#8a7968] border border-[#d4b896]/30">
              {book.genre.name}
            </span>
          )}
          {book.year && (
            <span className="text-[0.6rem] tracking-widest text-[#c4a882]">
              {book.year}
            </span>
          )}
          {book.favorites_count !== undefined && book.favorites_count > 0 && (
            <span className="text-[0.6rem] text-[#c0735a] flex items-center gap-0.5 ml-1">
              <Heart size={9} className="fill-[#c0735a]" />{" "}
              {book.favorites_count}
            </span>
          )}
          {book.rating != null && (
            <span className="ml-auto text-[0.6rem] text-[#c4a882] font-medium">
              ★ {Number(book.rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* Admin actions */}
        {isAdmin() && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#d4b896]/20">
            <button
              onClick={() => onEdit?.(book)}
              className="flex items-center gap-1.5 text-[0.65rem] tracking-widest uppercase text-[#8a7968] hover:text-[#1a1714] transition-colors"
            >
              <Edit2 size={11} /> Edit
            </button>
            <button
              onClick={() => onDelete?.(book.id)}
              className="flex items-center gap-1.5 text-[0.65rem] tracking-widest uppercase text-[#c0735a] hover:text-[#a0532a] transition-colors ml-auto"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
