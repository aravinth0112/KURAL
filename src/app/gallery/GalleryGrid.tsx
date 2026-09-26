"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Calendar, 
  Tag, 
  Sparkles, 
  ArrowUpDown, 
  Clock
} from "lucide-react";

export interface Moment {
  id: number;
  title: string;
  date: string;
  tag: string;
  description: string;
  image_url: string;
  is_featured?: boolean;
  featured_order?: number;
  created_at?: string;
}

interface Props {
  moments: Moment[];
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(url);
}

// Parses dates like "March 2023", "JAN 2027", "2025-01-15"
function parseMomentDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) {
    return direct;
  }
  const yearMatch = trimmed.match(/\b(20\d\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const lower = trimmed.toLowerCase();
    const monthIndex = months.findIndex(m => lower.includes(m));
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, 1);
    }
    return new Date(year, 5, 1);
  }
  return null;
}

function isUpcoming(dateStr: string): boolean {
  const d = parseMomentDate(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

export default function GalleryGrid({ moments }: Props) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Sort moments (prioritizing featured moments when newest first)
  const sortedMoments = useMemo(() => {
    const list = [...moments];

    list.sort((a, b) => {
      if (sortOrder === "newest") {
        const aFeatured = Boolean(a.is_featured);
        const bFeatured = Boolean(b.is_featured);

        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;

        if (aFeatured && bFeatured) {
          const aOrder = a.featured_order || 0;
          const bOrder = b.featured_order || 0;
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        const dateA = parseMomentDate(a.date)?.getTime() || (a.created_at ? new Date(a.created_at).getTime() : 0);
        const dateB = parseMomentDate(b.date)?.getTime() || (b.created_at ? new Date(b.created_at).getTime() : 0);
        return dateB - dateA;
      } else {
        const dateA = parseMomentDate(a.date)?.getTime() || (a.created_at ? new Date(a.created_at).getTime() : 0);
        const dateB = parseMomentDate(b.date)?.getTime() || (b.created_at ? new Date(b.created_at).getTime() : 0);
        return dateA - dateB;
      }
    });

    return list;
  }, [moments, sortOrder]);

  if (!moments || moments.length === 0) {
    return (
      <div className="text-center py-20 bg-secondary/50 rounded-3xl border border-dashed border-border text-muted-foreground font-medium">
        <Sparkles className="w-10 h-10 text-primary/60 mx-auto mb-3" />
        <p className="text-xl font-bold text-foreground">No moments published yet.</p>
        <p className="text-sm mt-1">Check back soon or explore our community page!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SORT CONTROLS BAR */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground">
          Showing <strong className="text-foreground">{sortedMoments.length}</strong> {sortedMoments.length === 1 ? "moment" : "moments"}
        </span>

        {/* Sort Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="bg-white border border-border text-foreground text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none shadow-sm hover:border-primary/50 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* MOMENTS CARDS GRID */}
      <div className={`grid gap-x-8 gap-y-12 w-full ${
        sortedMoments.length === 1
          ? "grid-cols-1 max-w-md mx-auto"
          : sortedMoments.length === 2
          ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      }`}>
        {sortedMoments.map((item) => {
            const upcoming = isUpcoming(item.date);
            return (
              <Link
                key={item.id}
                href={`/gallery/${item.id}`}
                className="group flex flex-col focus:outline-none"
              >
                {/* Cover Media Container */}
                <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-muted relative border border-border mb-6 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5">
                  {item.image_url && (
                    isVideo(item.image_url) ? (
                      <video
                        src={item.image_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    )
                  )}
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                  {/* Upcoming Ribbon in Top Left */}
                  {upcoming && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/95 text-white backdrop-blur-sm text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                        <Clock className="w-3 h-3" /> Upcoming
                      </span>
                    </div>
                  )}

                  {/* Hover Logo Overlay in Top Right */}
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-md flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="LPU Tamizhans"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata Badges */}
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    {item.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3 text-primary/70" />
                    {item.date}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="font-heading font-extrabold text-2xl text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Short One-Line Description */}
                {item.description && (
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>
                )}

                {/* Single Primary Action */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50 text-xs font-bold">
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                    {upcoming ? "Upcoming Event" : "Case Study & Album"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xs">
                    <span>{upcoming ? "View Event Details" : "View Event & Gallery"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
    </div>
  );
}
