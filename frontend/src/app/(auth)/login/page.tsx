"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to API
  };

  return (
    <div className="min-h-screen flex bg-[#f5f0e8]">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] bg-[#1a1714] flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#d4b896 1px, transparent 1px), linear-gradient(90deg, #d4b896 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-[#d4b896]/20 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full border border-[#d4b896]/10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <span className="font-serif text-2xl text-[#f5f0e8] tracking-wider">
            Go<span className="text-[#d4b896]">·</span>Archive
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="font-serif text-[1.6rem] leading-relaxed text-[#f5f0e8] italic mb-4">
            "A reader lives a thousand lives before he dies."
          </blockquote>
          <cite className="text-[0.7rem] tracking-[0.15em] uppercase text-[#d4b896]/70 not-italic">
            — George R.R. Martin
          </cite>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <span className="font-serif text-2xl text-[#1a1714] tracking-wider">
              E<span className="text-[#d4b896]">·</span>Library
            </span>
          </div>
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] font-medium mb-2">
            Welcome Back
          </p>
          <h1 className="font-serif text-4xl text-[#1a1714] leading-tight mb-2">
            Login to
            <br />
            Your Account
          </h1>
          <p className="text-sm text-[#8a7968] font-light mb-10">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#1a1714] font-medium underline underline-offset-4"
            >
              Register
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 pr-8 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c4a882] hover:text-[#1a1714] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-4 bg-[#1a1714] text-[#f5f0e8] py-3.5 text-[0.75rem] tracking-[0.15em] uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300"
            >
              Masuk
            </button>
          </form>
          {/* Demo accounts
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#d4b896]/30" />
              <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#c4a882]">
                Demo
              </span>
              <div className="flex-1 h-px bg-[#d4b896]/30" />
            </div>
            <div className="bg-[#ede8de] border-l-2 border-[#d4b896] px-4 py-3.5 text-[0.78rem] text-[#5a4f42] leading-7">
              <p className="text-[0.65rem] tracking-[0.12em] uppercase text-[#1a1714] font-medium mb-1">
                Akun Demo
              </p>
              <p>Admin — admin@elibrary.com / Admin123</p>
              <p>User &nbsp;— user@elibrary.com / User1234</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
