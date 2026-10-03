"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Plus, X, Pencil, Trash2, Camera, Crop, Save, 
  Mail, GraduationCap, Briefcase, Hash
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/utils/compressImage";
import { generateMediaFileName } from "@/utils/cropImage";
import ImageCropModal from "@/components/admin/ImageCropModal";

interface AdminTeamSectionProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  batch: string;
  image_url: string;
  bio?: string | null;
  responsibilities?: string | null;
  skills?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  email?: string | null;
  order_num?: number;
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function AdminTeamSection({ onShowToast }: AdminTeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [email, setEmail] = useState("");
  const [orderNum, setOrderNum] = useState("0");
  const [memberFile, setMemberFile] = useState<File | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [uploading, setUploading] = useState(false);

  // Crop modal state
  const [activeCrop, setActiveCrop] = useState<{
    isOpen: boolean;
    imageSrc: string;
    fileName: string;
  } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("order_num", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Failed to fetch team members:", error.message);
    } else if (data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    setDepartment(member.department);
    setBatch(member.batch);
    setBio(member.bio || "");
    setSkills(member.skills || "");
    setResponsibilities(member.responsibilities || "");
    setLinkedin(member.linkedin || "");
    setGithub(member.github || "");
    setEmail(member.email || "");
    setOrderNum(String(member.order_num || 0));
    setMemberFile(null);
    setCurrentPhoto(member.image_url || "");
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setName("");
    setRole("");
    setDepartment("");
    setBatch("");
    setBio("");
    setSkills("");
    setResponsibilities("");
    setLinkedin("");
    setGithub("");
    setEmail("");
    setOrderNum("0");
    setMemberFile(null);
    setCurrentPhoto("");
  };

  const handleSelectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
    });
    e.target.value = "";
  };

  const handleRecropPhoto = () => {
    const targetUrl = memberFile ? URL.createObjectURL(memberFile) : currentPhoto;
    if (!targetUrl) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "member_photo.jpg",
    });
  };

  const handleCropApply = (croppedFile: File) => {
    setMemberFile(croppedFile);
    setActiveCrop(null);
    onShowToast("Profile photo cropped & staged.", "success");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      onShowToast("Failed to delete member: " + error.message, "error");
    } else {
      fetchMembers();
      onShowToast("Team member removed successfully.", "info");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !department.trim() || !batch.trim()) {
      onShowToast("Name, Role, Department, and Batch are required.", "error");
      return;
    }
    setUploading(true);
    const supabase = createClient();

    let image_url = "";
    if (memberFile) {
      const processedFile = await compressImage(memberFile, 800, 1000, 0.85);
      const fileName = generateMediaFileName("member", processedFile);
      const { error: uploadError } = await supabase.storage.from("moments").upload(fileName, processedFile);

      if (uploadError) {
        onShowToast("Photo upload failed: " + uploadError.message, "error");
        setUploading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("moments").getPublicUrl(fileName);
      image_url = publicUrl;
    }

    const payload: any = {
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      batch: batch.trim(),
      bio: bio.trim() || null,
      responsibilities: responsibilities.trim() || null,
      skills: skills.trim() || null,
      instagram: null,
      linkedin: linkedin.trim() || null,
      github: github.trim() || null,
      email: email.trim() || null,
      order_num: parseInt(orderNum, 10) || 0,
    };

    if (image_url) {
      payload.image_url = image_url;
    }

    if (editingId) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", editingId);
      if (error) {
        onShowToast("Failed to update member: " + error.message, "error");
      } else {
        cancelEdit();
        fetchMembers();
        onShowToast("Team member updated successfully!", "success");
      }
    } else {
      if (image_url) payload.image_url = image_url;
      const { error } = await supabase.from("team_members").insert([payload]);
      if (error) {
        onShowToast("Failed to add member: " + error.message, "error");
      } else {
        cancelEdit();
        fetchMembers();
        onShowToast("New team member added successfully!", "success");
      }
    }
    setUploading(false);
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Manage Team
              </h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
              Add, edit, or remove leadership and core team members shown on{" "}
              <Link href="/team" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                /team ↗
              </Link>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isAdding) {
                cancelEdit();
              } else {
                setIsAdding(true);
                setEditingId(null);
              }
            }}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? "Cancel" : "Add Member"}</span>
          </button>
        </div>

        {/* Member Form Modal / Drawer */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-secondary/30 rounded-3xl border border-border space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground">
                {editingId ? "✏️ Edit Team Member Profile" : "➕ Add New Team Member"}
              </h3>
              {editingId && (
                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">
                  Editing #{editingId}
                </span>
              )}
            </div>

            {/* Profile Photo */}
            <div className="p-4 bg-white rounded-2xl border border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-secondary border border-border shrink-0 shadow-xs relative flex items-center justify-center">
                    {memberFile ? (
                      <img src={URL.createObjectURL(memberFile)} alt="Staged" className="w-full h-full object-cover" />
                    ) : currentPhoto ? (
                      <img src={currentPhoto} alt={name || "Member"} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Profile Photo (4:5 Portrait)</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm">
                      Recommended: High quality portrait photo. Circular framing guide available during crop.
                    </p>
                    {memberFile && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        ✓ Staged new photo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(memberFile || currentPhoto) && (
                    <button
                      type="button"
                      onClick={handleRecropPhoto}
                      className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" /> Re-crop
                    </button>
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-bold text-xs border border-border transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSelectPhoto} />
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aravinth Rajendiran"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Role / Position *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. President / Event Coordinator / Media Lead"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Department / School *</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Year / Batch *</label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. Batch of 2026 / 3rd Year"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Display Order</label>
                <input
                  type="number"
                  value={orderNum}
                  onChange={(e) => setOrderNum(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-[11px] text-muted-foreground">Lower numbers appear first</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-4 bg-white rounded-2xl border border-border space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Social &amp; Contact Links
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <LinkedInIcon className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GitHubIcon className="w-3.5 h-3.5 text-gray-800" /> GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Official / Student Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bio & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Short Bio (A few sentences)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Short bio or personal statement introducing the member..."
                  className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                />
                <span className="text-[11px] text-muted-foreground">Displayed prominently on individual profile page</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Skills &amp; Expertise (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Event Management, Public Speaking, Photography, React"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-[11px] text-muted-foreground">Rendered as badge pills on profile page</span>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Key Responsibilities / Contributions (One per line)</label>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                rows={2}
                placeholder="Coordinates cultural events, technical operations, or community outreach..."
                className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs sm:text-sm hover:bg-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{uploading ? "Saving..." : editingId ? "Update Member" : "Save Member"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Team Members List */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground font-medium">Loading team directory...</div>
        ) : members.length === 0 ? (
          <div className="p-12 bg-secondary/40 rounded-3xl border border-border text-center text-muted-foreground text-sm font-medium">
            No team members added yet. Click "+ Add Member" to create the first profile.
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 bg-white rounded-3xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-16 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0 shadow-xs relative flex items-center justify-center">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {member.role}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                        Order #{member.order_num || 0}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-foreground truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {member.department} • {member.batch}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-blue-600 bg-secondary hover:bg-blue-50 rounded-xl transition-colors"
                      title="LinkedIn"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github.startsWith("http") ? member.github : `https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-gray-900 bg-secondary hover:bg-gray-100 rounded-xl transition-colors"
                      title="GitHub"
                    >
                      <GitHubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-xl transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(member)}
                    className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                    title="Edit profile"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {activeCrop && (
        <ImageCropModal
          isOpen={activeCrop.isOpen}
          imageSrc={activeCrop.imageSrc}
          fileName={activeCrop.fileName}
          title="Crop Team Member Profile Photo"
          aspectRatio={4 / 5}
          aspectLabel="4:5 Portrait"
          showCircleGuide={true}
          maxWidth={800}
          maxHeight={1000}
          onCancel={() => setActiveCrop(null)}
          onApply={handleCropApply}
        />
      )}
    </>
  );
}
