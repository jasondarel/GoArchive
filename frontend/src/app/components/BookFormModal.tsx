"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImagePlus } from "lucide-react";
import { Book } from "./BookCard";

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
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editBook?.image_url || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editBook;

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: connect to API
    await new Promise((r) => setTimeout(r, 800)); // simulate
    setIsLoading(false);
    onSuccess();
  };

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1714]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-[#f5f0e8] w-full max-w-lg border border-[#d4b896]/30">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4b896]/20">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-3">
              Cover Image
            </label>
            <div
              className="relative border border-dashed border-[#d4b896]/50 hover:border-[#d4b896] transition-colors cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative h-48">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#1a1714]/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#f5f0e8]">
                      Change image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2">
                  <ImagePlus size={24} className="text-[#c4a882]" />
                  <p className="text-[0.75rem] text-[#c4a882]">
                    Click to upload cover image
                  </p>
                  <p className="text-[0.65rem] text-[#c4a882]/60">
                    JPG, PNG, WEBP — max 2MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
              Book Title
            </label>
            <input
              type="text"
              placeholder="Enter book title"
              value={form.title}
              onChange={update("title")}
              required
              className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7968] font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder="Write a short description..."
              value={form.description}
              onChange={update("description")}
              required
              rows={3}
              className="w-full bg-transparent border-b border-[#c4a882]/50 pb-2.5 text-[0.9375rem] text-[#1a1714] placeholder-[#c4a882]/50 focus:outline-none focus:border-[#1a1714] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-[0.72rem] tracking-[0.1em] uppercase font-medium text-[#8a7968] border border-[#d4b896]/40 hover:border-[#d4b896] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 text-[0.72rem] tracking-[0.1em] uppercase font-medium bg-[#1a1714] text-[#f5f0e8] hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isEdit ? "Update Book" : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
