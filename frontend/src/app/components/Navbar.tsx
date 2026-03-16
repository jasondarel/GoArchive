"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, BookOpen, Heart, User, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";
import { motion } from "framer-motion";
import CatalogToolbar from "./CatalogToolbar";

interface NavbarProps {
  onUploadClick?: () => void;
}

export default function Navbar({ onUploadClick }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const navLinks = [
    { href: "/catalog", label: "Catalog", icon: BookOpen },
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f0e8] border-b border-[#d4b896]/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo + Nav links */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/catalog">
            <span className="font-serif text-xl text-[#1a1714] tracking-wider">
              Go<span className="text-[#d4b896]">·</span>Archive
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-1.5 text-[0.72rem] tracking-widest uppercase font-medium transition-colors ${
                    active
                      ? "text-[#1a1714]"
                      : "text-[#8a7968] hover:text-[#1a1714]"
                  }`}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b896]"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
          {/* Catalog toolbar — search + filters, only on catalog page */}
          {(pathname === "/catalog" || pathname === "/favorites") && (
            <Suspense>
              <CatalogToolbar />
            </Suspense>
          )}

          {/* Upload button — admin only */}
          {user && isAdmin() && (
            <button
              onClick={onUploadClick}
              className="hidden sm:flex items-center gap-2 bg-[#1a1714] text-[#f5f0e8] px-4 h-8 text-[0.7rem] tracking-widest uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 shrink-0"
            >
              <Upload size={13} />
              Upload
            </button>
          )}

          {/* Avatar (logged in) or Login button (logged out) */}
          {user ? (
            <Link href="/profile" className="shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#1a1714] flex items-center justify-center hover:bg-[#d4b896] transition-colors">
                <span className="text-[0.65rem] text-[#d4b896] hover:text-[#1a1714] font-medium uppercase">
                  {user.name.charAt(0)}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-[#1a1714] text-[#f5f0e8] px-4 h-9 text-[0.7rem] tracking-widest uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 shrink-0"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
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
