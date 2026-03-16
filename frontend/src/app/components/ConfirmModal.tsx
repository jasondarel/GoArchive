"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative z-10 bg-[#f5f0e8] w-full max-w-sm border border-[#d4b896]/30 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4b896]/20 bg-[#f5f0e8]">
              <div className="flex items-center gap-2">
                {isDestructive && <AlertTriangle size={18} className="text-[#c0735a]" />}
                <h2 className="font-serif text-lg text-[#1a1714]">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#c4a882] hover:text-[#1a1714] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-[0.9375rem] text-[#8a7968] leading-relaxed">
                {message}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#d4b896]/20 bg-[#ede8de]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[0.75rem] tracking-[0.1em] uppercase text-[#8a7968] hover:text-[#1a1714] transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2 text-[0.75rem] tracking-[0.1em] uppercase text-[#f5f0e8] transition-colors ${
                  isDestructive
                    ? "bg-[#c0735a] hover:bg-[#a65d45]"
                    : "bg-[#1a1714] hover:bg-[#2c2420]"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
