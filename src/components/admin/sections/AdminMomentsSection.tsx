"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, X, Trash2, Pencil, Image as ImageIcon, Star, Clock, 
  CalendarDays, MapPin, Tag as TagIcon, Sparkles, AlertCircle, 
  Check, Crop, Camera, FileText, ChevronDown, ChevronUp, Save
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/utils/compressImage";
import { generateMediaFileName } from "@/utils/cropImage";
import ImageCropModal from "@/components/admin/ImageCropModal";

interface AdminMomentsSectionProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export interface Moment {
  id: number;
  title: string;
  date: string;
  tag: string;
  description: string;
  image_url: string;
  location?: string;
  organized_by?: string;
  about?: string;
  highlights?: string;
  activities?: string;
  gallery_images?: string[];
  is_featured?: boolean;
  featured_order?: number;
}

const AVAILABLE_TAGS = [
  "Cultural",
  "Festivals",
  "Events",
  "Celebrations",
  "Gatherings",
  "Workshop & Competitions",
  "Community Meetup",
];

export default function AdminMomentsSection({ onShowToast }: AdminMomentsSectionProps) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizedBy, setOrganizedBy] = useState("");
  const [about, setAbout] = useState("");
  const [highlights, setHighlights] = useState("");
  const [activities, setActivities] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[] | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Featured & Upcoming
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredSequence, setFeaturedSequence] = useState<number[]>([]);
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "upcoming">("all");
  const [upcomingMomentId, setUpcomingMomentId] = useState<number | null>(null);
  const [isUpcomingForm, setIsUpcomingForm] = useState(false);

  // Draft Support
  const [eventDraft, setEventDraft] = useState<any | null>(null);

  // Crop Modal State
  const [activeCrop, setActiveCrop] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    fileName: string;
    title: string;
    aspectRatio: number;
    aspectLabel: string;
    field: "moment_cover" | "gallery_multi" | "gallery_single";
    galleryQueue?: {
      files: File[];
      currentIndex: number;
      accumulatedFiles: File[];
    };
    singleGalleryIndex?: number;
  } | null>(null);

  const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)$/i.test(url);

  useEffect(() => {
    fetchMoments();
    try {
      const saved = localStorage.getItem("kural_event_draft");
      if (saved) setEventDraft(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchMoments = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("moments")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch featured sequence
    const { data: featData } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "homepage_featured_moments")
      .maybeSingle();

    const sequence: number[] = [];
    if (featData?.content) {
      try {
        const parsed = JSON.parse(featData.content);
        if (Array.isArray(parsed)) {
          const sorted = [...parsed].sort((a: any, b: any) => {
            const ordA = typeof a === "object" && a ? Number(a.order) || 0 : 0;
            const ordB = typeof b === "object" && b ? Number(b.order) || 0 : 0;
            return ordA - ordB;
          });
          sorted.forEach((item: any) => {
            const mId = typeof item === "object" && item ? Number(item.id) : Number(item);
            if (mId && !sequence.includes(mId)) sequence.push(mId);
          });
        }
      } catch (e) {}
    }

    if (data) {
      data.forEach((m: any) => {
        if (m.is_featured && !sequence.includes(m.id)) sequence.push(m.id);
      });
    }
    setFeaturedSequence(sequence);

    // Fetch upcoming moment id
    const { data: upcomingData } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "upcoming_moment_id")
      .maybeSingle();

    if (upcomingData?.content) {
      const parsedId = Number(upcomingData.content);
      setUpcomingMomentId(!isNaN(parsedId) && parsedId > 0 ? parsedId : null);
    } else {
      setUpcomingMomentId(null);
    }

    if (data) {
      const mapped = data.map((m: any) => ({
        ...m,
        is_featured: sequence.includes(m.id),
        featured_order: sequence.includes(m.id) ? sequence.indexOf(m.id) + 1 : 0,
      }));
      setMoments(mapped);
    }
    setLoading(false);
  };

  const isFormDirty = Boolean(
    editingId !== null ||
    title.trim() !== "" ||
    date.trim() !== "" ||
    description.trim() !== "" ||
    about.trim() !== "" ||
    highlights.trim() !== "" ||
    activities.trim() !== "" ||
    location.trim() !== "" ||
    organizedBy.trim() !== "" ||
    file !== null ||
    (galleryFiles && galleryFiles.length > 0)
  );

  const handleSaveEventDraft = () => {
    const draftPayload = {
      title,
      date,
      tag,
      description,
      location,
      organizedBy,
      about,
      highlights,
      activities,
      isUpcomingForm,
      isFeatured,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("kural_event_draft", JSON.stringify(draftPayload));
      setEventDraft(draftPayload);
      onShowToast("Event draft saved! You can resume editing anytime.", "success");
    } catch (e) {
      onShowToast("Failed to save draft to storage.", "error");
    }
  };

  const handleResumeEventDraft = () => {
    if (!eventDraft) return;
    setTitle(eventDraft.title || "");
    setDate(eventDraft.date || "");
    setTag(eventDraft.tag || "Cultural");
    setDescription(eventDraft.description || "");
    setLocation(eventDraft.location || "");
    setOrganizedBy(eventDraft.organizedBy || "");
    setAbout(eventDraft.about || "");
    setHighlights(eventDraft.highlights || "");
    setActivities(eventDraft.activities || "");
    setIsUpcomingForm(Boolean(eventDraft.isUpcomingForm));
    setIsFeatured(Boolean(eventDraft.isFeatured));
    setIsAdding(true);
    onShowToast("Event draft restored into form.", "info");
  };

  const handleDiscardEventDraft = () => {
    try {
      localStorage.removeItem("kural_event_draft");
      setEventDraft(null);
      onShowToast("Event draft discarded.", "info");
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (moment: Moment) => {
    setEditingId(moment.id);
    setTitle(moment.title);
    setDate(moment.date);
    setTag(moment.tag);
    setDescription(moment.description || "");
    setLocation(moment.location || "");
    setOrganizedBy(moment.organized_by || "");
    setAbout(moment.about || "");
    setHighlights(moment.highlights || "");
    setActivities(moment.activities || "");
    setIsFeatured(Boolean(moment.is_featured || featuredSequence.includes(moment.id)));
    setIsUpcomingForm(upcomingMomentId === moment.id);

    let gImgs: string[] = [];
    if (Array.isArray(moment.gallery_images)) {
      gImgs = moment.gallery_images;
    } else if (typeof moment.gallery_images === "string") {
      try {
        const parsed = JSON.parse(moment.gallery_images);
        if (Array.isArray(parsed)) gImgs = parsed;
      } catch {
        gImgs = [];
      }
    }
    setGalleryImages(gImgs);
    setGalleryFiles(null);
    setFile(null);
    setCurrentImageUrl(moment.image_url || "");
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setTitle("");
    setDate("");
    setTag("");
    setDescription("");
    setLocation("");
    setOrganizedBy("");
    setAbout("");
    setHighlights("");
    setActivities("");
    setGalleryImages([]);
    setGalleryFiles(null);
    setFile(null);
    setCurrentImageUrl("");
    setIsFeatured(false);
    setIsUpcomingForm(false);
  };

  // Crop / file selection handlers
  const handleSelectCoverMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    if (chosenFile.type.startsWith("video/")) {
      setFile(chosenFile);
      return;
    }
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
      title: "Crop Moments Cover Photo",
      aspectRatio: 16 / 9,
      aspectLabel: "16:9 Landscape",
      field: "moment_cover",
    });
    e.target.value = "";
  };

  const handleRecropCoverMedia = () => {
    const targetUrl = file ? URL.createObjectURL(file) : currentImageUrl;
    if (!targetUrl || isVideo(targetUrl)) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "cover_photo.jpg",
      title: "Re-crop Moments Cover Photo",
      aspectRatio: 16 / 9,
      aspectLabel: "16:9 Landscape",
      field: "moment_cover",
    });
  };

  const handleSelectGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;
    const imageFiles = rawFiles.filter((f) => !f.type.startsWith("video/"));
    const videoFiles = rawFiles.filter((f) => f.type.startsWith("video/"));

    if (imageFiles.length === 0) {
      if (videoFiles.length > 0) {
        setGalleryFiles((prev) => [...(prev || []), ...videoFiles]);
      }
      return;
    }

    const firstFile = imageFiles[0];
    const objectUrl = URL.createObjectURL(firstFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: firstFile.name,
      title: "Crop Gallery Photo",
      aspectRatio: 4 / 3,
      aspectLabel: "4:3 Gallery",
      field: "gallery_multi",
      galleryQueue: {
        files: imageFiles,
        currentIndex: 0,
        accumulatedFiles: videoFiles,
      },
    });
    e.target.value = "";
  };

  const handleRecropGalleryImage = (index: number) => {
    const imgUrl = galleryImages[index];
    if (!imgUrl || isVideo(imgUrl)) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: imgUrl,
      fileName: `gallery_${index + 1}.jpg`,
      title: "Re-crop Gallery Photo",
      aspectRatio: 4 / 3,
      aspectLabel: "4:3 Gallery",
      field: "gallery_single",
      singleGalleryIndex: index,
    });
  };

  const handleCropApply = (croppedFile: File) => {
    if (!activeCrop) return;

    if (activeCrop.field === "moment_cover") {
      setFile(croppedFile);
      setActiveCrop(null);
      onShowToast("Cover photo cropped & staged.", "success");
    } else if (activeCrop.field === "gallery_single") {
      const idx = activeCrop.singleGalleryIndex;
      if (typeof idx === "number") {
        setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
        setGalleryFiles((prev) => [...(prev || []), croppedFile]);
        onShowToast("Re-cropped photo staged. Click Update Event to save changes.", "info");
      }
      setActiveCrop(null);
    } else if (activeCrop.field === "gallery_multi" && activeCrop.galleryQueue) {
      const q = activeCrop.galleryQueue;
      const nextAccum = [...q.accumulatedFiles, croppedFile];
      const nextIndex = q.currentIndex + 1;

      if (nextIndex < q.files.length) {
        const nextFile = q.files[nextIndex];
        const nextUrl = URL.createObjectURL(nextFile);
        setActiveCrop({
          ...activeCrop,
          imageSrc: nextUrl,
          fileName: nextFile.name,
          galleryQueue: {
            files: q.files,
            currentIndex: nextIndex,
            accumulatedFiles: nextAccum,
          },
        });
      } else {
        setGalleryFiles((prev) => [...(prev || []), ...nextAccum]);
        setActiveCrop(null);
        onShowToast(`${nextAccum.length} photos cropped & staged.`, "success");
      }
    }
  };

  const handleToggleUpcoming = async (momentId: number) => {
    const supabase = createClient();
    const isCurrentlyUpcoming = upcomingMomentId === momentId;
    const newUpcomingId = isCurrentlyUpcoming ? null : momentId;
    setUpcomingMomentId(newUpcomingId);

    await supabase.from("site_content").upsert({
      id: "upcoming_moment_id",
      content: newUpcomingId ? String(newUpcomingId) : "",
    });

    try {
      if (isCurrentlyUpcoming) {
        await supabase.from("moments").update({ is_upcoming: false } as any).eq("id", momentId);
      } else {
        await supabase.from("moments").update({ is_upcoming: false } as any).neq("id", momentId);
        await supabase.from("moments").update({ is_upcoming: true } as any).eq("id", momentId);
      }
    } catch (e) {}

    fetchMoments();
  };

  const handleToggleFeatured = async (momentId: number) => {
    const supabase = createClient();
    const isCurrentlyFeatured = featuredSequence.includes(momentId);
    let newSequence: number[];

    if (isCurrentlyFeatured) {
      newSequence = featuredSequence.filter((id) => id !== momentId);
    } else {
      newSequence = [...featuredSequence, momentId];
    }

    setFeaturedSequence(newSequence);
    const serialized = newSequence.map((id, index) => ({ id, order: index + 1 }));

    await supabase.from("site_content").upsert({
      id: "homepage_featured_moments",
      content: JSON.stringify(serialized),
    });

    fetchMoments();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this moment?")) return;
    const supabase = createClient();
    await supabase.from("moments").delete().eq("id", id);

    if (featuredSequence.includes(id)) {
      const newSequence = featuredSequence.filter((mId) => mId !== id);
      setFeaturedSequence(newSequence);
      const serialized = newSequence.map((mId, index) => ({ id: mId, order: index + 1 }));
      await supabase.from("site_content").upsert({
        id: "homepage_featured_moments",
        content: JSON.stringify(serialized),
      });
    }

    if (upcomingMomentId === id) {
      setUpcomingMomentId(null);
      await supabase.from("site_content").upsert({
        id: "upcoming_moment_id",
        content: "",
      });
    }

    fetchMoments();
    onShowToast("Moment celebration removed.", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !tag) {
      onShowToast("Title, Date, and Category Tag are required.", "error");
      return;
    }
    setUploading(true);
    const supabase = createClient();

    let image_url = "";
    if (file) {
      const processedFile = await compressImage(file, 1920, 1080, 0.82);
      const fileName = generateMediaFileName("cover", processedFile);
      const { error: uploadError } = await supabase.storage.from("moments").upload(fileName, processedFile);

      if (uploadError) {
        onShowToast("Cover media upload failed: " + uploadError.message, "error");
        setUploading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("moments").getPublicUrl(fileName);
      image_url = publicUrl;
    }

    const uploadedGalleryUrls: string[] = [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        const gFile = galleryFiles[i];
        const processedGFile = await compressImage(gFile, 1920, 1080, 0.82);
        const fileName = generateMediaFileName(`gallery_${i}`, processedGFile);
        const { error: gErr } = await supabase.storage.from("moments").upload(fileName, processedGFile);
        if (!gErr) {
          const { data: { publicUrl } } = supabase.storage.from("moments").getPublicUrl(fileName);
          uploadedGalleryUrls.push(publicUrl);
        }
      }
    }

    const finalGallery = [...galleryImages, ...uploadedGalleryUrls];
    const payload: any = {
      title: title.trim(),
      date,
      tag,
      description: description.trim(),
      location: location.trim(),
      organized_by: organizedBy.trim(),
      about: about.trim(),
      highlights: highlights.trim(),
      activities: activities.trim(),
      gallery_images: finalGallery,
    };

    if (image_url) {
      payload.image_url = image_url;
    }

    if (editingId) {
      let newSequence = [...featuredSequence];
      const wasFeatured = newSequence.includes(editingId);
      if (isFeatured && !wasFeatured) {
        newSequence.push(editingId);
      } else if (!isFeatured && wasFeatured) {
        newSequence = newSequence.filter((id) => id !== editingId);
      }
      setFeaturedSequence(newSequence);
      const serialized = newSequence.map((id, index) => ({ id, order: index + 1 }));
      await supabase.from("site_content").upsert({
        id: "homepage_featured_moments",
        content: JSON.stringify(serialized),
      });

      const { error } = await supabase.from("moments").update(payload).eq("id", editingId);

      if (error) {
        onShowToast("Failed to update moment: " + error.message, "error");
      } else {
        if (isUpcomingForm) {
          setUpcomingMomentId(editingId);
          await supabase.from("site_content").upsert({
            id: "upcoming_moment_id",
            content: String(editingId),
          });
        } else if (upcomingMomentId === editingId) {
          setUpcomingMomentId(null);
          await supabase.from("site_content").upsert({
            id: "upcoming_moment_id",
            content: "",
          });
        }

        cancelEdit();
        fetchMoments();
        onShowToast("Event celebration updated successfully!", "success");
      }
    } else {
      if (!image_url) {
        onShowToast("Please select a cover photo or video for the event.", "error");
        setUploading(false);
        return;
      }
      payload.image_url = image_url;
      const { data: insertedData, error } = await supabase.from("moments").insert([payload]).select().single();

      if (error) {
        onShowToast("Failed to save moment: " + error.message, "error");
      } else {
        if (insertedData) {
          if (isFeatured) {
            const updatedSequence = [...featuredSequence, insertedData.id];
            setFeaturedSequence(updatedSequence);
            const serialized = updatedSequence.map((id, index) => ({ id, order: index + 1 }));
            await supabase.from("site_content").upsert({
              id: "homepage_featured_moments",
              content: JSON.stringify(serialized),
            });
          }
          if (isUpcomingForm) {
            setUpcomingMomentId(insertedData.id);
            await supabase.from("site_content").upsert({
              id: "upcoming_moment_id",
              content: String(insertedData.id),
            });
          }
        }
        cancelEdit();
        fetchMoments();
        onShowToast("New event celebration published successfully!", "success");
      }
    }
    setUploading(false);
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[500px]">
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Manage Moments
              </h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
              Events, celebrations, and photo albums displayed on the public{" "}
              <Link href="/gallery" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                /gallery ↗
              </Link>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isAdding) {
                  cancelEdit();
                } else {
                  setIsAdding(true);
                  setEditingId(null);
                  setIsUpcomingForm(false);
                }
              }}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAdding ? (isFormDirty ? "Discard & Close" : "Close Form") : "Add Moment"}</span>
            </button>
          </div>
        </div>

        {/* Draft Resume Alert */}
        {eventDraft && !isAdding && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-950">
                  Unsaved Event Draft Available ({new Date(eventDraft.savedAt).toLocaleDateString()})
                </p>
                <p className="text-[11px] text-amber-800 truncate max-w-md">
                  "{eventDraft.title || "Untitled Draft"}" • {eventDraft.tag || "Uncategorized"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResumeEventDraft}
                className="px-3.5 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shadow-xs cursor-pointer"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardEventDraft}
                className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-secondary/30 rounded-3xl border border-border space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground">
                {editingId ? "✏️ Edit Event Celebration" : "➕ Publish New Event Celebration"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEventDraft}
                  className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-white border border-border rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pongal Vizha 2025"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Date / Timing *</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. January 15, 2025"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Category Tag *</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                >
                  <option value="">Select Category Tag</option>
                  {AVAILABLE_TAGS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Shanti Devi Mittal Auditorium"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Organized By</label>
                <input
                  type="text"
                  value={organizedBy}
                  onChange={(e) => setOrganizedBy(e.target.value)}
                  placeholder="e.g. Kural LPU"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Featured & Upcoming Toggles */}
            <div className="p-4 bg-white rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Feature on Homepage</span>
                  <span className="text-[11px] text-muted-foreground">Appears in recent celebrations showcase on /</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUpcomingForm}
                  onChange={(e) => setIsUpcomingForm(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Next Upcoming Event</span>
                  <span className="text-[11px] text-muted-foreground">Prominently highlighted at top of gallery</span>
                </div>
              </label>
            </div>

            {/* Cover Media */}
            <div className="p-4 bg-white rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-foreground">Cover Media (16:9 Landscape) *</label>
                  <p className="text-[11px] text-muted-foreground">Main card image. Upload PNG/JPG or MP4 video.</p>
                </div>
                {(file || currentImageUrl) && (
                  <button
                    type="button"
                    onClick={handleRecropCoverMedia}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" /> Re-crop
                  </button>
                )}
              </div>

              {(file || currentImageUrl) && (
                <div className="w-48 aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                  {isVideo(file ? file.name : currentImageUrl) ? (
                    <video src={file ? URL.createObjectURL(file) : currentImageUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={file ? URL.createObjectURL(file) : currentImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleSelectCoverMedia}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Summary Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief snapshot of the celebration..."
                className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
              />
            </div>

            {/* Extended Details */}
            <div className="p-4 bg-white rounded-2xl border border-border space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Extended Event Details (Displayed on Event Detail Page)
              </span>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">About the Event</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  placeholder="Detailed narrative about how the event was celebrated..."
                  className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Highlights</label>
                  <textarea
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                    rows={2}
                    placeholder="Key highlights, special guests, performances..."
                    className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Activities</label>
                  <textarea
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                    rows={2}
                    placeholder="Competitions, games, feasts, dance..."
                    className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Multi-Upload */}
            <div className="p-4 bg-white rounded-2xl border border-border space-y-3">
              <label className="text-xs font-bold text-foreground">
                Photo Gallery Album ({galleryImages.length + (galleryFiles?.length || 0)} photos)
              </label>

              {galleryImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group bg-secondary">
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRecropGalleryImage(idx)}
                          className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-md cursor-pointer"
                          title="Re-crop"
                        >
                          <Crop className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-md cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {galleryFiles && galleryFiles.length > 0 && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                  ✓ {galleryFiles.length} new photos staged and ready to upload upon save.
                </div>
              )}

              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleSelectGalleryFiles}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer"
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
                <span>{uploading ? "Saving..." : editingId ? "Update Event" : "Publish Celebration"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFeaturedFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              featuredFilter === "all" ? "bg-primary text-white shadow-2xs" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Moments ({moments.length})
          </button>
          <button
            type="button"
            onClick={() => setFeaturedFilter("featured")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              featuredFilter === "featured" ? "bg-primary text-white shadow-2xs" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Featured on Home ({featuredSequence.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFeaturedFilter("upcoming")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              featuredFilter === "upcoming" ? "bg-primary text-white shadow-2xs" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Upcoming Next ({upcomingMomentId ? 1 : 0})</span>
          </button>
        </div>

        {/* Moments List */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground font-medium">Loading moments archive...</div>
        ) : (
          <div className="space-y-4 flex-1">
            {(() => {
              const filtered = moments.filter((m) => {
                if (featuredFilter === "featured") return featuredSequence.includes(m.id);
                if (featuredFilter === "upcoming") return upcomingMomentId === m.id;
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 bg-secondary/40 rounded-3xl border border-border text-center text-muted-foreground text-sm font-medium">
                    No moments found matching the selected filter.
                  </div>
                );
              }

              return filtered.map((moment) => {
                const isItemFeatured = featuredSequence.includes(moment.id);
                const orderIdx = isItemFeatured ? featuredSequence.indexOf(moment.id) + 1 : 0;
                const isUpcoming = upcomingMomentId === moment.id;

                return (
                  <div
                    key={moment.id}
                    className="p-5 bg-white rounded-3xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/40 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-24 aspect-video rounded-2xl overflow-hidden bg-secondary border border-border shrink-0">
                        {isVideo(moment.image_url) ? (
                          <video src={moment.image_url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={moment.image_url} alt={moment.title} className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                            {moment.tag}
                          </span>
                          {isUpcoming && (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Upcoming
                            </span>
                          )}
                          {isItemFeatured && (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-primary" /> #{orderIdx} on Home
                            </span>
                          )}
                        </div>

                        <h4 className="font-heading font-bold text-base text-foreground truncate">
                          {moment.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {moment.date} {moment.location ? `• ${moment.location}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(moment.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                          isItemFeatured
                            ? "bg-primary text-white shadow-xs"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                        }`}
                        title={isItemFeatured ? "Remove from homepage" : "Feature on homepage"}
                      >
                        <Star className={`w-3.5 h-3.5 ${isItemFeatured ? "fill-white" : ""}`} />
                        <span className="hidden sm:inline">{isItemFeatured ? `#${orderIdx} Featured` : "Feature"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleUpcoming(moment.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                          isUpcoming
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                        }`}
                        title={isUpcoming ? "Remove upcoming status" : "Mark as next upcoming"}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isUpcoming ? "Upcoming" : "Mark Upcoming"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(moment)}
                        className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                        title="Edit celebration"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(moment.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete celebration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {activeCrop && (
        <ImageCropModal
          isOpen={activeCrop.isOpen}
          imageSrc={activeCrop.imageSrc}
          fileName={activeCrop.fileName}
          title={activeCrop.title}
          aspectRatio={activeCrop.aspectRatio}
          aspectLabel={activeCrop.aspectLabel}
          onCancel={() => setActiveCrop(null)}
          onApply={handleCropApply}
        />
      )}
    </>
  );
}
