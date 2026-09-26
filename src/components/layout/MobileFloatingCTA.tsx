"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X, Sparkles } from "lucide-react";

export function MobileFloatingCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("kural_mobile_cta_dismissed")) {
      setDismissed(true);
      return;
    }

    const onScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("kural_mobile_cta_dismissed", "1");
    }
  };

  if (!visible || dismissed || pathname.startsWith("/adminnadhan") || pathname === "/join") {
    return null;
  }

  return (
    <aside aria-label="Quick Join Action" className="md:hidden fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center bg-primary text-white pl-4 pr-2 py-2.5 rounded-full shadow-xl shadow-primary/30 border border-white/20 gap-2">
        <Link
          href="/join"
          className="flex items-center gap-1.5 font-bold text-xs tracking-wide focus:outline-none"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
          <span>Join Kural</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
        <button
          onClick={handleDismiss}
          className="w-5 h-5 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white/80 hover:text-white transition-colors ml-1 focus:outline-none cursor-pointer"
          aria-label="Dismiss Join button"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}