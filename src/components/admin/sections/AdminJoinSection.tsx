"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, MessageSquare, Users, Save, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

interface AdminJoinSectionProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AdminJoinSection({ onShowToast }: AdminJoinSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero Header
  const [joinTitle, setJoinTitle] = useState("Join the Family.");
  const [joinSubtitle, setJoinSubtitle] = useState(
    "Connect with Tamil students at LPU. Stay updated on events, share memories, and be part of the LPU Tamizhans community."
  );

  // WhatsApp Card
  const [joinWhatsappTitle, setJoinWhatsappTitle] = useState("WhatsApp");
  const [joinWhatsappDesc, setJoinWhatsappDesc] = useState(
    "Join the main community group to stay in the loop for all announcements, updates, and meetups."
  );
  const [joinWhatsappLink, setJoinWhatsappLink] = useState(
    "https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe"
  );

  // Instagram Card
  const [joinInstagramTitle, setJoinInstagramTitle] = useState("Instagram");
  const [joinInstagramDesc, setJoinInstagramDesc] = useState(
    "Follow our grid for event highlights, cultural features, and the latest stories from the community."
  );
  const [joinInstagramLink, setJoinInstagramLink] = useState(
    "https://www.instagram.com/lpu.tamizhans?stkn=MXV5NWlyMG5kb2o4ag=="
  );

  // Core Team CTA
  const [joinTeamCtaTitle, setJoinTeamCtaTitle] = useState("Interested in Student Leadership?");
  const [joinTeamCtaDesc, setJoinTeamCtaDesc] = useState(
    "While our community groups are open to every Tamil student, the Kural Student Organization coordinates campus festivals, digital operations, media, and outreach. Apply to join the coordinator team."
  );
  const [joinTeamCtaBtnText, setJoinTeamCtaBtnText] = useState("Apply for Student Team");
  const [joinTeamCtaBtnLink, setJoinTeamCtaBtnLink] = useState("/team#join");

  useEffect(() => {
    fetchJoinContent();
  }, []);

  const fetchJoinContent = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("site_content").select("id, content");

    if (error) {
      console.error("Failed to load join configuration:", error.message);
    } else if (data) {
      const getVal = (id: string) => data.find((r) => r.id === id)?.content;

      if (getVal("join_title")) setJoinTitle(getVal("join_title")!);
      if (getVal("join_subtitle")) setJoinSubtitle(getVal("join_subtitle")!);
      if (getVal("join_whatsapp_title")) setJoinWhatsappTitle(getVal("join_whatsapp_title")!);
      if (getVal("join_whatsapp_desc")) setJoinWhatsappDesc(getVal("join_whatsapp_desc")!);
      if (getVal("join_whatsapp_link")) setJoinWhatsappLink(getVal("join_whatsapp_link")!);
      if (getVal("join_instagram_title")) setJoinInstagramTitle(getVal("join_instagram_title")!);
      if (getVal("join_instagram_desc")) setJoinInstagramDesc(getVal("join_instagram_desc")!);
      if (getVal("join_instagram_link")) setJoinInstagramLink(getVal("join_instagram_link")!);
      if (getVal("join_team_cta_title")) setJoinTeamCtaTitle(getVal("join_team_cta_title")!);
      if (getVal("join_team_cta_desc")) setJoinTeamCtaDesc(getVal("join_team_cta_desc")!);
      if (getVal("join_team_cta_btn_text")) setJoinTeamCtaBtnText(getVal("join_team_cta_btn_text")!);
      if (getVal("join_team_cta_btn_link")) setJoinTeamCtaBtnLink(getVal("join_team_cta_btn_link")!);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = [
      { id: "join_title", content: joinTitle.trim(), updated_at: new Date().toISOString() },
      { id: "join_subtitle", content: joinSubtitle.trim(), updated_at: new Date().toISOString() },
      { id: "join_whatsapp_title", content: joinWhatsappTitle.trim(), updated_at: new Date().toISOString() },
      { id: "join_whatsapp_desc", content: joinWhatsappDesc.trim(), updated_at: new Date().toISOString() },
      { id: "join_whatsapp_link", content: joinWhatsappLink.trim(), updated_at: new Date().toISOString() },
      { id: "join_instagram_title", content: joinInstagramTitle.trim(), updated_at: new Date().toISOString() },
      { id: "join_instagram_desc", content: joinInstagramDesc.trim(), updated_at: new Date().toISOString() },
      { id: "join_instagram_link", content: joinInstagramLink.trim(), updated_at: new Date().toISOString() },
      { id: "join_team_cta_title", content: joinTeamCtaTitle.trim(), updated_at: new Date().toISOString() },
      { id: "join_team_cta_desc", content: joinTeamCtaDesc.trim(), updated_at: new Date().toISOString() },
      { id: "join_team_cta_btn_text", content: joinTeamCtaBtnText.trim(), updated_at: new Date().toISOString() },
      { id: "join_team_cta_btn_link", content: joinTeamCtaBtnLink.trim(), updated_at: new Date().toISOString() },
    ];

    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "id" });

    if (error) {
      onShowToast("Failed to save Join Us settings: " + error.message, "error");
    } else {
      onShowToast("Join Us settings saved successfully!", "success");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 border border-border text-center text-muted-foreground font-medium">
        Loading Join Us configuration...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[500px]">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Join Us (Community Page)
            </h2>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
            Configure community channels, WhatsApp group link, Instagram link, and student leadership CTA on{" "}
            <Link href="/join" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
              /join ↗
            </Link>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Join Us Page"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col">
        {/* Section 01: Hero Header */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Hero Header</h3>
              <p className="text-xs text-muted-foreground">The headline and welcoming subtitle shown to all visitors on /join.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Page Title</label>
            <input
              type="text"
              value={joinTitle}
              onChange={(e) => setJoinTitle(e.target.value)}
              className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Join the Family."
              required
            />
            <p className="text-[11px] text-muted-foreground">
              The last word of the title will automatically appear highlighted in the primary theme color.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Page Subtitle</label>
            <textarea
              value={joinSubtitle}
              onChange={(e) => setJoinSubtitle(e.target.value)}
              className="w-full min-h-[80px] bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Connect with Tamil students at LPU..."
              required
            />
          </div>
        </div>

        {/* Section 02: Public Community Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <div className="bg-[#25D366]/5 border border-[#25D366]/20 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">WhatsApp Community Card</h3>
                <p className="text-xs text-muted-foreground">Primary community chat group</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Card Title</label>
              <input
                type="text"
                value={joinWhatsappTitle}
                onChange={(e) => setJoinWhatsappTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                placeholder="WhatsApp"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Description</label>
              <textarea
                value={joinWhatsappDesc}
                onChange={(e) => setJoinWhatsappDesc(e.target.value)}
                rows={3}
                className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#25D366] focus:outline-none resize-y"
                placeholder="Join the main community group..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Invite Link URL</label>
              <input
                type="url"
                value={joinWhatsappLink}
                onChange={(e) => setJoinWhatsappLink(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                placeholder="https://chat.whatsapp.com/..."
                required
              />
            </div>
          </div>

          {/* Instagram Card */}
          <div className="bg-[#E4405F]/5 border border-[#E4405F]/20 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center">
                <InstagramIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">Instagram Channel Card</h3>
                <p className="text-xs text-muted-foreground">Official media &amp; highlights handle</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Card Title</label>
              <input
                type="text"
                value={joinInstagramTitle}
                onChange={(e) => setJoinInstagramTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#E4405F] focus:outline-none"
                placeholder="Instagram"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Description</label>
              <textarea
                value={joinInstagramDesc}
                onChange={(e) => setJoinInstagramDesc(e.target.value)}
                rows={3}
                className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#E4405F] focus:outline-none resize-y"
                placeholder="Follow our grid for event highlights..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Profile Link URL</label>
              <input
                type="url"
                value={joinInstagramLink}
                onChange={(e) => setJoinInstagramLink(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-[#E4405F] focus:outline-none"
                placeholder="https://www.instagram.com/..."
                required
              />
            </div>
          </div>
        </div>

        {/* Section 03: Core Team Coordinator CTA Block */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">03</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Core Team Coordinator CTA Block</h3>
              <p className="text-xs text-muted-foreground">Call to action directing prospective organizers to the student team application form.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Banner Heading</label>
              <input
                type="text"
                value={joinTeamCtaTitle}
                onChange={(e) => setJoinTeamCtaTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Interested in Student Leadership?"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Button Text</label>
              <input
                type="text"
                value={joinTeamCtaBtnText}
                onChange={(e) => setJoinTeamCtaBtnText(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Apply for Student Team"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Description</label>
            <textarea
              value={joinTeamCtaDesc}
              onChange={(e) => setJoinTeamCtaDesc(e.target.value)}
              rows={2}
              className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
              placeholder="While our community groups are open to every Tamil student..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Button Destination Link</label>
            <input
              type="text"
              value={joinTeamCtaBtnLink}
              onChange={(e) => setJoinTeamCtaBtnLink(e.target.value)}
              className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="/team#join"
              required
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4 border-t border-border mt-auto">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Join Us Page"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
