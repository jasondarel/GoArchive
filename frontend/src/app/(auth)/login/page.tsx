"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      setError(null);
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/catalog");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: { message?: string };
            headers?: { "retry-after"?: string };
          };
        }
      )?.response;
      const status = response?.status;
      const msg = response?.data?.message;

      if (status === 429) {
        const retryAfter = parseInt(
          response?.headers?.["retry-after"] || "60",
          10,
        );
        setError(
          `You are doing this too fast. Please try again in ${retryAfter}s.`,
        );
        setCountdown(retryAfter);
      } else if (status === 401 || status === 422) {
        setError(msg || "Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
            &quot;A reader lives a thousand lives before he dies.&quot;
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
              Go<span className="text-[#d4b896]">·</span>Archive
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
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#1a1714] font-medium underline underline-offset-4"
            >
              Register
            </Link>
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-[#c0735a]/10 border-l-2 border-[#c0735a] text-[0.8rem] text-[#c0735a]">
              {countdown !== null
                ? `You are doing this too fast. Please try again in ${countdown}s.`
                : error}
            </div>
          )}

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
                onChange={handleEmailChange}
                required
                autoComplete="email"
                disabled={isLoading}
                className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors disabled:opacity-50"
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
                  onChange={handlePasswordChange}
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-[#1a1714] text-[#f5f0e8] py-3.5 text-[0.75rem] tracking-[0.15em] uppercase font-medium hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
