"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const passwordRules = [
  { label: "8 characters minimum", test: (pw: string) => pw.length >= 8 },
  { label: "Uppercase letters (A-Z)", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Lowercase letters (a-z)", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "Numbers (0-9)", test: (pw: string) => /[0-9]/.test(pw) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (fieldErrors[key]) {
        setFieldErrors((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }
    };

  const passwordsMatch =
    form.password_confirmation.length > 0 &&
    form.password === form.password_confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setIsLoading(true);
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.password_confirmation,
      );
      router.push("/catalog");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        }
      )?.response;

      if (response?.status === 422 && response.data?.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(response.data.errors)) {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setFieldErrors(mapped);
      } else {
        setGeneralError(
          response?.data?.message || "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5f0e8]">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] bg-[#1a1714] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#d4b896 1px, transparent 1px), linear-gradient(90deg, #d4b896 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border border-[#d4b896]/20 pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full border border-[#d4b896]/10 pointer-events-none" />

        <div className="relative z-10">
          <span className="font-serif text-2xl text-[#f5f0e8] tracking-wider">
            Go<span className="text-[#d4b896]">·</span>Archive
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#d4b896] mb-2">
            Start your journey
          </p>
          <h2 className="font-serif text-[1.5rem] text-[#f5f0e8] leading-snug mb-8">
            Thousands of books
            <br />
            waiting for you
          </h2>

          {[
            {
              n: "01",
              title: "Register Account",
              desc: "Create a free account in seconds.",
            },
            {
              n: "02",
              title: "Explore Catalog",
              desc: "Discover books from various genres.",
            },
            {
              n: "03",
              title: "Save Favorites",
              desc: "Mark books you want to read.",
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-4 mb-6">
              <div className="w-8 h-8 rounded-full border border-[#d4b896] flex items-center justify-center text-[0.65rem] text-[#d4b896] font-medium flex-shrink-0">
                {step.n}
              </div>
              <div className="pt-1">
                <p className="text-[#f5f0e8] text-sm font-medium mb-0.5">
                  {step.title}
                </p>
                <p className="text-[#666] text-[0.78rem] font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <span className="font-serif text-2xl text-[#1a1714] tracking-wider">
              Go<span className="text-[#d4b896]">·</span>Archive
            </span>
          </div>

          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#c4a882] font-medium mb-2">
            Buat akun baru
          </p>
          <h1 className="font-serif text-4xl text-[#1a1714] leading-tight mb-2">
            Join Us
          </h1>
          <p className="text-sm text-[#8a7968] font-light mb-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1a1714] font-medium underline underline-offset-4"
            >
              Login
            </Link>
          </p>

          {generalError && (
            <div className="mb-6 px-4 py-3 bg-[#c0735a]/10 border-l-2 border-[#c0735a] text-[0.8rem] text-[#c0735a]">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={update("name")}
                required
                autoComplete="name"
                disabled={isLoading}
                className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors disabled:opacity-50"
              />
              {fieldErrors.name && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="name@email.com"
                value={form.email}
                onChange={update("email")}
                required
                autoComplete="email"
                disabled={isLoading}
                className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors disabled:opacity-50"
              />
              {fieldErrors.email && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.email}
                </p>
              )}
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
                  value={form.password}
                  onChange={update("password")}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 pr-8 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors disabled:opacity-50"
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

              {form.password.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(form.password);
                    return (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-[0.72rem] transition-colors ${
                          passed ? "text-[#7a9e7e]" : "text-[#c4a882]/70"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                            passed
                              ? "border-[#7a9e7e] bg-[#7a9e7e]"
                              : "border-[#c4a882]/40"
                          }`}
                        >
                          {passed && (
                            <Check
                              size={8}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
              {fieldErrors.password && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={update("password_confirmation")}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`w-full bg-transparent border-b pb-2.5 pr-8 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none transition-colors disabled:opacity-50 ${
                    form.password_confirmation.length > 0
                      ? passwordsMatch
                        ? "border-[#7a9e7e]"
                        : "border-[#c0735a]"
                      : "border-[#c4a882]/50 focus:border-[#1a1714]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c4a882] hover:text-[#1a1714] transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password_confirmation.length > 0 && !passwordsMatch && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  Password tidak cocok
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#1a1714] text-[#f5f0e8] py-3.5 text-[0.75rem] tracking-[0.15em] uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                "Register Account"
              )}
            </button>
          </form>

          <p className="text-[0.7rem] text-[#c4a882]/70 text-center mt-6 leading-relaxed">
            By registering, you agree to our
            <br />
            Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
