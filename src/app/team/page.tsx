import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Metadata } from "next";
import { ArrowRight, GraduationCap, Calendar, Users, UserPlus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import JoinTeamForm from "./components/JoinTeamForm";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Team | Kural LPU — Tamil Student Club at LPU",
  description: "Meet the Kural LPU student team — leaders and coordinators of the LPU Tamil club connecting Tamil students LPU Punjab at Lovely Professional University. The people behind LPU Tamizhans.",
  alternates: {
    canonical: "https://lputamizhans.com/team",
  },
  openGraph: {
    title: "Our Team | Kural — Tamil Student Club at LPU",
    description: "Meet the student leaders behind Kural and LPU Tamizhans at Lovely Professional University, Punjab.",
    url: "https://lputamizhans.com/team",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LPU Tamizhans Team — Kural Student Leaders" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Team | Kural — Tamil Student Club at LPU",
    description: "Meet the student leaders behind Kural and LPU Tamizhans at Lovely Professional University, Punjab.",
    images: ["/og-image.png"],
  },
};

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  batch: string;
  image_url: string;
  bio?: string;
  responsibilities?: string;
  skills?: string;
}

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .order("order_num", { ascending: true })
    .order("id", { ascending: true });

  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {members && members.length > 0 && (
        <Script
          id="team-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Kural — LPU Tamizhans Team Members",
              description: "Student leaders and coordinators of Kural, the Tamil student organization at Lovely Professional University, Phagwara, Punjab.",
              itemListElement: members.map((member: TeamMember, index: number) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "Person",
                  name: member.name,
                  jobTitle: member.role,
                  worksFor: {
                    "@type": "Organization",
                    "@id": "https://lputamizhans.com/#organization",
                    name: "Kural — LPU Tamizhans",
                  },
                  affiliation: {
                    "@type": "CollegeOrUniversity",
                    name: "Lovely Professional University",
                    sameAs: "https://www.lpu.in",
                  },
                  ...(member.image_url ? { image: member.image_url } : {}),
                  url: `https://lputamizhans.com/team/${member.id}`,
                },
              })),
            }),
          }}
        />
      )}
      {/* Header */}
      <div className="mb-10 sm:mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Users className="w-3.5 h-3.5" />
          The People Behind Kural
        </div>
        <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-foreground">
          Meet the <span className="text-primary">Team.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
          The passionate minds and student leaders building community, celebrating culture, and keeping the Tamil spirit thriving at LPU.
        </p>
      </div>

      {/* Members Grid */}
      <div className={`grid gap-8 ${
        members && members.length === 1
          ? "grid-cols-1 max-w-sm mx-auto w-full"
          : members && members.length === 2
          ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto w-full"
          : members && members.length === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto w-full"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full"
      }`}>
        {members && members.length > 0 ? (
          members.map((member: TeamMember) => (
            <Link
              key={member.id}
              href={`/team/${member.id}`}
              className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
            >
              {/* Photo Container */}
              <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                {member.image_url ? (
                  <Image
                    src={member.image_url}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground">
                    <Users className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-wider">No Photo</span>
                  </div>
                )}

                {/* Subtle Gradient & Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-primary flex items-center justify-center shadow">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  {member.role}
                </span>

                <h3 className="font-heading text-xl font-extrabold text-foreground group-hover:text-primary transition-colors mb-2">
                  {member.name}
                </h3>

                <div className="space-y-1 mt-auto pt-2 text-xs font-medium text-muted-foreground border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate">{member.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>{member.batch}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform border-t border-dashed border-border/60">
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10 px-6 bg-secondary/30 rounded-2xl border border-dashed border-border max-w-xl mx-auto w-full">
            <Users className="w-8 h-8 text-primary/60 mx-auto mb-2.5" />
            <h3 className="font-heading text-base font-bold text-foreground mb-1">Team Directory Updating</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Our core team directory is being updated for the current academic session. Connect with us on WhatsApp or apply below to join!
            </p>
          </div>
        )}
      </div>

      {/* Section Bridge & Visual Divider */}
      <div className="my-14 flex items-center gap-4 max-w-md mx-auto">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70 px-4 py-1.5 bg-secondary rounded-full border border-border shadow-2xs">
          Get Involved
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Be Part of Our Team Section */}
      <section id="join" className="bg-white border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-sm scroll-mt-28">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <UserPlus className="w-3.5 h-3.5" />
              Open Positions
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3">
              Be Part of <span className="text-primary">Our Team.</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
              Want to help build the community? Share your details below and our team will reach out to you. Every role matters — whether you're a performer, organiser, creator, or leader.
            </p>
          </div>

          {/* Form */}
          <JoinTeamForm />
        </div>
      </section>
    </div>
  );
}


