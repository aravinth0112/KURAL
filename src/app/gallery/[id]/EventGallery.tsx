"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from "lucide-react";

interface EventGalleryProps {
  images: string[];
  eventTitle: string;
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(url);
}

export default function EventGallery({ images, eventTitle }: EventGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => ((prev! + 1) % images.length));
  }, [selectedIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => ((prev! - 1 + images.length) % images.length));
  }, [selectedIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentMedia = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section className="mt-16 pt-16 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
              Event Photo Gallery
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Memories captured during {eventTitle}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-secondary border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground w-fit">
          {images.length} {images.length === 1 ? "Photo" : "Photos"}
        </span>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {images.map((url, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-muted border border-border cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {isVideo(url) ? (
              <video
                src={url}
                muted
                playsInline
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <Image
                src={url}
                alt={`${eventTitle} memory ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            )}

            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                <ZoomIn className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && currentMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
          onClick={closeLightbox}
        >
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <span className="text-white/80 text-sm font-semibold tracking-wide bg-black/50 px-3.5 py-1.5 rounded-full border border-white/10 pointer-events-auto">
              Photo {selectedIndex + 1} of {images.length}
            </span>
            <button
              onClick={closeLightbox}
              aria-label="Close Lightbox"
              className="w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors pointer-events-auto border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 hidden sm:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 hidden sm:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Center Media Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo(currentMedia) ? (
              <video
                src={currentMedia}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="relative w-full h-[75vh] max-h-[85vh]">
                <Image
                  src={currentMedia}
                  alt={`${eventTitle} photo ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
