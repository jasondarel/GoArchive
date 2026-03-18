"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import BookCard, { Book } from "../../components/BookCard";
import BookFormModal from "../../components/BookFormModal";
import ConfirmModal from "../../components/ConfirmModal";
import BookFilter from "../../components/BookFilter";
import api from "@/lib/axios";
import { AnimatePresence } from "framer-motion";

// Skeleton card
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#ede8de] border border-[#d4b896]/10 animate-pulse">
      <div className="aspect-2/3 bg-[#d4b896]/20" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-[#d4b896]/20 rounded w-3/4" />
        <div className="h-2 bg-[#d4b896]/20 rounded w-full" />
        <div className="h-2 bg-[#d4b896]/20 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function CatalogPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      }
    >
      <CatalogPage />
    </Suspense>
  );
}

function CatalogPage() {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchParams.get("sort")) params.sort = searchParams.get("sort")!;
      if (searchParams.get("genre")) params.genre = searchParams.get("genre")!;
      if (searchParams.get("year_min"))
        params.year_min = searchParams.get("year_min")!;
      if (searchParams.get("year_max"))
        params.year_max = searchParams.get("year_max")!;
      if (searchParams.get("rating_min"))
        params.rating_min = searchParams.get("rating_min")!;

      const [booksRes, favoritedIds] = await Promise.all([
        api.get("/books", { params }),
        user
          ? api
              .get("/favorites")
              .then((res) => {
                const data: Book[] = res.data.data ?? res.data;
                return new Set(data.map((b) => b.id));
              })
              .catch(() => new Set<number>())
          : Promise.resolve(new Set<number>()),
      ]);

      const raw: Book[] = booksRes.data.data ?? booksRes.data;
      setBooks(
        raw.map((b) => ({ ...b, is_favorited: favoritedIds.has(b.id) })),
      );
    } catch {
      setError("Failed to load books. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user, searchParams]);

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

  const handleDelete = (bookId: number) => {
    setBookToDelete(bookId);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    const bookId = bookToDelete;
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

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-1">
          Browse our collection
        </p>

        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-4xl text-[#1a1714]">Catalog</h1>

          <BookFilter />
        </div>

        {searchQuery && !isLoading && (
          <p className="text-sm text-[#8a7968] mt-2 font-light">
            Showing results for{" "}
            <span className="text-[#1a1714] font-medium">&quot;{searchQuery}&quot;</span>{" "}
            — {filteredBooks.length}{" "}
            {filteredBooks.length === 1 ? "book" : "books"} found
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
          {filteredBooks.map((book) => (
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

      <AnimatePresence>
        {showEdit && editBook && (
          <BookFormModal
            key="edit-modal"
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
      </AnimatePresence>

      <ConfirmModal
        isOpen={bookToDelete !== null}
        onClose={() => setBookToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </>
  );
}
