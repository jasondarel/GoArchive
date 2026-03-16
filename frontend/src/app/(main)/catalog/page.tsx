"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import BookCard, { Book } from "../../components/BookCard";
import BookFormModal from "../../components/BookFormModal";

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

// Dummy data for UI preview (replace with API call)
const DUMMY_BOOKS: Book[] = [
  {
    id: 1,
    title: "Laskar Pelangi",
    description:
      "Novel karya Andrea Hirata yang mengisahkan perjuangan anak-anak Belitung dalam menggapai mimpi mereka di tengah keterbatasan.",
    image_url: null,
  },
  {
    id: 2,
    title: "Bumi Manusia",
    description:
      "Karya monumental Pramoedya Ananta Toer yang menggambarkan pergolakan sosial di era kolonial Belanda melalui kisah Minke.",
    image_url: null,
  },
  {
    id: 3,
    title: "Atomic Habits",
    description:
      "Buku karya James Clear yang membahas cara membangun kebiasaan kecil yang memberikan perubahan luar biasa dalam hidup.",
    image_url: null,
  },
  {
    id: 4,
    title: "Clean Code",
    description:
      "Panduan dari Robert C. Martin tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.",
    image_url: null,
  },
  {
    id: 5,
    title: "The Pragmatic Programmer",
    description:
      "Buku klasik oleh Andrew Hunt dan David Thomas berisi tips pragmatis untuk menjadi programmer yang lebih baik.",
    image_url: null,
  },
  {
    id: 6,
    title: "Sapiens",
    description:
      "A Brief History of Humankind by Yuval Noah Harari — tracing the history of the human species from the Stone Age to the present.",
    image_url: null,
  },
];

export default function KatalogPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    // TODO: replace with API call
    // const res = await api.get(`/books?search=${searchQuery}`);
    // setBooks(res.data.data);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const filtered = DUMMY_BOOKS.filter((b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setBooks(filtered);
    setIsLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleFavoriteToggle = async (bookId: number) => {
    // TODO: call API
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, is_favorited: !b.is_favorited } : b,
      ),
    );
  };

  const handleDelete = async (bookId: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    // TODO: call API
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleEdit = (book: Book) => {
    setEditBook(book);
    setShowEdit(true);
  };

  return (
    <>
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-1">
          Browse our collection
        </p>
        <h1 className="font-serif text-4xl text-[#1a1714]">Catalog</h1>

        {searchQuery && (
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
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        /* Empty state */
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

      {/* Edit modal */}
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
