"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Users, Trash2, Search, X, ArrowUpDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

export interface TeamApplication {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  batch: string;
  interest_area: string;
  message?: string;
  created_at: string;
}

export interface SubmissionsHubProps {
  initialSubTab?: "messages" | "applications";
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
  moments?: any[];
}

export default function SubmissionsHub({
  initialSubTab = "messages",
  onShowToast,
  moments = [],
}: SubmissionsHubProps) {
  const [subTab, setSubTab] = useState<"messages" | "applications">(initialSubTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);

  // Applications state
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const fetchMsgs = () => {
    setLoadingMsgs(true);
    const supabase = createClient();
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: sortOrder === "asc" })
      .then(({ data }) => {
        if (data) setMessages(data);
        setLoadingMsgs(false);
      });
  };

  const fetchApps = () => {
    setLoadingApps(true);
    const supabase = createClient();
    supabase
      .from("team_applications")
      .select("*")
      .order("created_at", { ascending: sortOrder === "asc" })
      .then(({ data }) => {
        if (data) setApplications(data);
        setLoadingApps(false);
      });
  };

  useEffect(() => {
    fetchMsgs();
    fetchApps();
  }, [sortOrder]);

  const handleDeleteMsg = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      onShowToast("Failed to delete message: " + error.message, "error");
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      onShowToast("Contact message deleted.", "success");
    }
  };

  const handleDeleteApp = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team application?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("team_applications").delete().eq("id", id);
    if (error) {
      onShowToast("Failed to delete application: " + error.message, "error");
    } else {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      onShowToast("Team application deleted.", "success");
    }
  };

  const q = searchQuery.toLowerCase().trim();

  const filteredMsgs = messages.filter((m) => {
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const filteredApps = applications.filter((a) => {
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.interest_area.toLowerCase().includes(q) ||
      (a.message && a.message.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[550px]">
      {/* Top Header */}
      <div className="pb-6 mb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
              Submissions &amp; Inquiries Hub
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">
              Manage incoming Contact form inquiries and Team applications in one unified space.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (subTab === "messages") fetchMsgs();
                if (subTab === "applications") fetchApps();
              }}
              className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setSubTab("messages")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === "messages"
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Messages</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${subTab === "messages" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              {messages.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab("applications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === "applications"
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Applications</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${subTab === "applications" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              {applications.length}
            </span>
          </button>
        </div>
      </div>

      {/* Utility Controls Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-secondary/30 p-3 sm:p-4 rounded-2xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${subTab === "messages" ? "by name, email, subject, or message..." : "by name, email, department..."}`}
            className="w-full bg-white border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="bg-white border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>


      {/* SUB-TAB 2: CONTACT MESSAGES */}
      {subTab === "messages" && (
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
            <span>
              Showing <strong className="text-foreground">{filteredMsgs.length}</strong> message{filteredMsgs.length === 1 ? "" : "s"} submitted via{" "}
              <Link href="/contact" target="_blank" className="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                /contact ↗
              </Link>
            </span>
          </div>

          {loadingMsgs ? (
            <p className="text-muted-foreground text-sm font-medium py-8 text-center">Loading contact messages...</p>
          ) : filteredMsgs.length === 0 ? (
            <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <Mail className="w-8 h-8 text-primary/50 mx-auto mb-2" />
              <p className="font-bold text-foreground text-sm">No messages found</p>
              <p className="text-muted-foreground text-xs mt-1">Inquiries submitted from the public /contact page will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMsgs.map((msg) => (
                <div key={msg.id} className="bg-secondary/40 border border-border rounded-2xl p-4 sm:p-5 space-y-3 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-extrabold text-foreground text-base">{msg.name}</span>
                        {msg.subject && (
                          <span className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                            {msg.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {new Date(msg.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start">
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || "Your Inquiry to Kural LPU"}`)}`}
                        className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply ({msg.email})</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteMsg(msg.id)}
                        title="Delete Message"
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl border border-border bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-border/80 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: TEAM APPLICATIONS */}
      {subTab === "applications" && (
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
            <span>
              Showing <strong className="text-foreground">{filteredApps.length}</strong> application{filteredApps.length === 1 ? "" : "s"} submitted from the Team page
            </span>
          </div>

          {loadingApps ? (
            <p className="text-muted-foreground text-sm font-medium py-8 text-center">Loading applications...</p>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <Users className="w-8 h-8 text-primary/50 mx-auto mb-2" />
              <p className="font-bold text-foreground text-sm">No applications found</p>
              <p className="text-muted-foreground text-xs mt-1">Applications submitted from the Team page will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div key={app.id} className="bg-secondary/40 border border-border rounded-2xl p-4 sm:p-5 space-y-3 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-extrabold text-foreground text-base">{app.name}</span>
                        <span className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                          {app.interest_area}
                        </span>
                        {app.created_at && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            • {new Date(app.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium space-y-0.5">
                        <p>{app.department} · Batch {app.batch}</p>
                        {app.phone && (
                          <p className="flex items-center gap-2 text-foreground/80 pt-0.5">
                            <span>📞 {app.phone}</span>
                            <a
                              href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 font-bold hover:underline inline-flex items-center gap-0.5"
                            >
                              WhatsApp ↗
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start">
                      <a
                        href={`mailto:${app.email}?subject=${encodeURIComponent("Regarding your Kural LPU Team Application")}&body=${encodeURIComponent(`Hi ${app.name},\n\nThank you for applying to join the Kural LPU team!`)}`}
                        className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email {app.name.split(" ")[0]}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        title="Delete Application"
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl border border-border bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {app.message && (
                    <div className="p-3.5 bg-white rounded-xl border border-border/80 text-xs sm:text-sm text-foreground/80 italic font-medium leading-relaxed">
                      &ldquo;{app.message}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
