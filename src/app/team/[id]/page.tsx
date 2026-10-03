import { cache } from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Mail, 
  Users,
  Briefcase
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { LayeredWaves } from "@/components/decorative/LayeredWaves";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

const getMember = cache(async (param: string) => {
  const supabase = await createClient();
  const isNumeric = /^\d+$/.test(param);
  if (isNumeric) {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", parseInt(param, 10))
      .maybeSingle();
    if (data) return data;
  }
  const cleanParam = decodeURIComponent(param).replace(/-/g, " ").trim();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .ilike("name", `%${cleanParam}%`)
    .limit(1);
  return data && data.length > 0 ? data[0] : null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    return { title: "Team Member | LPU Tamizhans" };
  }

  const desc = `${member.name} serves as ${member.role} in ${member.department} at Lovely Professional University with Kural & LPU Tamizhans.`;

  return {
    title: `${member.name} - ${member.role} | LPU Tamizhans & Kural`,
    description: desc,
    alternates: {
      canonical: `https://lputamizhans.com/team/${id}`,
    },
    openGraph: {
      title: `${member.name} - ${member.role} | LPU Tamizhans`,
      description: desc,
      url: `https://lputamizhans.com/team/${id}`,
      siteName: "LPU Tamizhans",
      images: member.image_url ? [{ url: member.image_url }] : [{ url: "/logo.png" }],
      locale: "en_IN",
      type: "profile",
    },
  };
}

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  // Parse responsibilities / contributions
  const responsibilitiesList = member.responsibilities
    ? member.responsibilities
        .split("\n")
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0)
    : [];

  // Parse skills
  const skillsList = member.skills
    ? member.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    : [];

  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Navigation: Back to Team */}
        <div className="mb-8">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-brand-orange transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Team</span>
          </Link>
        </div>

        {/* Member Profile Hero Box with Integrated Wave Bottom */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-md border-t-4 border-t-brand-orange mb-12 relative overflow-hidden flex flex-col justify-between">
          {/* SVG Definitions for Organic Photo Blob Silhouette & Background Gradient */}
          <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
            <defs>
              {/* Organic Profile Photo Silhouette (objectBoundingBox coordinates 0..1) */}
              <clipPath id="memberPhotoBlobClip" clipPathUnits="objectBoundingBox">
                <path d="M 0.46, 0.02
                         C 0.68, 0.01, 0.88, 0.10, 0.96, 0.28
                         C 1.03, 0.46, 0.98, 0.68, 0.91, 0.84
                         C 0.84, 0.98, 0.66, 1.01, 0.48, 0.99
                         C 0.30, 0.97, 0.14, 0.90, 0.06, 0.74
                         C -0.02, 0.56, 0.01, 0.36, 0.10, 0.18
                         C 0.18, 0.04, 0.28, 0.03, 0.46, 0.02 Z" />
              </clipPath>

              {/* Decorative Background Blob Subtle Orange -> Peach Gradient */}
              <linearGradient id="memberBlobGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#F07F19" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#FFA875" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#FBC896" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#FDEEDD" stopOpacity="0.45" />
              </linearGradient>
            </defs>
          </svg>

          <div className="p-6 sm:p-10 md:p-12 pb-2 sm:pb-3 relative z-10">
            {/* 2-Column Responsive Layout: ~42-45% Left (Image) & ~55-58% Right (Content) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-14 items-center">
            
              {/* Left Column: Organic Blob Profile Image & Decorative Backdrop (~42-45% area) */}
              <div className="md:col-span-5 flex items-center justify-center">
                <div className="relative w-64 sm:w-72 md:w-72 lg:w-80 h-[340px] sm:h-[380px] md:h-[380px] lg:h-[420px] flex items-center justify-center my-2 sm:my-3">
                  {/* Decorative Organic Backdrop Blob */}
                  <div 
                    className="absolute -inset-8 sm:-inset-10 lg:-inset-12 pointer-events-none z-0 flex items-center justify-center -translate-y-2 sm:-translate-y-3 translate-x-2 sm:translate-x-3"
                    aria-hidden="true"
                  >
                    <svg 
                      viewBox="60 40 440 460" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-full h-full overflow-visible filter drop-shadow-[0_20px_45px_rgba(240,127,25,0.25)]"
                    >
                      <path 
                        d="M 300.00,60.00 C 376.15,65.96 401.04,131.09 445.01,232.38 C 488.98,333.68 501.91,364.02 457.04,431.77 C 412.17,499.52 389.62,482.83 284.75,474.33 C 179.87,465.84 113.77,475.14 82.49,401.43 C 51.21,327.72 112.13,303.90 173.03,211.10 C 233.94,118.30 223.85,54.04 300.00,60.00 Z" 
                        fill="url(#memberBlobGrad)" 
                      />
                    </svg>
                  </div>

                  {/* Organic Profile Photo Container (Clipped into asymmetric fluid blob) */}
                  <div 
                    className="relative z-10 w-60 sm:w-68 md:w-68 lg:w-76 h-[320px] sm:h-[360px] md:h-[360px] lg:h-[400px] overflow-hidden -translate-x-2 translate-y-2 sm:-translate-x-3 sm:translate-y-3 filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.12)] flex items-center justify-center bg-muted/40"
                    style={{ clipPath: "url(#memberPhotoBlobClip)", WebkitClipPath: "url(#memberPhotoBlobClip)" }}
                  >
                    {member.image_url ? (
                      <>
                        <Image
                          src={member.image_url}
                          alt={member.name}
                          fill
                          priority
                          sizes="(max-width: 768px) 280px, 340px"
                          className="object-cover object-top grayscale contrast-105"
                        />
                        {/* Subtle bottom fade gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground">
                        <Users className="w-16 h-16 stroke-[1.5] mb-2 opacity-50 text-brand-orange" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Member Details (~55-58% area) */}
              <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-4 sm:space-y-5 justify-center">
                {/* 1. Role Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
                    {member.role}
                  </span>
                </div>

                {/* 2. Member Name */}
                <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                  {member.name}
                </h1>

                {/* 3. Badges for Department and Batch */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-0.5">
                  {member.department && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 shadow-2xs">
                      <GraduationCap className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{member.department}</span>
                    </div>
                  )}
                  {member.batch && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 shadow-2xs">
                      <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{member.batch}</span>
                    </div>
                  )}
                </div>

                {/* 4. Description / Short Bio */}
                {member.bio && (
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal max-w-xl">
                    {member.bio}
                  </p>
                )}

                {/* 5. Skills & Expertise Pills */}
                {skillsList.length > 0 && (
                  <div className="pt-1 w-full">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      Skills &amp; Expertise
                    </span>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      {skillsList.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-orange-50/80 text-brand-orange border border-orange-200/60 text-xs font-semibold shadow-2xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Social Links in Content Hierarchy */}
                <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                  {member.linkedin && (
                    <a
                      href={member.linkedin.startsWith("http") ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-10 h-10 rounded-full bg-[#F3F4F6] text-gray-600 hover:bg-brand-orange hover:text-white transition-all duration-200 flex items-center justify-center shadow-xs hover:scale-105"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github.startsWith("http") ? member.github : `https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="w-10 h-10 rounded-full bg-[#F3F4F6] text-gray-600 hover:bg-brand-orange hover:text-white transition-all duration-200 flex items-center justify-center shadow-xs hover:scale-105"
                    >
                      <GitHubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      aria-label="Email"
                      className="w-10 h-10 rounded-full bg-[#F3F4F6] text-gray-600 hover:bg-brand-orange hover:text-white transition-all duration-200 flex items-center justify-center shadow-xs hover:scale-105"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Integrated Wave Strip Capping Off Card Bottom */}
          <div className="w-full relative z-0 mt-2 sm:mt-4 pointer-events-none select-none leading-none -mb-1">
            <LayeredWaves
              className="w-full block"
              heightClass="h-[70px] sm:h-[90px] md:h-[110px]"
            />
          </div>
        </div>

        {/* Detailed Sections: Responsibilities & Contributions */}
        {responsibilitiesList.length > 0 && (
          <div className="space-y-12">
            <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-orange" />
                  What I Do in Kural &amp; LPU Tamizhans
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {responsibilitiesList.map((resp: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 shadow-2xs flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base font-medium text-foreground leading-snug">
                      {resp.replace(/^[•\-*]\s*/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
