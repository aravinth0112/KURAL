import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase.from('site_content').select('id, content');

  let title = "Kural LPU | Tamil Student Organization at Lovely Professional University";
  let description = "Kural LPU is the official LPU Tamil club — the Tamil community Lovely Professional University Tamil students built together. Organizing cultural events, student activities, and connecting LPU Tamizhans across campus.";

  if (data) {
    const kTitle = data.find(r => r.id === 'kural_title');
    if (kTitle && kTitle.content) {
      title = `${kTitle.content} | Student Organization at LPU`;
    }
    const kMission = data.find(r => r.id === 'kural_mission_text');
    if (kMission && kMission.content) {
      description = kMission.content;
    }
  }

  return {
    title,
    description,
    keywords: [
      "Kural LPU",
      "Kural LPU Tamizhans",
      "LPU Tamizhans",
      "Tamil Students in LPU",
      "Tamil Community at LPU",
      "Tamil Student Organization LPU",
      "Tamil Cultural Activities LPU",
      "Tamil Events LPU",
      "Lovely Professional University",
      "LPU Punjab",
      "LPU Phagwara"
    ],
    alternates: {
      canonical: "https://lputamizhans.com/kural",
    },
    openGraph: {
      title,
      description,
      url: "https://lputamizhans.com/kural",
      siteName: "LPU Tamizhans",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kural - LPU Tamizhans Student Organization" }],
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function AboutKural() {
  const supabase = await createClient();
  const { data } = await supabase.from('site_content').select('id, content');

  // Fallback defaults
  let logoUrl = "/kural-logo.png";
  let title = "Kural LPU";
  let tamilMotto = "யாதும் ஊரே யாவரும் கேளிர்";
  let mottoTranslit = "“To us all towns are one, all men our kin”";
  let relHeading = "Community vs. Organization: What Kural Is";
  let relCommunity = "LPU Tamizhans is our student community — connecting every Tamil student across Lovely Professional University in Punjab.";
  let relOrg = "Kural is the student organization and club that runs it — planning events, leading cultural initiatives, managing operations, and bringing students together.";
  let relTagline = "Thousands of miles from home, Kural ensures that Tamil culture, language, and friendship thrive on the LPU campus.";
  let imageUrl = "";

  let visionTitle = "A Thriving Tamil Cultural Home at LPU";
  let visionText = "To build a vibrant, inclusive, and closely-knit student community at Lovely Professional University where Tamil traditions, language, and heritage are proudly celebrated, shared, and passed forward.";

  let missionTitle = "Connecting, Empowering & Celebrating";
  let missionText = "To bring students together through vibrant cultural festivals, creative activities, and shared experiences — giving every Tamil student at LPU an empowering platform to express talent, build lifelong friendships, and lead.";

  let whatWeDoItems = [
    {
      id: "1",
      title: "Cultural Celebrations & Festivals",
      description: "Organizing grand traditional festivals like Pongal Vizha, Tamil New Year, traditional arts, and music nights at LPU Punjab.",
      icon: "CalendarDays",
    },
    {
      id: "2",
      title: "Student Activities & Talent Platforms",
      description: "Providing opportunities for Tamil students to showcase skills in music, dance, public speaking, drama, photography, and creative arts.",
      icon: "Palette",
    },
    {
      id: "3",
      title: "Community Building & Campus Support",
      description: "Creating a welcoming home away from home in Phagwara, helping freshers settle in, and connecting Tamil students across departments.",
      icon: "Users2",
    },
    {
      id: "4",
      title: "Leadership & Growth Initiatives",
      description: "Empowering members with real-world experience in event planning, public relations, technical production, and student leadership.",
      icon: "Award",
    },
  ];

  let ctaBadge = "Get Involved";
  let ctaTitle = "“Join for the community. Stay for the growth. Leave a legacy.”";
  let ctaDesc = "Whether you want to perform on stage, help coordinate celebrations, develop your leadership skills, or simply meet fellow Tamil students at LPU — Kural welcomes you with open arms.";
  let ctaBtnText = "Join Kural & LPU Tamizhans";
  let ctaBtnLink = "/join";
  let ctaSecondaryText = "Explore Moments & Events";
  let ctaSecondaryLink = "/gallery";

  if (data) {
    const kLogo = data.find(r => r.id === 'kural_logo_url');
    if (kLogo?.content) logoUrl = kLogo.content;

    const kTitle = data.find(r => r.id === 'kural_title');
    if (kTitle?.content) title = kTitle.content;

    const kMotto = data.find(r => r.id === 'kural_tamil_motto');
    if (kMotto?.content) tamilMotto = kMotto.content;

    const kTranslit = data.find(r => r.id === 'kural_motto_translit');
    if (kTranslit?.content) {
      mottoTranslit = kTranslit.content
        .replace(/^yaadhum\s+oore\s+yav[a|a]rum\s+kelir\s*[•\-–—]?\s*/i, "")
        .trim();
      if (!mottoTranslit) {
        mottoTranslit = "“To us all towns are one, all men our kin”";
      }
    }

    const kRelH = data.find(r => r.id === 'kural_rel_heading');
    if (kRelH?.content) relHeading = kRelH.content;

    const kRelC = data.find(r => r.id === 'kural_rel_community');
    if (kRelC?.content) relCommunity = kRelC.content;

    const kRelO = data.find(r => r.id === 'kural_rel_org');
    if (kRelO?.content) relOrg = kRelO.content;

    const kRelT = data.find(r => r.id === 'kural_rel_tagline');
    if (kRelT?.content) relTagline = kRelT.content;

    const kImg = data.find(r => r.id === 'kural_image_url');
    if (kImg?.content) imageUrl = kImg.content;

    const kVisT = data.find(r => r.id === 'kural_vision_title');
    if (kVisT?.content) visionTitle = kVisT.content;

    const kVisM = data.find(r => r.id === 'kural_vision_text');
    if (kVisM?.content) visionText = kVisM.content;

    const kMisT = data.find(r => r.id === 'kural_mission_title');
    if (kMisT?.content) missionTitle = kMisT.content;

    const kMisM = data.find(r => r.id === 'kural_mission_text');
    if (kMisM?.content) missionText = kMisM.content;

    const kWwd = data.find(r => r.id === 'kural_what_we_do');
    if (kWwd?.content) {
      try {
        const parsed = JSON.parse(kWwd.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          whatWeDoItems = parsed;
        }
      } catch (e) {
        console.error("Failed to parse kural_what_we_do from database", e);
      }
    }

    const kCtaB = data.find(r => r.id === 'kural_cta_badge');
    if (kCtaB?.content) ctaBadge = kCtaB.content;

    const kCtaT = data.find(r => r.id === 'kural_cta_title');
    if (kCtaT?.content) ctaTitle = kCtaT.content;

    const kCtaD = data.find(r => r.id === 'kural_cta_desc');
    if (kCtaD?.content) ctaDesc = kCtaD.content;

    const kCtaBtnT = data.find(r => r.id === 'kural_cta_btn_text');
    if (kCtaBtnT?.content) ctaBtnText = kCtaBtnT.content;

    const kCtaBtnL = data.find(r => r.id === 'kural_cta_btn_link');
    if (kCtaBtnL?.content) ctaBtnLink = kCtaBtnL.content;

    const kCtaSecT = data.find(r => r.id === 'kural_cta_secondary_text');
    if (kCtaSecT?.content) ctaSecondaryText = kCtaSecT.content;

    const kCtaSecL = data.find(r => r.id === 'kural_cta_secondary_link');
    if (kCtaSecL?.content) ctaSecondaryLink = kCtaSecL.content;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://lputamizhans.com/#organization",
    "name": "Kural — LPU Tamizhans",
    "alternateName": ["Kural LPU", "LPU Tamizhans", "LPU Tamil Club", "Tamil Students LPU"],
    "url": "https://lputamizhans.com",
    "logo": logoUrl.startsWith("http") ? logoUrl : `https://lputamizhans.com${logoUrl}`,
    "description": "Kural is the official Tamil student organization at Lovely Professional University (LPU), Phagwara, Punjab — running the LPU Tamizhans community through cultural events, festivals, and student initiatives.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Phagwara - Jalandhar Road",
      "addressLocality": "Phagwara",
      "addressRegion": "Punjab",
      "postalCode": "144411",
      "addressCountry": "IN",
    },
    "parentOrganization": {
      "@type": "CollegeOrUniversity",
      "name": "Lovely Professional University",
      "sameAs": "https://www.lpu.in",
    },
    "sameAs": [
      "https://www.instagram.com/lpu.tamizhans",
      "https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe",
    ],
    "email": "contact.kurallpu@gmail.com",
    "telephone": "+91-93603-64837",
    "knowsAbout": [
      "Tamil Culture", "Tamil Students at LPU", "Tamil Cultural Events",
      "Student Leadership at LPU", "Lovely Professional University Punjab",
    ],
  };

  // Title formatting with accent color on the last word
  const titleWords = title.split(" ");
  const titlePrefix = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : "";
  const titleAccent = titleWords[titleWords.length - 1];

  return (
    <>
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* 1. KURAL — WHAT IT IS */}
        <section className="mb-14 sm:mb-16 text-center max-w-3xl mx-auto">
          {/* Official Kural Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-primary/25 bg-white transition-all duration-300 hover:scale-105 hover:ring-primary/40">
              <Image
                src={logoUrl || "/kural-logo.png"}
                alt="Kural Official Logo"
                width={144}
                height={144}
                className="w-full h-full object-cover"
                priority
                unoptimized={Boolean(logoUrl && !logoUrl.startsWith('/'))}
              />
            </div>
          </div>
          
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-black mb-3 text-foreground tracking-tight">
            {titlePrefix ? `${titlePrefix} ` : ""}<span className="text-primary">{titleAccent}</span>
          </h1>

          <p className="font-heading text-2xl sm:text-3xl font-bold text-primary mb-1">
            {tamilMotto}
          </p>
          <p className="text-muted-foreground font-semibold text-sm sm:text-base tracking-wider mb-6 italic">
            {mottoTranslit}
          </p>

          {/* Community Information Strip */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8 py-3.5 px-4 bg-secondary/60 rounded-2xl border border-border text-center shadow-xs">
            <div>
              <p className="font-heading text-sm sm:text-base font-extrabold text-primary">Tamil Community</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Student Organization</p>
            </div>
            <div className="border-x border-border/80">
              <p className="font-heading text-sm sm:text-base font-extrabold text-foreground">LPU Campus</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">University Club</p>
            </div>
            <div>
              <p className="font-heading text-sm sm:text-base font-extrabold text-primary">Punjab, India</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phagwara</p>
            </div>
          </div>

          {/* Optional Featured Showcase Image */}
          {imageUrl && (
            <div className="mb-8 rounded-3xl overflow-hidden border border-border shadow-md bg-secondary aspect-[16/9] sm:aspect-[21/9] relative group">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Relationship Distinction Card */}
          <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 sm:p-8 text-left shadow-sm mb-6">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              {relHeading}
            </h2>
            <div className="space-y-3 text-muted-foreground text-base sm:text-lg leading-relaxed font-medium">
              <p>
                {relCommunity}
              </p>
              <p>
                {relOrg}
              </p>
              {relTagline && (
                <p className="text-sm text-muted-foreground pt-1 border-t border-border">
                  {relTagline}
                </p>
              )}
            </div>
          </div>
        </section>


        {/* 2. VISION & MISSION */}
        <section className="mb-14 sm:mb-16 md:mb-20">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
              Purpose & Direction
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mt-1">
              Vision &amp; Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Vision Card */}
            <div className="bg-white border border-border p-6 sm:p-8 rounded-3xl shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-2">
                  Our Vision
                </span>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  {visionTitle}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
                  {visionText}
                </p>
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-white border border-border p-6 sm:p-8 rounded-3xl shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase block mb-2">
                  Our Mission
                </span>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  {missionTitle}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
                  {missionText}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* 3. WHAT WE DO */}
        <section className="mb-14 sm:mb-16 md:mb-20">
          <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
              Action on Campus
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mt-1 mb-3">
              What We Do
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">
              From grand cultural celebrations to student support and talent platforms, here is how Kural serves Tamil students at Lovely Professional University.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            {whatWeDoItems.map((item: any, idx: number) => {
              return (
                <div
                  key={item.id || idx}
                  className="bg-white border border-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col h-full"
                >
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>


        {/* 4. JOIN / GET INVOLVED CTA */}
        <section className="bg-primary text-white rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
              {ctaBadge}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-4">
              {ctaTitle}
            </h2>
            <p className="text-white/90 text-base sm:text-lg font-medium leading-relaxed mb-8">
              {ctaDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={ctaBtnLink || "/join"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-bold text-base hover:bg-white/95 transition-all shadow-md hover:scale-105"
              >
                {ctaBtnText} <ArrowRight className="w-5 h-5" />
              </Link>
              {ctaSecondaryText && (
                <Link
                  href={ctaSecondaryLink || "/gallery"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary/30 border border-white/40 text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-white/20 transition-all"
                >
                  {ctaSecondaryText}
                </Link>
              )}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
