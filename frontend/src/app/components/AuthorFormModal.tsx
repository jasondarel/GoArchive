"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/axios";

interface AuthorFormModalProps {
  onClose: () => void;
  onSuccess: (newAuthor: { id: number; name: string }) => void;
  initialName?: string;
}

export default function AuthorFormModal({
  onClose,
  onSuccess,
  initialName = "",
}: AuthorFormModalProps) {
  const [form, setForm] = useState({
    name: initialName,
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (fieldErrors[key]) {
        setFieldErrors((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!form.name.trim()) {
      setFieldErrors({ name: "Name is required" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/authors", form);
      onSuccess(response.data);
    } catch (err: unknown) {
      const resp = (
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

      if (resp?.status === 422 && resp.data?.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(resp.data.errors)) {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setFieldErrors(mapped);
      } else {
        setError(
          resp?.data?.message || "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors disabled:opacity-50";
  const labelClass =
    "block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2";

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1714]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.3,
        }}
        className="relative z-10 bg-[#f5f0e8] w-full max-w-sm border border-[#d4b896]/30 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4b896]/20 bg-[#f5f0e8]">
          <div>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#c4a882]">
              New Author
            </p>
            <h2 className="font-serif text-xl text-[#1a1714]">
              Add to catalog
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#c4a882] hover:text-[#1a1714] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="px-4 py-3 bg-[#c0735a]/10 border-l-2 border-[#c0735a] text-[0.8rem] text-[#c0735a]">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className={labelClass}>Author Name</label>
              <input
                type="text"
                placeholder="Enter author name"
                value={form.name}
                onChange={update("name")}
                required
                disabled={isLoading}
                className={inputClass}
                autoFocus
              />
              {fieldErrors.name && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className={labelClass}>Bio (Optional)</label>
              <textarea
                placeholder="Write a short biography..."
                value={form.bio}
                onChange={update("bio")}
                rows={3}
                disabled={isLoading}
                className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors resize-none disabled:opacity-50"
              />
              {fieldErrors.bio && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.bio}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 text-[0.72rem] tracking-widest uppercase font-medium text-[#8a7968] border border-[#d4b896]/40 hover:border-[#d4b896] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 text-[0.72rem] tracking-widest uppercase font-medium bg-[#1a1714] text-[#f5f0e8] hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Author"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
