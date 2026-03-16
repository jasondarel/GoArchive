"use client";

import { Suspense, useState } from "react";
import Navbar from "../components/Navbar";
import BookFormModal from "../components/BookFormModal";
import { SearchProvider } from "@/context/SearchContext";
import { AnimatePresence } from "framer-motion";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <SearchProvider>
      <div className="min-h-screen bg-[#f5f0e8]">
        <Suspense>
          <Navbar onUploadClick={() => setShowUploadModal(true)} />
        </Suspense>
        <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>

        <AnimatePresence>
          {showUploadModal && (
            <BookFormModal
              key="upload-modal"
              onClose={() => setShowUploadModal(false)}
              onSuccess={() => {
                setShowUploadModal(false);
                window.dispatchEvent(new CustomEvent("book-added"));
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </SearchProvider>
  );
}
