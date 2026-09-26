import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Clock, Tag } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import GalleryGrid from "./GalleryGrid";

export const revalidate = 60; // Cached with 60s ISR

export const metadata: Metadata = {
  title: "Moments & Celebrations | LPU Tamizhans",
  description: "Explore our past celebrations, photo archives, and upcoming Tamil cultural events at Lovely Professional University.",
  alternates: {
    canonical: "https://lputamizhans.com/gallery",
  },
  openGraph: {
    title: "Moments & Celebrations | LPU Tamizhans",
    description: "Explore our past celebrations, photo archives, and upcoming Tamil cultural events at Lovely Professional University.",
    url: "https://lputamizhans.com/gallery",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LPU Tamizhans Moments" }],
    locale: "en_IN",
    type: "website",
  },
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(url);
}

function parseEventDate(dateStr: string, createdAt?: string): Date {
  if (!dateStr && createdAt) return new Date(createdAt);
  if (!dateStr) return new Date(0);
  const trimmed = dateStr.trim();
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;

  const yearMatch = trimmed.match(/\b(20\d\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const lower = trimmed.toLowerCase();
    const monthIndex = months.findIndex((m) => lower.includes(m));
    const dayMatch = trimmed.match(/\b([1-9]|[12]\d|3[01])\b/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
    return new Date(year, monthIndex !== -1 ? monthIndex : 5, day);
  }
  return createdAt ? new Date(createdAt) : new Date(0);
}

function isEventPast(dateStr: string, createdAt?: string): boolean {
  const d = parseEventDate(dateStr, createdAt);
  const now = new Date();
  const eventEnd = new Date(d);
  eventEnd.setHours(23, 59, 59, 999);
  return eventEnd.getTime() < now.getTime();
}

export default async function GalleryPage() {
  const supabase = await createClient();
  const [{ data: moments }, { data: contentData }] = await Promise.all([
    supabase
      .from("moments")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("site_content").select("id, content")
  ]);

  let galleryTitle = "Moments.";
  let gallerySubtitle = "A complete archive of our past events, festivals, and community celebrations.";

  const featuredMap = new Map<number, number>();

  if (contentData) {
    const gT = contentData.find((r) => r.id === "gallery_title");
    if (gT) galleryTitle = gT.content;

    const gS = contentData.find((r) => r.id === "gallery_subtitle");
    if (gS) gallerySubtitle = gS.content;

    const featRow = contentData.find((r) => r.id === "homepage_featured_moments");
    if (featRow?.content) {
      try {
        const parsed = JSON.parse(featRow.content);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            if (typeof item === "number") {
              featuredMap.set(item, idx + 1);
            } else if (item && typeof item === "object" && item.id) {
              featuredMap.set(Number(item.id), Number(item.order) || idx + 1);
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse homepage_featured_moments", e);
      }
    }
  }

  // Merge featured status
  const enrichedMoments = (moments || []).map((m: any) => {
    const isFeat = Boolean(m.is_featured || featuredMap.has(m.id));
    const featOrd = featuredMap.has(m.id) ? featuredMap.get(m.id)! : (m.featured_order || 0);
    return {
      ...m,
      is_featured: isFeat,
      featured_order: featOrd,
    };
  });

  // Identify Upcoming Poster Event
  const rawUpcomingId = contentData?.find((r) => r.id === "upcoming_moment_id")?.content;
  const adminUpcomingId = rawUpcomingId ? Number(rawUpcomingId) : null;

  let upcomingMoment: any = null;

  // 1. Check if admin explicitly set an upcoming moment
  if (adminUpcomingId) {
    const found = enrichedMoments.find((m: any) => m.id === adminUpcomingId);
    if (found) {
      upcomingMoment = found;
    }
  }

  // 2. If no valid admin upcoming moment, pick the nearest future event automatically
  if (!upcomingMoment) {
    const futureMoments = enrichedMoments
      .filter((m: any) => !isEventPast(m.date, m.created_at))
      .sort((a: any, b: any) => parseEventDate(a.date, a.created_at).getTime() - parseEventDate(b.date, b.created_at).getTime());
    if (futureMoments.length > 0) {
      upcomingMoment = futureMoments[0];
    }
  }

  // 3. Past moments: All events except the active upcoming poster, sorted by date descending (newest down to oldest)
  const pastMoments = enrichedMoments
    .filter((m: any) => !upcomingMoment || m.id !== upcomingMoment.id)
    .sort((a: any, b: any) => {
      const dateA = parseEventDate(a.date, a.created_at).getTime();
      const dateB = parseEventDate(b.date, b.created_at).getTime();
      return dateB - dateA;
    });


  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
      
      {/* Header Section */}
      <div className="mb-10 sm:mb-12">
        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-foreground">
          {galleryTitle}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl">
          {gallerySubtitle}
        </p>
      </div>

      {/* UPCOMING POSTER SECTION (Visible when an upcoming event is active) */}
      {upcomingMoment && (
        <div id="upcoming" className="mb-20 scroll-mt-32">
          <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/40 to-background p-6 sm:p-10 shadow-xl">
            
            {/* Header bar of Poster */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
                  <Clock className="w-3.5 h-3.5" /> Upcoming Celebration Poster
                </span>
              </div>
            </div>

            {/* Poster Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Poster Media (Aspect 16:9 on Mobile, 4:3 on Desktop) */}
              <div className="lg:col-span-6 aspect-[16/10] rounded-3xl overflow-hidden bg-muted relative border border-border shadow-md">
                {upcomingMoment.image_url ? (
                  isVideo(upcomingMoment.image_url) ? (
                    <video
                      src={upcomingMoment.image_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={upcomingMoment.image_url}
                      alt={upcomingMoment.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground text-sm font-bold">
                    Upcoming Event Poster
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow">
                  Next Event
                </div>
              </div>

              {/* Poster Meta & Actions */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <Tag className="w-3 h-3" /> {upcomingMoment.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {upcomingMoment.date}
                  </span>
                  {upcomingMoment.location && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {upcomingMoment.location}
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                  {upcomingMoment.title}
                </h2>

                {upcomingMoment.description && (
                  <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed">
                    {upcomingMoment.description}
                  </p>
                )}

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/gallery/${upcomingMoment.id}`}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PAST MOMENTS ARCHIVE SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Past Celebrations &amp; Memories
            </h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {pastMoments.length} {pastMoments.length === 1 ? "Celebration" : "Celebrations"}
          </span>
        </div>

        <GalleryGrid moments={pastMoments} />
      </div>

    </div>
  );
}
