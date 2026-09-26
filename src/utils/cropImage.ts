import { compressImage } from "./compressImage";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Loads an image from a URL or Object URL with crossOrigin enabled.
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/**
 * Returns a cropped File from an image source and pixel crop rectangle,
 * automatically compressed via compressImage.ts.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName = "cropped_image.jpg",
  maxWidth = 1920,
  maxHeight = 1080
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context for image cropping.");
  }

  // Set canvas size to the cropped dimensions
  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  // High quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the cropped region from the source image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          return reject(new Error("Canvas toBlob failed during crop."));
        }

        const cleanName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        const croppedFile = new File([blob], cleanName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        try {
          // Immediately pass through existing compressImage pipeline
          const compressed = await compressImage(croppedFile, maxWidth, maxHeight, 0.85);
          resolve(compressed);
        } catch {
          resolve(croppedFile);
        }
      },
      "image/jpeg",
      0.92
    );
  });
}

/**
 * Centralized unique file name generator for Supabase storage uploads.
 * Produces clean, collision-free names like 'prefix_1790438396467_i12ozn.jpg'.
 */
export function generateMediaFileName(prefix: string, fileOrExt: File | string): string {
  const ext = typeof fileOrExt === "string"
    ? (fileOrExt.includes(".") ? fileOrExt.split(".").pop() : fileOrExt)
    : (fileOrExt.name.split(".").pop() || "jpg");
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
}

