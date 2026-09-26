import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { LayeredWaves } from "@/components/decorative/LayeredWaves";

export const revalidate = 60; // Cached with 60s ISR

export const metadata: Metadata = {
  title: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
  description: "LPU Tamizhans is the Tamil community Lovely Professional University Tamil students call home — run by Kural LPU, the LPU Tamil club. Connecting Tamil students LPU Punjab through cultural events, festivals, and student life.",
  alternates: {
    canonical: "https://lputamizhans.com",
  },
  openGraph: {
    title: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
    description: "LPU Tamizhans is the Tamil community Lovely Professional University Tamil students call home — run by Kural LPU, the LPU Tamil club. Connecting Tamil students LPU Punjab through cultural events, festivals, and student life.",
    url: "https://lputamizhans.com",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LPU Tamizhans — Tamil Student Community at LPU Punjab" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
    description: "Official Tamil student community at LPU, Punjab — powered by Kural.",
    images: ["/og-image.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://lputamizhans.com/#organization",
  name: "Kural — LPU Tamizhans",
  alternateName: ["LPU Tamizhans", "Kural LPU", "LPU Tamil Club"],
  url: "https://lputamizhans.com",
  logo: "https://lputamizhans.com/logo.png",
  description: "Kural is the official Tamil student organization at Lovely Professional University (LPU), Phagwara, Punjab, India — running the LPU Tamizhans community through cultural events, festivals, and student initiatives.",
  location: {
    "@type": "Place",
    name: "Lovely Professional University",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Phagwara - Jalandhar Road, Phagwara",
      addressLocality: "Phagwara",
      addressRegion: "Punjab",
      postalCode: "144411",
      addressCountry: "IN",
    },
  },
  sameAs: [
    "https://www.instagram.com/lpu.tamizhans",
    "https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact.kurallpu@gmail.com",
    telephone: "+91-93603-64837",
    contactType: "student organization",
  },
};

export default async function Home() {
  const supabase = await createClient();
  const [{ data: allMoments }, { data: contentData }] = await Promise.all([
    supabase
      .from('moments')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase.from('site_content').select('id, content')
  ]);

  // Featured moments mapping from site_content
  let upcomingId: number | null = null;
  const featuredMap = new Map<number, number>();
  if (contentData) {
    const featRow = contentData.find(r => r.id === 'homepage_featured_moments');
    if (featRow?.content) {
      try {
        const parsed = JSON.parse(featRow.content);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            if (typeof item === 'number') {
              featuredMap.set(item, idx + 1);
            } else if (item && typeof item === 'object' && item.id) {
              featuredMap.set(Number(item.id), Number(item.order) || idx + 1);
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse homepage_featured_moments", e);
      }
    }

    const upRow = contentData.find(r => r.id === 'upcoming_moment_id');
    if (upRow?.content) {
      upcomingId = Number(upRow.content) || null;
    }
  }

  // Filter only featured moments
  const featuredMoments = (allMoments || []).filter((m: any) => 
    Boolean(m.is_featured || featuredMap.has(m.id))
  );

  featuredMoments.sort((a: any, b: any) => {
    const orderA = featuredMap.has(a.id) ? featuredMap.get(a.id)! : (a.featured_order || 999);
    const orderB = featuredMap.has(b.id) ? featuredMap.get(b.id)! : (b.featured_order || 999);
    return orderA - orderB;
  });

  // If no moments are explicitly featured yet, fallback to top 3 latest so home is not empty
  const moments = featuredMoments.length > 0 ? featuredMoments : (allMoments || []).slice(0, 3);
  
  let heroTitle = "We're LPU Tamizhans.";
  let heroQuote = "யாதும் ஊரே! யாவரும் கேளிர்!";
  let homeHeroText = "The vibrant home of Tamil culture at Lovely Professional University. Connecting Tamil students across campus through cultural celebrations, creative arts, and lifelong friendships.";
  let btnWhatsappText = "Join WhatsApp Community";
  let btnWhatsappLink = "https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe";
  let btnKuralText = "Learn About Kural";
  let btnKuralLink = "/kural";
  let logoUrl = "/logo.png";
  let momentsTitle = "Moments.";
  let momentsSubtitle = "Memories from our past celebrations.";

  if (contentData) {
    const ht = contentData.find(r => r.id === 'home_hero_title');
    if (ht?.content) heroTitle = ht.content;

    const qRow = contentData.find(r => r.id === 'about_tamil_quote');
    if (qRow?.content) heroQuote = qRow.content.replace(/^["“']|["”']$/g, '');

    const hT = contentData.find(r => r.id === 'home_hero_text');
    if (hT?.content) homeHeroText = hT.content;

    const bwT = contentData.find(r => r.id === 'home_btn_whatsapp_text');
    if (bwT?.content) btnWhatsappText = bwT.content;

    const bwL = contentData.find(r => r.id === 'home_btn_whatsapp_link');
    if (bwL?.content) btnWhatsappLink = bwL.content;

    const bkT = contentData.find(r => r.id === 'home_btn_kural_text');
    if (bkT?.content) btnKuralText = bkT.content;

    const bkL = contentData.find(r => r.id === 'home_btn_kural_link');
    if (bkL?.content) btnKuralLink = bkL.content;

    const lu = contentData.find(r => r.id === 'home_logo_url');
    if (lu?.content) logoUrl = lu.content;

    const mT = contentData.find(r => r.id === 'home_moments_title');
    if (mT?.content) momentsTitle = mT.content;

    const mS = contentData.find(r => r.id === 'home_moments_subtitle');
    if (mS?.content) momentsSubtitle = mS.content;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden overflow-x-hidden bg-white pt-36 pb-32 sm:pt-40 sm:pb-44 lg:pt-44 lg:pb-52 flex flex-col justify-center min-h-[92vh] lg:min-h-[900px]">
        
        {/* Main Two-Column Hero Layout Container (roughly 55/45 split, vertically centered) */}
        <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-20 max-w-7xl relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* LEFT COLUMN (~55%) */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-5">
                <MapPin className="h-4 w-4 text-brand-orange shrink-0" />
                <span>BASED AT LOVELY PROFESSIONAL UNIVERSITY, PUNJAB</span>
              </div>

              {/* Large Two-Line Heading */}
              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold tracking-tight text-[#1A1A1A] leading-[1.08] mb-3">
                {heroTitle.includes("LPU Tamizhans") ? (
                  <>
                    {heroTitle.split("LPU Tamizhans")[0]} <br />
                    <span className="text-brand-orange">LPU Tamizhans{heroTitle.split("LPU Tamizhans")[1] || "."}</span>
                  </>
                ) : (
                  heroTitle
                )}
              </h1>

              {/* Tamil Quote */}
              <p className="text-xl sm:text-2xl font-bold text-brand-orange tracking-wide mb-4">
                &ldquo;{heroQuote}&rdquo;
              </p>

              {/* Body Paragraph */}
              <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed max-w-[460px] mb-8 font-normal">
                {homeHeroText}
              </p>

              {/* Two Action Buttons Side-by-Side */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  href={btnWhatsappLink}
                  target={btnWhatsappLink.startsWith("http") ? "_blank" : undefined}
                  rel={btnWhatsappLink.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-brand-orange hover:bg-brand-orange/90 shadow-md shadow-brand-orange/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {btnWhatsappText}
                </Link>
                <Link
                  href={btnKuralLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base text-[#1A1A1A] bg-white border-2 border-[#1A1A1A] hover:bg-gray-50 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>{btnKuralText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN (~45%) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-center relative z-10">
              {/* Floating Circular White Badge/Logo with Turban Motif */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full bg-white shadow-xl shadow-black/10 flex items-center justify-center p-8 sm:p-10 relative">
                <Image 
                  src={logoUrl || "/logo.png"} 
                  alt="LPU Tamizhans Turban Motif" 
                  width={240} 
                  height={240} 
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>

        {/* BACKGROUND ELEMENT: Scaled Layered Vector SVG Waves Pinned to Bottom */}
        <LayeredWaves
          className="absolute bottom-0 left-0 right-0 z-0"
          heightClass="h-[220px] sm:h-[280px] md:h-[350px] lg:h-[420px] xl:h-[450px]"
        />

      </section>

      {/* Content Section: Stories / Gallery Highlights */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground">{momentsTitle}</h2>
              <p className="text-muted-foreground text-xl font-medium">{momentsSubtitle}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="link" className="p-0 h-auto font-bold text-primary text-base group hover:no-underline" asChild>
                <Link href="/gallery">
                  View All Moments <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className={`grid gap-x-8 gap-y-12 ${
            moments && moments.length === 1
              ? "grid-cols-1 max-w-md mx-auto w-full"
              : moments && moments.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto w-full"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {moments && moments.length > 0 ? (
              moments.map((item, i) => (
                <Link key={item.id || i} href={`/gallery/${item.id}`} className="group cursor-pointer flex flex-col focus:outline-none">
                  <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-muted relative border border-border mb-6 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5">
                    {item.image_url && (
                      item.image_url.match(/\.(mp4|webm|mov|m4v)$/i) ? (
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
                          alt={`LPU Tamizhans ${item.title} — ${item.tag} event${item.date ? ` on ${item.date}` : ''}`}
                          fill 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      )
                    )}
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors z-10"></div>
                    
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
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                      {item.tag}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      {item.date}
                    </span>
                  </div>
                  
                  <h3 className="font-heading font-extrabold text-2xl text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  )}

                  {/* Single Primary Action */}
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs font-bold border-t border-border/50">
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {upcomingId === item.id ? "Upcoming Event" : "Case Study & Album"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xs">
                      <span>{upcomingId === item.id ? "View Event Details" : "View Event & Gallery"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground font-bold">
                No moments yet. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
