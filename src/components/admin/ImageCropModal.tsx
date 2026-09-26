"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Crop, Loader2 } from "lucide-react";
import { getCroppedImg } from "@/utils/cropImage";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  title?: string;
  aspectRatio: number;
  aspectLabel?: string;
  showCircleGuide?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  queueInfo?: {
    current: number;
    total: number;
  };
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  fileName = "image.jpg",
  title = "Crop & Adjust Image",
  aspectRatio,
  aspectLabel,
  showCircleGuide = false,
  maxWidth = 1920,
  maxHeight = 1080,
  queueInfo,
  onApply,
  onCancel,
  onSkip,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setProcessing(false);
    }
  }, [isOpen, imageSrc]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, currentCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(currentCroppedAreaPixels);
    },
    []
  );

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        fileName,
        maxWidth,
        maxHeight
      );
      onApply(croppedFile);
    } catch (err) {
      console.error("Failed to crop image:", err);
      alert("Failed to process image crop. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] border border-border shadow-2xl max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Crop className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base sm:text-lg font-bold text-foreground truncate">
                  {title}
                </h3>
                {aspectLabel && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {aspectLabel}
                  </span>
                )}
              </div>
              {queueInfo && queueInfo.total > 1 && (
                <p className="text-xs text-muted-foreground font-medium">
                  Processing photo {queueInfo.current} of {queueInfo.total}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper Viewport */}
        <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 select-none overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            cropSize={undefined}
            style={{
              containerStyle: {
                background: "#0f172a",
              },
              cropAreaStyle: {
                border: "2px solid #F07F19",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
              },
            }}
          />

          {/* Optional Circular Avatar Preview Overlay for Headshot / Profile fields */}
          {showCircleGuide && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-white/70 shadow-xs flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs select-none">
                  Avatar Circle Preview
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 sm:p-5 bg-secondary/40 border-t border-border space-y-4 shrink-0">
          
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
              title="Zoom Out"
              className="w-8 h-8 rounded-lg bg-white border border-border text-foreground hover:bg-secondary flex items-center justify-center transition-colors shadow-2xs shrink-0"
            >
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[#F07F19]"
              />
              <span className="text-xs font-mono font-bold text-muted-foreground w-10 text-right shrink-0">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
              title="Zoom In"
              className="w-8 h-8 rounded-lg bg-white border border-border text-foreground hover:bg-secondary flex items-center justify-center transition-colors shadow-2xs shrink-0"
            >
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors border border-transparent"
              >
                Cancel
              </button>

              {onSkip && queueInfo && queueInfo.total > 1 && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-white border border-border rounded-xl transition-colors shadow-2xs"
                >
                  Skip This
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleApply}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 cursor-pointer min-w-[120px]"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Crop className="w-4 h-4" />
                  <span>{queueInfo && queueInfo.total > 1 && queueInfo.current < queueInfo.total ? "Apply & Next" : "Apply Crop"}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
