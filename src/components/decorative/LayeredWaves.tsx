import React from "react";

interface LayeredWavesProps {
  className?: string;
  heightClass?: string;
}

/**
 * Shared vector layered wave component matching the brand orange palette:
 * - Layer 1 (back, lightest): pale cream (#FDEEDD, opacity 0.85)
 * - Layer 2: light orange (#FBC896, opacity 0.90)
 * - Layer 3: medium orange (#FFA875, opacity 0.95)
 * - Layer 4 (front, boldest): solid brand orange (#F07F19, opacity 1.0)
 */
export function LayeredWaves({
  className = "",
  heightClass = "h-[220px] sm:h-[280px] md:h-[350px] lg:h-[420px] xl:h-[450px]",
}: LayeredWavesProps) {
  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 1440 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={`w-full block ${heightClass}`}
      >
        {/* Layer 1 (back, lightest): pale cream tint derived from #F07F19 (#FDEEDD), lowest opacity, broad flowing crest */}
        <path
          d="M0,180 C240,270 480,60 720,135 C960,210 1200,90 1440,165 L1440,480 L0,480 Z"
          fill="#FDEEDD"
          opacity="0.85"
        />

        {/* Layer 2: light warm orange (#FBC896), medium opacity, offset rolling curve */}
        <path
          d="M0,255 C300,165 600,330 900,225 C1100,165 1300,270 1440,240 L1440,480 L0,480 Z"
          fill="#FBC896"
          opacity="0.9"
        />

        {/* Layer 3: medium orange (#FFA875), higher opacity, staggered trough and crest */}
        <path
          d="M0,315 C280,390 560,270 840,330 C1080,375 1260,285 1440,315 L1440,480 L0,480 Z"
          fill="#FFA875"
          opacity="0.95"
        />

        {/* Layer 4 (front, boldest): solid brand orange #F07F19, full opacity, resting along the bottom */}
        <path
          d="M0,375 C320,330 640,420 960,360 C1150,330 1300,390 1440,360 L1440,480 L0,480 Z"
          fill="#F07F19"
          opacity="1"
        />
      </svg>
    </div>
  );
}

export default LayeredWaves;
