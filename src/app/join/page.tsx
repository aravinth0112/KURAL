import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Join LPU Tamizhans | Connect with Tamil Students in Punjab",
  description: "Join the LPU Tamizhans community. Connect with hundreds of Tamil students at LPU through our WhatsApp group and Instagram page.",
  alternates: {
    canonical: "https://lputamizhans.com/join",
  },
  openGraph: {
    title: "Join LPU Tamizhans | Connect with Tamil Students in Punjab",
    description: "Join the LPU Tamizhans community. Connect with hundreds of Tamil students at LPU through our WhatsApp group and Instagram page.",
    url: "https://lputamizhans.com/join",
    siteName: "LPU Tamizhans",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Join LPU Tamizhans" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function JoinPage() {
  const supabase = await createClient();
  const { data: contentData } = await supabase.from('site_content').select('id, content');
  
  let joinTitle = "Join the Family.";
  let joinSubtitle = "Connect with Tamil students at LPU. Stay updated on events, share memories, and be part of the LPU Tamizhans community.";
  let whatsappTitle = "WhatsApp";
  let whatsappDesc = "Join the main community group to stay in the loop for all announcements, updates, and meetups.";
  let whatsappLink = "https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe";
  let instagramTitle = "Instagram";
  let instagramDesc = "Follow our grid for event highlights, cultural features, and the latest stories from the community.";
  let instagramLink = "https://www.instagram.com/lpu.tamizhans?stkn=MXV5NWlyMG5kb2o4ag==";
  let teamCtaTitle = "Interested in Student Leadership?";
  let teamCtaDesc = "While our community groups are open to every Tamil student, the Kural Student Organization coordinates campus festivals, digital operations, media, and outreach. Apply to join the coordinator team.";
  let teamCtaBtnText = "Apply for Student Team";
  let teamCtaBtnLink = "/team#join";

  if (contentData) {
    const jT = contentData.find(r => r.id === 'join_title');
    if (jT?.content) joinTitle = jT.content;

    const jS = contentData.find(r => r.id === 'join_subtitle');
    if (jS?.content) joinSubtitle = jS.content;

    const wT = contentData.find(r => r.id === 'join_whatsapp_title');
    if (wT?.content) whatsappTitle = wT.content;

    const wD = contentData.find(r => r.id === 'join_whatsapp_desc');
    if (wD?.content) whatsappDesc = wD.content;

    const wL = contentData.find(r => r.id === 'join_whatsapp_link');
    if (wL?.content) whatsappLink = wL.content;

    const iT = contentData.find(r => r.id === 'join_instagram_title');
    if (iT?.content) instagramTitle = iT.content;

    const iD = contentData.find(r => r.id === 'join_instagram_desc');
    if (iD?.content) instagramDesc = iD.content;

    const iL = contentData.find(r => r.id === 'join_instagram_link');
    if (iL?.content) instagramLink = iL.content;

    const tcT = contentData.find(r => r.id === 'join_team_cta_title');
    if (tcT?.content) teamCtaTitle = tcT.content;

    const tcD = contentData.find(r => r.id === 'join_team_cta_desc');
    if (tcD?.content) teamCtaDesc = tcD.content;

    const tcB = contentData.find(r => r.id === 'join_team_cta_btn_text');
    if (tcB?.content) teamCtaBtnText = tcB.content;

    const tcL = contentData.find(r => r.id === 'join_team_cta_btn_link');
    if (tcL?.content) teamCtaBtnLink = tcL.content === '/teams' ? '/team#join' : tcL.content;
  }

  // Split title to highlight the last word
  const titleWords = joinTitle.split(' ');
  const lastWord = titleWords.pop();
  const firstPart = titleWords.join(' ');

  return (
    <div className="pt-32 sm:pt-36 pb-20 sm:pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="font-heading text-5xl md:text-7xl font-black uppercase tracking-tight mb-6 text-foreground">
          {firstPart} <span className="text-primary">{lastWord}</span>
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
          {joinSubtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        
        {/* WhatsApp Card */}
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col justify-between items-center text-center bg-white border border-border hover:border-primary p-8 sm:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </div>
            <h2 className="font-heading text-3xl font-black mb-3 text-foreground">{whatsappTitle}</h2>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              {whatsappDesc}
            </p>
          </div>
          <div className="mt-auto pt-2 flex items-center font-bold text-primary group-hover:translate-x-1 transition-transform">
            <span>Join {whatsappTitle} Group</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </div>
        </a>

        {/* Instagram Card */}
        <a 
          href={instagramLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col justify-between items-center text-center bg-white border border-border hover:border-primary p-8 sm:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <h2 className="font-heading text-3xl font-black mb-3 text-foreground">{instagramTitle}</h2>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              {instagramDesc}
            </p>
          </div>
          <div className="mt-auto pt-2 flex items-center font-bold text-primary group-hover:translate-x-1 transition-transform">
            <span>Follow on {instagramTitle}</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </div>
        </a>
      </div>

      {/* Core Team Application Callout */}
      <div className="mt-12 sm:mt-16 text-center p-8 sm:p-10 bg-secondary/50 rounded-3xl border border-border max-w-4xl mx-auto">
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2">
          {teamCtaTitle}
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base font-medium mb-6 max-w-xl mx-auto leading-relaxed">
          {teamCtaDesc}
        </p>
        <Link
          href={teamCtaBtnLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm min-h-[44px]"
        >
          <span>{teamCtaBtnText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
