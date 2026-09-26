"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Save, CheckCircle2, GraduationCap, Calendar, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const DEFAULT_SCHOOLS = [
  "School of Computer Science & Engineering (CSE)",
  "School of Electronics & Electrical Engineering (EEE)",
  "School of Mechanical Engineering",
  "School of Civil Engineering",
  "Mittal School of Business (Management / Commerce)",
  "School of Computer Applications & IT (BCA / MCA)",
  "School of Pharmaceutical Sciences",
  "School of Bioengineering & Biosciences",
  "School of Agriculture",
  "School of Law",
  "School of Design & Fashion",
  "School of Hotel Management & Tourism",
  "School of Journalism, Film & Creative Arts",
  "School of Polytechnic",
  "Other School / Faculty",
].join("\n");

const DEFAULT_BATCHES = [
  "Batch 2021 - 2025",
  "Batch 2022 - 2026",
  "Batch 2023 - 2027",
  "Batch 2024 - 2028",
  "Batch 2025 - 2029",
  "Postgraduate / Master's Program",
  "Other / Diploma",
].join("\n");

const DEFAULT_INTERESTS = [
  "Event Planning & Coordination",
  "Creative & Design",
  "Photography & Videography",
  "Social Media & Content",
  "Music & Live Performances",
  "Public Relations & Outreach",
  "Web & Technical Operations",
  "Leadership & Operations",
  "General Volunteering",
].join("\n");

interface AdminRecruitmentSectionProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AdminRecruitmentSection({ onShowToast }: AdminRecruitmentSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Header Copy
  const [badge, setBadge] = useState("Open Positions");
  const [title, setTitle] = useState("Be Part of Our Team.");
  const [subtitle, setSubtitle] = useState(
    "Want to help build the community? Share your details below and our team will reach out to you. Every role matters — whether you're a performer, organiser, creator, or leader."
  );

  // Dropdown Options (raw newline separated text for simple, mistake-proof editing)
  const [schoolsText, setSchoolsText] = useState(DEFAULT_SCHOOLS);
  const [batchesText, setBatchesText] = useState(DEFAULT_BATCHES);
  const [interestsText, setInterestsText] = useState(DEFAULT_INTERESTS);

  useEffect(() => {
    fetchRecruitmentContent();
  }, []);

  const fetchRecruitmentContent = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("site_content").select("id, content");

    if (error) {
      console.error("Failed to load recruitment configuration:", error.message);
    } else if (data) {
      const getVal = (id: string) => data.find((r) => r.id === id)?.content;

      if (getVal("recruitment_badge")) setBadge(getVal("recruitment_badge")!);
      if (getVal("recruitment_title")) setTitle(getVal("recruitment_title")!);
      if (getVal("recruitment_subtitle")) setSubtitle(getVal("recruitment_subtitle")!);
      if (getVal("recruitment_schools")) setSchoolsText(getVal("recruitment_schools")!);
      if (getVal("recruitment_batches")) setBatchesText(getVal("recruitment_batches")!);
      if (getVal("recruitment_interests")) setInterestsText(getVal("recruitment_interests")!);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = [
      { id: "recruitment_badge", content: badge.trim(), updated_at: new Date().toISOString() },
      { id: "recruitment_title", content: title.trim(), updated_at: new Date().toISOString() },
      { id: "recruitment_subtitle", content: subtitle.trim(), updated_at: new Date().toISOString() },
      { id: "recruitment_schools", content: schoolsText.trim(), updated_at: new Date().toISOString() },
      { id: "recruitment_batches", content: batchesText.trim(), updated_at: new Date().toISOString() },
      { id: "recruitment_interests", content: interestsText.trim(), updated_at: new Date().toISOString() },
    ];

    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "id" });

    if (error) {
      onShowToast("Failed to save recruitment settings: " + error.message, "error");
    } else {
      onShowToast("Recruitment settings saved successfully!", "success");
    }
    setSaving(false);
  };

  const countOptions = (text: string) =>
    text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean).length;

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 border border-border text-center text-muted-foreground font-medium">
        Loading Recruitment configuration...
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
              <ClipboardList className="w-4 h-4" />
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Be Part of Our Team (Recruitment Settings)
            </h2>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
            Configure recruitment headline copy and customize dropdown options displayed on{" "}
            <Link href="/team#join" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
              /team#join ↗
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
          <span>{saving ? "Saving..." : "Save Recruitment Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8 flex-1 flex flex-col">
        {/* Section 01: Header & Intro Copy */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Recruitment Section Header</h3>
              <p className="text-xs text-muted-foreground">The badge, title, and descriptive copy shown above the application form.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Badge Text</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Open Positions"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Section Heading</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Be Part of Our Team."
                required
              />
              <p className="text-[11px] text-muted-foreground">The last word automatically renders in primary highlight color.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Section Subtitle</label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full min-h-[75px] bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Want to help build the community? Share your details..."
              required
            />
          </div>
        </div>

        {/* Section 02: Dropdown Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">02</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Editable Dropdown Options</h3>
              <p className="text-xs text-muted-foreground">
                Enter each option on a new line. Adding or editing lines will update the dropdowns on the public recruitment form immediately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Schools / Departments */}
            <div className="bg-secondary/40 border border-border p-5 rounded-3xl space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </span>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    LPU Schools
                  </label>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {countOptions(schoolsText)} options
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">One school per line</p>
              <textarea
                value={schoolsText}
                onChange={(e) => setSchoolsText(e.target.value)}
                rows={11}
                className="w-full bg-white border border-border rounded-xl p-3 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y flex-1"
                placeholder="Enter schools..."
                required
              />
            </div>

            {/* Batch Years */}
            <div className="bg-secondary/40 border border-border p-5 rounded-3xl space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    Batch Years
                  </label>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {countOptions(batchesText)} options
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">One batch year per line</p>
              <textarea
                value={batchesText}
                onChange={(e) => setBatchesText(e.target.value)}
                rows={11}
                className="w-full bg-white border border-border rounded-xl p-3 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y flex-1"
                placeholder="Enter batch years..."
                required
              />
            </div>

            {/* Areas of Interest */}
            <div className="bg-secondary/40 border border-border p-5 rounded-3xl space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    Interest Areas
                  </label>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {countOptions(interestsText)} options
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">One interest area per line</p>
              <textarea
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                rows={11}
                className="w-full bg-white border border-border rounded-xl p-3 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y flex-1"
                placeholder="Enter interest areas..."
                required
              />
            </div>
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
            <span>{saving ? "Saving..." : "Save Recruitment Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
