"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Check, ArrowUpDown } from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { motion, AnimatePresence } from "framer-motion";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "title_asc", label: "Title — A to Z" },
  { value: "title_desc", label: "Title — Z to A" },
  { value: "year_desc", label: "Year — Newest first" },
  { value: "year_asc", label: "Year — Oldest first" },
  { value: "rating_desc", label: "Rating — Highest first" },
  { value: "rating_asc", label: "Rating — Lowest first" },
];

export default function CatalogToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearch();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const activeSort = searchParams.get("sort") || "";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
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
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const applySort = (value: string) => {
    pushParams({ sort: value });
    setSortOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Search input */}
      <div className="hidden sm:flex items-center gap-2 bg-[#ede8de] px-3 py-2 w-52">
        <Search size={13} className="text-[#c4a882] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={handleSearch}
          className="bg-transparent text-[0.8rem] text-[#1a1714] placeholder-[#c4a882] focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#c4a882] hover:text-[#1a1714] transition-colors flex-shrink-0"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Sort button */}
      <div ref={sortRef} className="relative">
        <button
          onClick={() => setSortOpen((o) => !o)}
          title="Sort"
          className={`flex items-center justify-center w-9 h-9 border transition-colors duration-200 ${
            sortOpen || activeSort
              ? "bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]"
              : "bg-transparent text-[#8a7968] border-[#d4b896]/50 hover:border-[#d4b896] hover:text-[#1a1714]"
          }`}
        >
          <ArrowUpDown size={14} />
        </button>

        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 bg-[#f5f0e8] border border-[#d4b896]/50 shadow-[0_12px_40px_rgba(26,23,20,0.15)] z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4b896]/20">
                <p className="text-[0.65rem] tracking-[0.15em] uppercase font-medium text-[#1a1714]">
                  Sort by
                </p>
                <button
                  onClick={() => setSortOpen(false)}
                  className="text-[#c4a882] hover:text-[#1a1714] transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="p-2 space-y-0.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => applySort(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[0.8rem] transition-colors ${
                      activeSort === opt.value
                        ? "bg-[#1a1714] text-[#f5f0e8]"
                        : "text-[#3d342c] hover:bg-[#ede8de]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {activeSort === opt.value && (
                      <Check size={11} className="text-[#c4a882]" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
