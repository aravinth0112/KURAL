import { cache } from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users, Tag, Sparkles, Activity, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { LayeredWaves } from "@/components/decorative/LayeredWaves";
import EventGallery from "./EventGallery";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

const getMoment = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("moments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return event;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getMoment(id);

  if (!event) {
    return { title: "Moment Details | LPU Tamizhans" };
  }

  const desc = event.description
    ? event.description.length > 155
      ? `${event.description.slice(0, 152)}...`
      : event.description
    : "A Kural LPU event celebrating the Tamil community Lovely Professional University Tamil students belong to. Moments and memories from LPU Tamizhans.";

  return {
    title: `${event.title} | LPU Tamizhans Moments`,
    description: desc,
    alternates: {
      canonical: `https://lputamizhans.com/gallery/${id}`,
    },
    openGraph: {
      title: `${event.title} | LPU Tamizhans Moments`,
      description: desc,
      url: `https://lputamizhans.com/gallery/${id}`,
      siteName: "LPU Tamizhans",
      images: event.image_url ? [{ url: event.image_url }] : [{ url: "/logo.png" }],
      locale: "en_IN",
      type: "article",
    },
  };
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(url);
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getMoment(id);

  if (!event) {
    notFound();
  }

  // Parse gallery images (can be JSON array or text array)
  let galleryImages: string[] = [];
  if (Array.isArray(event.gallery_images)) {
    galleryImages = event.gallery_images;
  } else if (typeof event.gallery_images === "string") {
    try {
      const parsed = JSON.parse(event.gallery_images);
      if (Array.isArray(parsed)) galleryImages = parsed;
    } catch {
      galleryImages = [];
    }
  }

  // Fallback defaults if fields are empty
  const aboutText = event.about || event.description || "";
  const location = event.location || "Lovely Professional University, Punjab";
  const organizedBy = event.organized_by || "Kural • LPU Tamizhans Community";
  const highlights = event.highlights ? event.highlights.split("\n").filter((h: string) => h.trim().length > 0) : [];
  const activities = event.activities ? event.activities.split("\n").filter((a: string) => a.trim().length > 0) : [];
  const eventSlug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `event-${event.id}`;

  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 min-h-screen bg-background text-foreground">
      <Script
        id="event-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.description || `${event.title} — an event by Kural at LPU Tamizhans, Lovely Professional University.`,
            startDate: event.date,
            endDate: event.date,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: event.location || "Lovely Professional University",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Phagwara - Jalandhar Road",
                addressLocality: "Phagwara",
                addressRegion: "Punjab",
                postalCode: "144411",
                addressCountry: "IN",
              },
            },
            image: event.image_url
              ? [event.image_url]
              : ["https://lputamizhans.com/og-image.png"],
            organizer: {
              "@type": "Organization",
              "@id": "https://lputamizhans.com/#organization",
              name: "Kural — LPU Tamizhans",
              url: "https://lputamizhans.com",
            },
            url: `https://lputamizhans.com/gallery/${id}`,
          }),
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Navigation: Back to Moments */}
        <div className="mb-8">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Moments</span>
          </Link>
        </div>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Tag className="w-3.5 h-3.5" />
            {event.tag}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {event.date}
          </span>
          {location && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {location}
            </span>
          )}
        </div>

        {/* Event Title & Summary */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 text-foreground leading-[1.1]">
          {event.title}
        </h1>

        {event.description && (
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium mb-6 leading-relaxed max-w-3xl">
            {event.description}
          </p>
        )}

        {/* Community Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <Link
            href="/join"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all"
          >
            <span>Join WhatsApp Community</span>
          </Link>
        </div>

        {/* Main Content Grid: Image + Story (2 cols) & Event Information Card (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start mb-16">
          
          {/* Left Column (2 Cols / ~65%): Cover Media + Story Sections */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero Cover Media */}
            {event.image_url && (
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-muted border border-[#E5E7EB] shadow-md">
                {isVideo(event.image_url) ? (
                  <video
                    src={event.image_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover object-center"
                  />
                )}
                <div className="absolute top-4 right-4 z-10 pointer-events-none opacity-80 hidden sm:block">
                  <Image
                    src="/logo.png"
                    alt="LPU Tamizhans"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* 01 About the Event */}
            {aboutText && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-primary font-mono tracking-widest uppercase">
                    01
                  </span>
                  <h2 className="font-heading text-2xl font-extrabold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    About the Event
                  </h2>
                </div>
                <div className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed whitespace-pre-line pl-6 border-l-2 border-primary/30">
                  {aboutText}
                </div>
              </section>
            )}

            {/* 02 Highlights */}
            {highlights.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-primary font-mono tracking-widest uppercase">
                    02
                  </span>
                  <h2 className="font-heading text-2xl font-extrabold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Highlights &amp; Key Moments
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                  {highlights.map((highlight: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/60 border border-border"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <p className="text-foreground font-medium text-sm sm:text-base leading-snug">
                        {highlight.replace(/^[•\-*]\s*/, "")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 03 Activities & Performances */}
            {activities.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-primary font-mono tracking-widest uppercase">
                    03
                  </span>
                  <h2 className="font-heading text-2xl font-extrabold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Activities &amp; Performances
                  </h2>
                </div>
                <div className="space-y-3 pl-6">
                  {activities.map((act: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-border shadow-sm flex items-start gap-3"
                    >
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-muted-foreground font-medium text-sm sm:text-base">
                        {act.replace(/^[•\-*]\s*/, "")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (1 Col / ~35%): Redesigned Event Details Card with Integrated Wave Bottom */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-7 pb-3">
                <h2 className="font-heading text-xl font-bold text-gray-900 mb-5">
                  Event Information
                </h2>

                <div className="divide-y divide-gray-100">
                  {/* Date & Timeline */}
                  <div className="pb-5 first:pt-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      Date &amp; Timeline
                    </span>
                    <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-800">
                      <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{event.date}</span>
                    </div>
                  </div>

                  {/* Location / Venue */}
                  <div className="py-5">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      Location / Venue
                    </span>
                    <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-800">
                      <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{location}</span>
                    </div>
                  </div>

                  {/* Organized By */}
                  <div className="py-5">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      Organized By
                    </span>
                    <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-800">
                      <Users className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{organizedBy}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="pt-5">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      Category
                    </span>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5" />
                        {event.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrated Wave Strip Capping Off Card Bottom */}
              <div className="w-full relative z-0 mt-3 pointer-events-none select-none leading-none -mb-1">
                <LayeredWaves
                  className="w-full block"
                  heightClass="h-[45px] sm:h-[55px]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Multiple Photo Gallery with Lightbox */}
        <EventGallery images={galleryImages} eventTitle={event.title} />

      </div>
    </div>
  );
}
