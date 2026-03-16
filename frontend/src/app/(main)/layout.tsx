"use client";

import { Suspense, useState } from "react";
import Navbar from "../components/Navbar";
import BookFormModal from "../components/BookFormModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Suspense>
        <Navbar onUploadClick={() => setShowUploadModal(true)} />
      </Suspense>
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>

      {showUploadModal && (
        <BookFormModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            // TODO: trigger catalog refresh
          }}
        />
      )}
    </div>
  );
}
