"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Upload, BookOpen, Heart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useState } from "react";

interface NavbarProps {
  onUploadClick?: () => void;
}

export default function Navbar({ onUploadClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const navLinks = [
    { href: "/catalog", label: "Catalog", icon: BookOpen },
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  // Debounce-free: update URL on every keystroke (fast enough for local filter)
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchValue(q);
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      router.replace(`/katalog?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <header className="sticky top-0 z-50 bg-[#f5f0e8] border-b border-[#d4b896]/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/katalog" className="flex-shrink-0">
          <span className="font-serif text-xl text-[#1a1714] tracking-wider">
            Go<span className="text-[#d4b896]">·</span>Archive
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium transition-colors ${
                  active
                    ? "text-[#1a1714] border-b-2 border-[#d4b896]"
                    : "text-[#8a7968] hover:text-[#1a1714]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search — only show on catalog page */}
          {pathname === "/katalog" && (
            <div className="hidden sm:flex items-center gap-2 bg-[#ede8de] px-3 py-2 w-52">
              <Search size={13} className="text-[#c4a882] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchValue}
                onChange={handleSearch}
                className="bg-transparent text-[0.8rem] text-[#1a1714] placeholder-[#c4a882] focus:outline-none w-full"
              />
            </div>
          )}

          {/* Upload button — admin only.
               During auth hydration render an invisible same-size placeholder
               so the navbar width doesn't shift once the user loads. */}
          {authLoading ? (
            <div
              className="w-[4.5rem] h-8 opacity-0 pointer-events-none"
              aria-hidden
            />
          ) : user && isAdmin() ? (
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 bg-[#1a1714] text-[#f5f0e8] px-4 py-2 text-[0.7rem] tracking-[0.1em] uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300"
            >
              <Upload size={13} />
              Upload
            </button>
          ) : null}

          {/* Avatar — placeholder keeps width reserved during hydration */}
          {authLoading ? (
            <div
              className="w-8 h-8 rounded-full bg-[#d4b896]/20 opacity-0 pointer-events-none"
              aria-hidden
            />
          ) : user ? (
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full bg-[#1a1714] flex items-center justify-center hover:bg-[#d4b896] transition-colors">
                <span className="text-[0.65rem] text-[#d4b896] hover:text-[#1a1714] font-medium uppercase">
                  {user.name.charAt(0)}
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex border-t border-[#d4b896]/20">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[0.58rem] tracking-[0.08em] uppercase transition-colors ${
                active ? "text-[#1a1714]" : "text-[#c4a882]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
        {user && isAdmin() && (
          <button
            onClick={onUploadClick}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[0.58rem] tracking-[0.08em] uppercase text-[#d4b896]"
          >
            <Upload size={16} />
            Upload
          </button>
        )}
      </div>
    </header>
  );
}
