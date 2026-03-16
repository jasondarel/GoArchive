"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User, Mail, Shield } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-lg mx-auto">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] mb-1">
          Account
        </p>
        <h1 className="font-serif text-4xl text-[#1a1714]">My Profile</h1>
      </div>

      {/* Avatar + name card */}
      <div className="bg-[#1a1714] p-8 flex items-center gap-6 mb-1">
        <div className="w-16 h-16 rounded-full bg-[#d4b896]/20 border border-[#d4b896]/40 flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-2xl text-[#d4b896]">{initials}</span>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-[#f5f0e8] leading-tight">
            {user.name}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 text-[0.6rem] tracking-[0.12em] uppercase font-medium ${
              user.role === "admin"
                ? "bg-[#d4b896]/20 text-[#d4b896]"
                : "bg-white/10 text-white/50"
            }`}
          >
            <Shield size={9} />
            {user.role === "admin" ? "Administrator" : "Member"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-[#ede8de] border border-[#d4b896]/20 divide-y divide-[#d4b896]/20 mb-6">
        <div className="flex items-center gap-4 px-6 py-4">
          <User size={15} className="text-[#c4a882] flex-shrink-0" />
          <div>
            <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[#c4a882] mb-0.5">
              Full Name
            </p>
            <p className="text-[0.9rem] text-[#1a1714]">{user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-4">
          <Mail size={15} className="text-[#c4a882] flex-shrink-0" />
          <div>
            <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[#c4a882] mb-0.5">
              Email Address
            </p>
            <p className="text-[0.9rem] text-[#1a1714]">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-4">
          <Shield size={15} className="text-[#c4a882] flex-shrink-0" />
          <div>
            <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[#c4a882] mb-0.5">
              Role
            </p>
            <p className="text-[0.9rem] text-[#1a1714] capitalize">
              {user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 border border-[#c0735a]/40 text-[#c0735a] text-[0.72rem] tracking-[0.12em] uppercase font-medium hover:bg-[#c0735a] hover:text-[#f5f0e8] transition-colors duration-300 disabled:opacity-50"
      >
        <LogOut size={14} />
        {isLoggingOut ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  );
}
