"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, SlidersHorizontal, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BookCard, { Book } from "../../components/BookCard";
import BookFormModal from "../../components/BookFormModal";
import api from "@/lib/axios";

// Injected once — custom scrollbar for the genre list
const GENRE_SCROLL_CLASS = "catalog-genre-scroll";
if (typeof document !== "undefined") {
  const styleId = "catalog-genre-scroll-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .${GENRE_SCROLL_CLASS}::-webkit-scrollbar { width: 4px; }
      .${GENRE_SCROLL_CLASS}::-webkit-scrollbar-track { background: transparent; margin-block: 4px; }
      .${GENRE_SCROLL_CLASS}::-webkit-scrollbar-thumb { background: #d4b896; border-radius: 0; }
      .${GENRE_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover { background: #b8956e; }
    `;
    document.head.appendChild(style);
  }
}

interface Genre {
  id: number;
  name: string;
}

// Skeleton card
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

export default function CatalogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  // Filter panel state
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [draft, setDraft] = useState({
    genre: searchParams.get("genre") || "",
    year_min: searchParams.get("year_min") || "",
    year_max: searchParams.get("year_max") || "",
    rating_min: searchParams.get("rating_min") || "",
  });

  const activeFilterCount = [
    searchParams.get("genre"),
    searchParams.get("year_min"),
    searchParams.get("year_max"),
    searchParams.get("rating_min"),
  ].filter(Boolean).length;

  useEffect(() => {
    api
      .get("/genres")
      .then((res) => setGenres(res.data))
      .catch(() => {});
  }, []);

  // Sync draft when panel opens
  useEffect(() => {
    if (filterOpen) {
      setDraft({
        genre: searchParams.get("genre") || "",
        year_min: searchParams.get("year_min") || "",
        year_max: searchParams.get("year_max") || "",
        rating_min: searchParams.get("rating_min") || "",
      });
    }
  }, [filterOpen, searchParams]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const pushParams = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.replace(`/catalog?${params.toString()}`);
    },
    [router, searchParams],
  );

  const applyFilters = () => {
    pushParams({
      genre: draft.genre,
      year_min: draft.year_min,
      year_max: draft.year_max,
      rating_min: draft.rating_min,
    });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    const cleared = { genre: "", year_min: "", year_max: "", rating_min: "" };
    setDraft(cleared);
    pushParams(cleared);
    setFilterOpen(false);
  };

  const fetchBooks = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const [booksRes, favoritedIds] = await Promise.all([
      api.get("/books", {
        params: searchQuery ? { search: searchQuery } : {},
      }),
      user
        ? api.get("/favorites")
            .then((res) => {
              const data: Book[] = res.data.data ?? res.data;
              return new Set(data.map((b) => b.id));
            })
            .catch(() => new Set<number>())
        : Promise.resolve(new Set<number>()),
    ]);

      const raw: Book[] = booksRes.data.data ?? booksRes.data;
      setBooks(raw.map((b) => ({ ...b, is_favorited: favoritedIds.has(b.id) })));
    } catch {
      setError("Failed to load books. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, user]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const handler = () => fetchBooks();
    window.addEventListener("book-added", handler);
    return () => window.removeEventListener("book-added", handler);
  }, [fetchBooks]);

  const handleFavoriteToggle = async (bookId: number) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, is_favorited: !b.is_favorited } : b,
      ),
    );
    try {
      await api.post(`/favorites/${bookId}`);
    } catch {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, is_favorited: !b.is_favorited } : b,
        ),
      );
    }
  };

  const handleDelete = async (bookId: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    try {
      await api.delete(`/books/${bookId}`);
    } catch {
      fetchBooks();
    }
  };

  const handleEdit = (book: Book) => {
    setEditBook(book);
    setShowEdit(true);
  };

  const labelClass =
    "block text-[0.6rem] tracking-[0.14em] uppercase text-[#8a7968] font-medium mb-2";
  const inputClass =
    "w-full bg-[#ede8de] px-3 py-2 text-[0.8rem] text-[#1a1714] placeholder-[#c4a882] focus:outline-none focus:ring-1 focus:ring-[#d4b896] transition-all";

  return (
    <>
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-1">
          Browse our collection
        </p>

        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-4xl text-[#1a1714]">Catalog</h1>

          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-[0.7rem] tracking-[0.1em] uppercase font-medium transition-colors duration-200 border ${
                filterOpen || activeFilterCount > 0
                  ? "bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]"
                  : "bg-transparent text-[#8a7968] border-[#d4b896]/50 hover:border-[#d4b896] hover:text-[#1a1714]"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#d4b896] text-[#1a1714] text-[0.55rem] font-bold leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#f5f0e8] border border-[#d4b896]/50 shadow-[0_12px_40px_rgba(26,23,20,0.15)] z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4b896]/20">
                  <p className="text-[0.65rem] tracking-[0.15em] uppercase font-medium text-[#1a1714]">
                    Filters
                  </p>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="text-[#c4a882] hover:text-[#1a1714] transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {/* Genre */}
                  <div>
                    <label className={labelClass}>Genre</label>
                    <div
                      className={`max-h-36 overflow-y-auto space-y-0.5 pr-1 ${GENRE_SCROLL_CLASS}`}
                      style={
                        {
                          scrollbarWidth: "thin",
                          scrollbarColor: "#d4b896 transparent",
                        } as React.CSSProperties
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, genre: "" }))}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[0.8rem] transition-colors ${
                          draft.genre === ""
                            ? "bg-[#1a1714] text-[#f5f0e8]"
                            : "text-[#3d342c] hover:bg-[#ede8de]"
                        }`}
                      >
                        <span>All genres</span>
                        {draft.genre === "" && (
                          <Check size={11} className="text-[#c4a882]" />
                        )}
                      </button>
                      {genres.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              genre:
                                d.genre === g.id.toString()
                                  ? ""
                                  : g.id.toString(),
                            }))
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 text-[0.8rem] transition-colors ${
                            draft.genre === g.id.toString()
                              ? "bg-[#1a1714] text-[#f5f0e8]"
                              : "text-[#3d342c] hover:bg-[#ede8de]"
                          }`}
                        >
                          <span>{g.name}</span>
                          {draft.genre === g.id.toString() && (
                            <Check size={11} className="text-[#c4a882]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#d4b896]/20" />

                  {/* Year range */}
                  <div>
                    <label className={labelClass}>Year range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="From"
                        value={draft.year_min}
                        min={1000}
                        max={new Date().getFullYear()}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, year_min: e.target.value }))
                        }
                        className={inputClass}
                      />
                      <span className="text-[#c4a882] text-sm flex-shrink-0">
                        —
                      </span>
                      <input
                        type="number"
                        placeholder="To"
                        value={draft.year_max}
                        min={1000}
                        max={new Date().getFullYear()}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, year_max: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#d4b896]/20" />

                  {/* Rating threshold */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelClass + " mb-0"}>
                        Min. rating
                      </label>
                      <span className="text-[0.72rem] text-[#8a7968]">
                        {draft.rating_min
                          ? `${draft.rating_min}★ and above`
                          : "Any"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {["1", "2", "3", "4", "4.5"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              rating_min: d.rating_min === val ? "" : val,
                            }))
                          }
                          className={`flex-1 py-1.5 text-[0.72rem] font-medium border transition-colors ${
                            draft.rating_min === val
                              ? "bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]"
                              : "text-[#8a7968] border-[#d4b896]/40 hover:border-[#d4b896] hover:text-[#1a1714]"
                          }`}
                        >
                          {val}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-[#d4b896]/20">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 text-[0.68rem] tracking-[0.1em] uppercase font-medium text-[#8a7968] hover:text-[#1a1714] transition-colors border-r border-[#d4b896]/20"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 py-3 text-[0.68rem] tracking-[0.1em] uppercase font-medium bg-[#1a1714] text-[#f5f0e8] hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {searchQuery && !isLoading && (
          <p className="text-sm text-[#8a7968] mt-2 font-light">
            Showing results for{" "}
            <span className="text-[#1a1714] font-medium">"{searchQuery}"</span>{" "}
            — {books.length} {books.length === 1 ? "book" : "books"} found
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
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-[#ede8de] flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-[#c4a882]" />
          </div>
          <p className="font-serif text-xl text-[#1a1714] mb-1">
            Something went wrong
          </p>
          <p className="text-sm text-[#8a7968] font-light mb-4">{error}</p>
          <button
            onClick={fetchBooks}
            className="text-[0.65rem] tracking-[0.15em] uppercase border border-[#d4b896]/50 px-4 py-2 text-[#8a7968] hover:bg-[#d4b896]/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-[#ede8de] flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-[#c4a882]" />
          </div>
          <p className="font-serif text-xl text-[#1a1714] mb-1">
            No books found
          </p>
          <p className="text-sm text-[#8a7968] font-light">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different keyword.`
              : "The catalog is empty. Check back later."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onFavoriteToggle={handleFavoriteToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showEdit && editBook && (
        <BookFormModal
          editBook={editBook}
          onClose={() => {
            setShowEdit(false);
            setEditBook(null);
          }}
          onSuccess={() => {
            setShowEdit(false);
            setEditBook(null);
            fetchBooks();
          }}
        />
      )}
    </>
  );
}
