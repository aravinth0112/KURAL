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
          <div className="p-6 sm:p-10 md:p-12 pb-4 sm:pb-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-14 items-center">
            
            {/* Left: Circular Profile Photo & Social Actions */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              {/* Circular Photo Container */}
              <div className="relative w-52 h-52 sm:w-60 sm:h-60 aspect-square rounded-full overflow-hidden bg-muted border-4 border-white shadow-xl shadow-black/10 ring-2 ring-brand-orange/30 flex items-center justify-center">
                {member.image_url ? (
                  <>
                    <Image
                      src={member.image_url}
                      alt={member.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 240px, 280px"
                      className="object-cover grayscale contrast-105"
                    />
                    {/* Subtle bottom fade gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground">
                    <Users className="w-16 h-16 stroke-[1.5] mb-2 opacity-50 text-brand-orange" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">No Photo</span>
                  </div>
                )}
              </div>

              {/* Social Link Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
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

            {/* Right: Info */}
            <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              {/* Role Pill Badge (Matching Category Badge style from Event Info Card) */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider">
                  {member.role}
                </span>
              </div>

              {/* Member Name */}
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                {member.name}
              </h1>

              {/* Badges for Department and Batch (Icon-Label style matching Event Info Card) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
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
            </div>

          </div>
        </div>

        {/* Integrated Wave Strip Capping Off Card Bottom */}
        <div className="w-full relative z-0 mt-auto pointer-events-none select-none leading-none -mb-1">
          <LayeredWaves
            className="w-full block"
            heightClass="h-[100px] sm:h-[130px] md:h-[150px]"
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
