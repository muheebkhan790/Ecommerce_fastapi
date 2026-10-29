"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductImageUrl } from "../../../lib/utils";

export default function ImageLightbox({ isOpen, onClose, images = [], initialIndex = 0, title = "" }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Filter out any falsy values and normalize
  const validImages = Array.isArray(images) && images.length > 0
    ? images.filter(Boolean)
    : [];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  // Handle ESC key and Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || validImages.length === 0) return null;

  const currentRawUrl = validImages[currentIndex] || validImages[0];
  const fullImageUrl = getProductImageUrl(currentRawUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Container preventing background click propagation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl p-4 sm:p-6 overflow-hidden"
      >
        {/* Top bar with title, counter & close button */}
        <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-white">
          <div className="flex items-center gap-2 max-w-[70%]">
            <span className="text-orange-500 font-bold">🔍</span>
            <h3 className="text-sm font-bold truncate text-slate-100">{title || "Product Image"}</h3>
            {validImages.length > 1 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300">
                {currentIndex + 1} / {validImages.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="relative w-full flex-1 min-h-[300px] max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
          <img
            src={fullImageUrl}
            alt={title || `Product image ${currentIndex + 1}`}
            className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg transition-transform duration-300"
          />

          {/* Navigation Arrows for multi-images */}
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-orange-600 text-white flex items-center justify-center text-lg shadow-lg border border-slate-700/60 transition-all cursor-pointer active:scale-95"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-orange-600 text-white flex items-center justify-center text-lg shadow-lg border border-slate-700/60 transition-all cursor-pointer active:scale-95"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnails row if multiple images */}
        {validImages.length > 1 && (
          <div className="flex items-center gap-2 mt-4 max-w-full overflow-x-auto py-1 px-2">
            {validImages.map((img, idx) => {
              const thumbUrl = getProductImageUrl(img);
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "border-orange-500 scale-105 shadow-md shadow-orange-500/20"
                      : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
