"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Book } from "./BookCard";
import api from "@/lib/axios";
import { StepperInput } from "./StepperInput";
import { SelectInput } from "./SelectInput";

interface Genre {
  id: number;
  name: string;
}

interface BookFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editBook?: Book | null;
}

export default function BookFormModal({
  onClose,
  onSuccess,
  editBook,
}: BookFormModalProps) {
  const [form, setForm] = useState({
    title: editBook?.title || "",
    description: editBook?.description || "",
    genre_id: editBook?.genre?.id?.toString() || "",
    year: editBook?.year?.toString() || "",
    rating: editBook?.rating?.toString() || "",
  });
  const [genres, setGenres] = useState<Genre[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editBook?.image_url || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editBook;

  useEffect(() => {
    api
      .get("/genres")
      .then((res) => setGenres(res.data))
      .catch(() => {});
  }, []);

  const update =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (fieldErrors[key]) {
        setFieldErrors((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }
    };

  const updateDirect = (key: keyof typeof form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      if (form.genre_id) data.append("genre_id", form.genre_id);
      if (form.year) data.append("year", form.year);
      if (form.rating) data.append("rating", form.rating);
      if (imageFile) data.append("image", imageFile);

      if (isEdit) {
        data.append("_method", "PUT");
        await api.post(`/books/${editBook!.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/books", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess();
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
        setError(
          response?.data?.message || "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const inputClass =
    "w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors disabled:opacity-50";
  const labelClass =
    "block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2";

  const genreOptions = genres.map((g) => ({
    value: g.id.toString(),
    label: g.name,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
        className="relative z-10 bg-[#f5f0e8] w-full max-w-lg border border-[#d4b896]/30 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4b896]/20 sticky top-0 bg-[#f5f0e8] z-10">
          <div>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#c4a882]">
              {isEdit ? "Edit Book" : "New Book"}
            </p>
            <h2 className="font-serif text-xl text-[#1a1714]">
              {isEdit ? "Update details" : "Add to catalog"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* General error */}
          {error && (
            <div className="px-4 py-3 bg-[#c0735a]/10 border-l-2 border-[#c0735a] text-[0.8rem] text-[#c0735a]">
              {error}
            </div>
          )}

          {/* Two-column: cover left, fields right */}
          <div className="flex gap-5 items-start">
            {/* Cover */}
            <div className="flex-shrink-0 w-28">
              <label className={labelClass}>Cover</label>
              <div
                className="relative aspect-[2/3] border border-dashed border-[#d4b896]/50 hover:border-[#d4b896] transition-colors cursor-pointer overflow-hidden bg-[#ede8de]"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1a1714]/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[0.6rem] tracking-[0.1em] uppercase text-[#f5f0e8] text-center px-1">
                        Change
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <ImagePlus size={20} className="text-[#c4a882]" />
                    <p className="text-[0.6rem] text-[#c4a882] text-center px-1 leading-snug">
                      Click to upload
                    </p>
                  </div>
                )}
              </div>
              <p className="text-[0.6rem] text-[#c4a882]/60 mt-1.5 leading-snug">
                JPG, PNG, WEBP · max 2MB
              </p>
              {fieldErrors.image && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1">
                  {fieldErrors.image}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-5">
              {/* Title */}
              <div>
                <label className={labelClass}>Book Title</label>
                <input
                  type="text"
                  placeholder="Enter book title"
                  value={form.title}
                  onChange={update("title")}
                  required
                  disabled={isLoading}
                  className={inputClass}
                />
                {fieldErrors.title && (
                  <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  placeholder="Write a short description..."
                  value={form.description}
                  onChange={update("description")}
                  required
                  rows={4}
                  disabled={isLoading}
                  className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors resize-none disabled:opacity-50"
                />
                {fieldErrors.description && (
                  <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className={labelClass}>Genre</label>
            <SelectInput
              value={form.genre_id}
              onChange={updateDirect("genre_id")}
              options={genreOptions}
              placeholder="— Select a genre —"
              disabled={isLoading}
              placement="top"
            />
            {fieldErrors.genre_id && (
              <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                {fieldErrors.genre_id}
              </p>
            )}
          </div>

          {/* Year + Rating row */}
          <div className="flex gap-5">
            {/* Year */}
            <div className="flex-1">
              <label className={labelClass}>Year</label>
              <StepperInput
                value={form.year}
                onChange={updateDirect("year")}
                placeholder="e.g. 2024"
                min={1000}
                max={new Date().getFullYear() + 1}
                step={1}
                disabled={isLoading}
                inputClass={inputClass}
              />
              {fieldErrors.year && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.year}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex-1">
              <label className={labelClass}>Rating / 5</label>
              <StepperInput
                value={form.rating}
                onChange={updateDirect("rating")}
                placeholder="e.g. 4.5"
                min={0}
                max={5}
                step={0.1}
                disabled={isLoading}
                inputClass={inputClass}
              />
              {fieldErrors.rating && (
                <p className="text-[0.72rem] text-[#c0735a] mt-1.5">
                  {fieldErrors.rating}
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
              className="flex-1 py-3 text-[0.72rem] tracking-[0.1em] uppercase font-medium text-[#8a7968] border border-[#d4b896]/40 hover:border-[#d4b896] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 text-[0.72rem] tracking-[0.1em] uppercase font-medium bg-[#1a1714] text-[#f5f0e8] hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Update Book"
              ) : (
                "Add Book"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
