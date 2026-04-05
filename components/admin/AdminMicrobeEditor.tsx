"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Save,
  Trash2,
  Eye,
  EyeOff,
  Database,
  Video,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  FlaskConical,
  Shield,
  BookOpen,
  Activity,
  Dna,
  List,
  Microscope,
  ImageIcon,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type Option = { id: string; label: string };
type MicrobeEditorProps = {
  initialData?: any;
  diseases: Option[];
  references: Option[];
};

function joinArray(input: unknown) {
  return Array.isArray(input) ? input.map(String).join(", ") : "";
}

/* ── Toggle switch ── */
function Toggle({
  checked,
  onChange,
  label,
  description,
  color = "cyan",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  color?: "cyan" | "pathogen" | "benefit" | "amber";
}) {
  const trackActive =
    color === "pathogen"
      ? "bg-pathogen"
      : color === "benefit"
        ? "bg-benefit"
        : color === "amber"
          ? "bg-amber"
          : "bg-cyan";

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        checked ? "border-white/20 bg-white/[0.07]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
      }`}
    >
      {/* Switch track */}
      <div
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${
          checked ? trackActive : "bg-white/15"
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${checked ? "text-white" : "text-slate-400"}`}>{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
      </div>
    </button>
  );
}

/* ── BSL level selector ── */
const BSL_CONFIG = [
  { level: 1, label: "BSL-1", desc: "Non-hazardous to healthy adults", cls: "border-benefit/40 bg-benefit/10 text-benefit" },
  { level: 2, label: "BSL-2", desc: "Moderate individual risk", cls: "border-amber/40 bg-amber/10 text-amber" },
  { level: 3, label: "BSL-3", desc: "Serious potential disease", cls: "border-orange-400/40 bg-orange-400/10 text-orange-400" },
  { level: 4, label: "BSL-4", desc: "Life-threatening, no vaccine", cls: "border-pathogen/40 bg-pathogen/10 text-pathogen" },
];

function BslSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {BSL_CONFIG.map((bsl) => (
        <button
          key={bsl.level}
          type="button"
          onClick={() => onChange(bsl.level)}
          className={`rounded-2xl border px-3 py-3 text-center transition ${
            Number(value) === bsl.level
              ? bsl.cls
              : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
          }`}
        >
          <p className="text-sm font-bold">{bsl.label}</p>
          <p className="mt-0.5 text-[10px] leading-tight opacity-80">{bsl.desc}</p>
        </button>
      ))}
    </div>
  );
}

/* ── Searchable checklist ── */
function SearchableChecklist({
  items,
  selectedIds,
  onToggle,
  placeholder,
  emptyText,
}: {
  items: Option[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  placeholder: string;
  emptyText: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan/30 focus:outline-none"
        />
      </div>
      {selectedIds.length > 0 && (
        <p className="text-[11px] text-cyan">
          {selectedIds.length} selected
        </p>
      )}
      <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">{emptyText}</p>
        ) : (
          filtered.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id, !checked)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                  checked
                    ? "bg-cyan/10 text-cyan"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                    checked ? "border-cyan bg-cyan" : "border-white/20 bg-transparent"
                  }`}
                >
                  {checked && <Check className="h-2.5 w-2.5 text-ink" />}
                </div>
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Collapsible section ── */
function Section({
  icon,
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-panel overflow-hidden rounded-[2rem]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-white/[0.03]"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan">
            {icon}
          </span>
          <span className="font-[var(--font-display)] text-lg text-white">{title}</span>
          {badge && (
            <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-[10px] text-cyan">
              {badge}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-500" />
        )}
      </button>
      {open && (
        <div className="border-t border-white/[0.08] px-6 pb-6 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Field with helper text ── */
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-slate-200">{label}</span>
        {required && <span className="text-[10px] text-pathogen">*required</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

const INPUT_CLS =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan/40 focus:outline-none transition";
const SELECT_CLS =
  "w-full rounded-xl border border-white/10 bg-[#0a0e1a] px-4 py-2.5 text-sm text-white focus:border-cyan/40 focus:outline-none transition";
const TEXTAREA_CLS =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan/40 focus:outline-none transition resize-none";

/* ════════════════════════════════════════ */
export function AdminMicrobeEditor({ initialData, diseases, references }: MicrobeEditorProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [videoMessage, setVideoMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: initialData?.id || "",
    slug: initialData?.slug || "",
    commonName: initialData?.commonName || "",
    scientificName: initialData?.scientificName || "",
    descriptionShort: initialData?.descriptionShort || "",
    descriptionLong: initialData?.descriptionLong || "",
    overviewHtml: initialData?.overviewHtml || "",
    discoveryYear: initialData?.discoveryYear || "",
    discoveredBy: initialData?.discoveredBy || "",
    discoveryContext: initialData?.discoveryContext || "",
    gramStain: initialData?.gramStain || "unknown",
    morphology: initialData?.morphology || "unknown",
    sizeUm: initialData?.sizeUm || "",
    oxygenRequirement: initialData?.oxygenRequirement || "unknown",
    habitat: initialData?.habitat || "",
    isInfectious: initialData?.isInfectious || false,
    isDangerous: initialData?.isDangerous || false,
    isBeneficial: initialData?.isBeneficial || false,
    bslLevel: initialData?.bslLevel || 1,
    benefitDescription: initialData?.benefitDescription || "",
    harmDescription: initialData?.harmDescription || "",
    ecologicalRole: initialData?.ecologicalRole || "",
    relationshipType: initialData?.relationshipType || "commensal",
    ncbiTaxonomyId: initialData?.ncbiTaxonomyId || "",
    imageUrl: initialData?.imageUrl || "",
    imageType: initialData?.images?.[0]?.imageType || "illustration",
    imageCaption: initialData?.images?.[0]?.caption || "",
    pathogenesisMechanism: initialData?.pathogenesisMechanism || "",
    antibioticProfile: initialData?.antibioticProfile || "",
    treatmentOptions: initialData?.treatmentOptions || "",
    preventionMethods: initialData?.preventionMethods || "",
    biosafetyExplanation: initialData?.biosafetyExplanation || "",
    biotechApplications: initialData?.biotechApplications || "",
    foodIndustryUses: initialData?.foodIndustryUses || "",
    environmentalUses: initialData?.environmentalUses || "",
    pharmaceuticalUses: initialData?.pharmaceuticalUses || "",
    researchMilestones: joinArray(initialData?.researchMilestones),
    notableRelatives: joinArray(initialData?.notableRelatives),
    hostOrganisms: joinArray(initialData?.hostOrganisms),
    interactions: joinArray(initialData?.interactions),
    specialStructures: joinArray(initialData?.specialStructures),
    virulenceFactors: joinArray(initialData?.virulenceFactors),
    taxonomy: {
      domain: initialData?.taxonomy?.domain || "",
      kingdom: initialData?.taxonomy?.kingdom || "",
      phylum: initialData?.taxonomy?.phylum || "",
      taxClass: initialData?.taxonomy?.taxClass || "",
      order: initialData?.taxonomy?.order || "",
      family: initialData?.taxonomy?.family || "",
      genus: initialData?.taxonomy?.genus || "",
      species: initialData?.taxonomy?.species || "",
      strain: initialData?.taxonomy?.strain || "",
      commonClassification: initialData?.taxonomy?.commonClassification || "",
    },
    diseaseIds: initialData?.diseases?.map((e: any) => e.diseaseId) || [],
    referenceIds: initialData?.references?.map((e: any) => e.referenceId) || [],
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const setTax = (key: string, value: string) =>
    setForm((f) => ({ ...f, taxonomy: { ...f.taxonomy, [key]: value } }));

  /* ── Completion score ── */
  const completion = useMemo(() => {
    const required = [
      form.scientificName,
      form.commonName,
      form.slug,
      form.descriptionShort,
      form.imageUrl,
      form.taxonomy.kingdom,
      form.taxonomy.genus,
    ];
    const filled = required.filter(Boolean).length;
    return Math.round((filled / required.length) * 100);
  }, [form]);

  const completionColor =
    completion >= 80 ? "bg-benefit" : completion >= 50 ? "bg-amber" : "bg-pathogen";

  const previewSummary = useMemo(
    () => ({
      title: form.scientificName || "Untitled microbe",
      subtitle: form.commonName || "No common name",
      description: form.descriptionShort || "No description yet.",
      taxonomy: Object.values(form.taxonomy).filter(Boolean).join(" › "),
    }),
    [form]
  );

  /* ── Actions ── */
  const submit = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        ...form,
        discoveryYear: form.discoveryYear ? Number(form.discoveryYear) : null,
        bslLevel: form.bslLevel ? Number(form.bslLevel) : null,
        ncbiTaxonomyId: form.ncbiTaxonomyId ? Number(form.ncbiTaxonomyId) : null,
        researchMilestones: form.researchMilestones.split(",").map((s) => s.trim()).filter(Boolean),
        notableRelatives: form.notableRelatives.split(",").map((s) => s.trim()).filter(Boolean),
        hostOrganisms: form.hostOrganisms.split(",").map((s) => s.trim()).filter(Boolean),
        interactions: form.interactions.split(",").map((s) => s.trim()).filter(Boolean),
        specialStructures: form.specialStructures.split(",").map((s) => s.trim()).filter(Boolean),
        virulenceFactors: form.virulenceFactors.split(",").map((s) => s.trim()).filter(Boolean),
        images: form.imageUrl
          ? [
              {
                imageUrl: form.imageUrl,
                imageType: form.imageType || "illustration",
                caption: form.imageCaption || `${form.scientificName} primary image`,
                sourceCredit: "Uploaded via admin panel",
                altText: `${form.scientificName} microscopy image`,
                isPrimary: true,
              },
            ]
          : [],
      };
      const res = await fetch("/api/microbes", {
        method: form.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to save.");
      setMessage({ type: "ok", text: "Microbe saved successfully." });
      router.push(`/admin/microbes/${json.microbe.id}/edit`);
      router.refresh();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Unable to save." });
    } finally {
      setSaving(false);
    }
  };

  const deleteMicrobe = async () => {
    if (!form.id || !confirm("Permanently delete this microbe?")) return;
    const res = await fetch(`/api/microbes?id=${form.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/microbes");
      router.refresh();
    }
  };

  const fetchNcbi = async () => {
    try {
      setMessage(null);
      const res = await fetch(
        form.id
          ? `/api/ncbi/fetch?microbeId=${form.id}`
          : `/api/ncbi/fetch?term=${encodeURIComponent(form.scientificName)}`,
        {
          method: form.id ? "POST" : "GET",
          headers: form.id ? { "content-type": "application/json" } : undefined,
          body: form.id ? JSON.stringify({}) : undefined,
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "NCBI fetch failed.");
      const data = json.data;
      setForm((f) => ({
        ...f,
        ncbiTaxonomyId: data.taxonomyId,
        descriptionShort: f.descriptionShort || data.sequenceSummary,
        taxonomy: {
          ...f.taxonomy,
          commonClassification:
            data.taxonomyJson?.division || f.taxonomy.commonClassification,
        },
      }));
      setMessage({ type: "ok", text: "NCBI data fetched successfully." });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "NCBI fetch failed." });
    }
  };

  const addVideos = async () => {
    if (!form.id) {
      setVideoMessage("Save the microbe first, then fetch videos.");
      return;
    }
    const res = await fetch("/api/youtube/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ microbeId: form.id }),
    });
    const json = await res.json();
    setVideoMessage(
      res.ok ? `Attached ${json.videos.length} video(s).` : json.error || "Unable to add videos."
    );
  };

  const toggleDisease = (id: string, checked: boolean) =>
    set("diseaseIds", checked ? [...form.diseaseIds, id] : form.diseaseIds.filter((d: string) => d !== id));

  const toggleReference = (id: string, checked: boolean) =>
    set("referenceIds", checked ? [...form.referenceIds, id] : form.referenceIds.filter((r: string) => r !== id));

  /* ════════ RENDER ════════ */
  return (
    <div className="space-y-5">

      {/* ── Sticky toolbar ── */}
      <div className="glass-panel sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm font-medium text-cyan transition hover:bg-cyan/20 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save microbe"}
          </button>
          <button
            type="button"
            onClick={fetchNcbi}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Database className="h-4 w-4" />
            Fetch NCBI
          </button>
          <button
            type="button"
            onClick={addVideos}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <Video className="h-4 w-4" />
            Add videos
          </button>
          {form.id && (
            <button
              type="button"
              onClick={deleteMicrobe}
              className="inline-flex items-center gap-2 rounded-2xl border border-pathogen/30 bg-pathogen/10 px-4 py-2.5 text-sm text-pathogen transition hover:bg-pathogen/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Completion pill */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${completionColor}`}
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{completion}% complete</span>
          </div>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? "Hide preview" : "Preview"}
          </button>
        </div>
      </div>

      {/* ── Status messages ── */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-benefit/30 bg-benefit/10 text-benefit"
              : "border-pathogen/30 bg-pathogen/10 text-pathogen"
          }`}
        >
          {message.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}
      {videoMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <Video className="h-4 w-4 flex-shrink-0 text-slate-500" />
          {videoMessage}
        </div>
      )}

      {/* ════ Main editor grid ════ */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* Photo + core identity */}
          <Section icon={<Microscope className="h-4 w-4" />} title="Identity & Photo" defaultOpen>
            <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
              {/* Image uploader */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Primary image
                </p>
                <ImageUploader
                  value={form.imageUrl}
                  imageType={form.imageType}
                  imageCaption={form.imageCaption}
                  onChange={(v) => set("imageUrl", v)}
                  onImageTypeChange={(v) => set("imageType", v)}
                  onCaptionChange={(v) => set("imageCaption", v)}
                />
              </div>

              {/* Core identity fields */}
              <div className="space-y-4">
                <Field label="Scientific name" required hint="Genus species format — e.g. Escherichia coli">
                  <input
                    value={form.scientificName}
                    onChange={(e) => set("scientificName", e.target.value)}
                    placeholder="e.g. Staphylococcus aureus"
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Common name" hint="Plain-language name used in the encyclopedia listing">
                  <input
                    value={form.commonName}
                    onChange={(e) => set("commonName", e.target.value)}
                    placeholder="e.g. Golden staph"
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="URL slug" required hint="Used in the public URL — lowercase, hyphen-separated">
                  <input
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="e.g. staphylococcus-aureus"
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Short description" required hint="1–2 sentences shown on cards and search results (max ~200 chars)">
                  <textarea
                    value={form.descriptionShort}
                    onChange={(e) => set("descriptionShort", e.target.value)}
                    rows={3}
                    placeholder="A brief, engaging summary of this microbe…"
                    className={TEXTAREA_CLS}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="NCBI taxonomy ID" hint="Auto-filled by Fetch NCBI">
                    <input
                      value={form.ncbiTaxonomyId}
                      onChange={(e) => set("ncbiTaxonomyId", e.target.value)}
                      placeholder="e.g. 1280"
                      className={INPUT_CLS}
                    />
                  </Field>
                  <Field label="Habitat" hint="Where this organism lives">
                    <input
                      value={form.habitat}
                      onChange={(e) => set("habitat", e.target.value)}
                      placeholder="e.g. Skin, soil, marine"
                      className={INPUT_CLS}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </Section>

          {/* Discovery */}
          <Section icon={<Info className="h-4 w-4" />} title="Discovery" defaultOpen={false}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Discovery year" hint="Year the organism was first formally described">
                <input
                  type="number"
                  value={form.discoveryYear}
                  onChange={(e) => set("discoveryYear", e.target.value)}
                  placeholder="e.g. 1884"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Discovered by" hint="Researcher or institution credited">
                <input
                  value={form.discoveredBy}
                  onChange={(e) => set("discoveredBy", e.target.value)}
                  placeholder="e.g. Friedrich Loeffler"
                  className={INPUT_CLS}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Discovery context" hint="Historical background and circumstances of discovery">
                <textarea
                  value={form.discoveryContext}
                  onChange={(e) => set("discoveryContext", e.target.value)}
                  rows={4}
                  placeholder="Describe the historical or scientific context…"
                  className={TEXTAREA_CLS}
                />
              </Field>
            </div>
          </Section>

          {/* Phenotype & Risk */}
          <Section icon={<Shield className="h-4 w-4" />} title="Phenotype & Risk" defaultOpen>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Gram stain">
                <select value={form.gramStain} onChange={(e) => set("gramStain", e.target.value)} className={SELECT_CLS}>
                  {["positive", "negative", "variable", "unknown"].map((o) => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Morphology">
                <select value={form.morphology} onChange={(e) => set("morphology", e.target.value)} className={SELECT_CLS}>
                  {["cocci", "bacilli", "spirochete", "coccobacilli", "vibrio", "filamentous", "unknown"].map((o) => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Oxygen requirement">
                <select value={form.oxygenRequirement} onChange={(e) => set("oxygenRequirement", e.target.value)} className={SELECT_CLS}>
                  {["aerobic", "anaerobic", "facultative", "microaerophilic", "unknown"].map((o) => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Relationship type">
                <select value={form.relationshipType} onChange={(e) => set("relationshipType", e.target.value)} className={SELECT_CLS}>
                  {["commensal", "mutualistic", "parasitic", "saprophytic", "predation"].map((o) => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Size (μm)" hint="Typical cell diameter or length">
                <input
                  value={form.sizeUm}
                  onChange={(e) => set("sizeUm", e.target.value)}
                  placeholder="e.g. 0.5–1.5"
                  className={INPUT_CLS}
                />
              </Field>
            </div>

            {/* BSL selector */}
            <div className="mt-5">
              <p className="mb-2 text-sm text-slate-200">Biosafety level (BSL)</p>
              <BslSelector value={form.bslLevel} onChange={(v) => set("bslLevel", v)} />
            </div>

            {/* Toggles */}
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Toggle
                checked={form.isInfectious}
                onChange={(v) => set("isInfectious", v)}
                label="Infectious"
                description="Transmissible to hosts"
                color="amber"
              />
              <Toggle
                checked={form.isDangerous}
                onChange={(v) => set("isDangerous", v)}
                label="Dangerous"
                description="Causes significant disease"
                color="pathogen"
              />
              <Toggle
                checked={form.isBeneficial}
                onChange={(v) => set("isBeneficial", v)}
                label="Beneficial"
                description="Has beneficial properties"
                color="benefit"
              />
            </div>
          </Section>

          {/* Description fields */}
          <Section icon={<BookOpen className="h-4 w-4" />} title="Rich descriptions" defaultOpen={false}>
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm text-slate-200">Overview (HTML)</p>
                <RichTextEditor
                  value={form.overviewHtml}
                  onChange={(v) => set("overviewHtml", v)}
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-slate-200">Full description</p>
                <RichTextEditor
                  value={form.descriptionLong}
                  onChange={(v) => set("descriptionLong", v)}
                />
              </div>
            </div>
          </Section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Taxonomy */}
          <Section icon={<Dna className="h-4 w-4" />} title="Taxonomy" badge={form.taxonomy.kingdom || undefined} defaultOpen>
            <div className="space-y-3">
              {[
                ["domain", "Domain", "e.g. Bacteria, Archaea, Eukaryota"],
                ["kingdom", "Kingdom", "e.g. Monera"],
                ["phylum", "Phylum", "e.g. Firmicutes"],
                ["taxClass", "Class", "e.g. Bacilli"],
                ["order", "Order", "e.g. Lactobacillales"],
                ["family", "Family", "e.g. Staphylococcaceae"],
                ["genus", "Genus", "e.g. Staphylococcus"],
                ["species", "Species", "e.g. aureus"],
                ["strain", "Strain", "e.g. MRSA252 (optional)"],
                ["commonClassification", "Common classification", "e.g. Gram-positive cocci"],
              ].map(([key, label, placeholder]) => (
                <Field key={key} label={label}>
                  <input
                    value={(form.taxonomy as any)[key]}
                    onChange={(e) => setTax(key, e.target.value)}
                    placeholder={placeholder}
                    className={INPUT_CLS}
                  />
                </Field>
              ))}
            </div>
          </Section>

          {/* Clinical & treatment */}
          <Section icon={<FlaskConical className="h-4 w-4" />} title="Clinical & treatment" defaultOpen={false}>
            <div className="space-y-4">
              {[
                ["benefitDescription", "Benefit description", "Positive attributes or uses…"],
                ["harmDescription", "Harm description", "Known harms or risks…"],
                ["ecologicalRole", "Ecological role", "Role in its natural environment…"],
                ["pathogenesisMechanism", "Pathogenesis mechanism", "How it causes disease…"],
                ["antibioticProfile", "Antibiotic profile", "Sensitivity / resistance…"],
                ["treatmentOptions", "Treatment options", "Standard treatment approaches…"],
                ["preventionMethods", "Prevention methods", "Vaccination, hygiene, etc.…"],
                ["biosafetyExplanation", "Biosafety explanation", "Lab handling guidelines…"],
              ].map(([key, label, placeholder]) => (
                <Field key={key} label={label}>
                  <textarea
                    value={(form as any)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    rows={3}
                    placeholder={placeholder}
                    className={TEXTAREA_CLS}
                  />
                </Field>
              ))}
            </div>
          </Section>

          {/* Applications */}
          <Section icon={<FlaskConical className="h-4 w-4" />} title="Applications" defaultOpen={false}>
            <div className="space-y-4">
              {[
                ["biotechApplications", "Biotechnology", "Genetic engineering, fermentation…"],
                ["foodIndustryUses", "Food industry", "Fermentation, probiotics…"],
                ["environmentalUses", "Environmental", "Bioremediation, composting…"],
                ["pharmaceuticalUses", "Pharmaceutical", "Drug production, antibiotics…"],
              ].map(([key, label, placeholder]) => (
                <Field key={key} label={label}>
                  <textarea
                    value={(form as any)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    rows={3}
                    placeholder={placeholder}
                    className={TEXTAREA_CLS}
                  />
                </Field>
              ))}
            </div>
          </Section>

          {/* Comma-separated lists */}
          <Section icon={<List className="h-4 w-4" />} title="Lists (comma-separated)" defaultOpen={false}>
            <div className="space-y-4">
              {[
                ["researchMilestones", "Research milestones"],
                ["notableRelatives", "Notable relatives"],
                ["hostOrganisms", "Host organisms"],
                ["interactions", "Interactions"],
                ["specialStructures", "Special structures"],
                ["virulenceFactors", "Virulence factors"],
              ].map(([key, label]) => (
                <Field key={key} label={label} hint="Separate each entry with a comma">
                  <textarea
                    value={(form as any)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    rows={2}
                    placeholder="Entry one, Entry two, Entry three"
                    className={TEXTAREA_CLS}
                  />
                </Field>
              ))}
            </div>
          </Section>

          {/* Linked diseases */}
          <Section
            icon={<Activity className="h-4 w-4" />}
            title="Linked diseases"
            badge={form.diseaseIds.length > 0 ? `${form.diseaseIds.length}` : undefined}
            defaultOpen={false}
          >
            <SearchableChecklist
              items={diseases}
              selectedIds={form.diseaseIds}
              onToggle={toggleDisease}
              placeholder="Search diseases…"
              emptyText="No diseases match your search"
            />
          </Section>

          {/* References */}
          <Section
            icon={<BookOpen className="h-4 w-4" />}
            title="References"
            badge={form.referenceIds.length > 0 ? `${form.referenceIds.length}` : undefined}
            defaultOpen={false}
          >
            <SearchableChecklist
              items={references}
              selectedIds={form.referenceIds}
              onToggle={toggleReference}
              placeholder="Search references…"
              emptyText="No references match your search"
            />
          </Section>
        </div>
      </div>

      {/* ── Live preview ── */}
      {preview && (
        <div className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-6 py-4">
            <Eye className="h-4 w-4 text-cyan" />
            <p className="text-sm font-medium text-cyan">Live preview</p>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-[auto,1fr]">
              {form.imageUrl && (
                <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan">
                  {previewSummary.taxonomy || "Taxonomy not set"}
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">
                  <em>{previewSummary.title}</em>
                </h2>
                <p className="mt-1 text-slate-300">{previewSummary.subtitle}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{previewSummary.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {form.isInfectious && (
                    <span className="rounded-full border border-amber/30 bg-amber/10 px-2.5 py-1 text-xs text-amber">Infectious</span>
                  )}
                  {form.isDangerous && (
                    <span className="rounded-full border border-pathogen/30 bg-pathogen/10 px-2.5 py-1 text-xs text-pathogen">Dangerous</span>
                  )}
                  {form.isBeneficial && (
                    <span className="rounded-full border border-benefit/30 bg-benefit/10 px-2.5 py-1 text-xs text-benefit">Beneficial</span>
                  )}
                  {form.bslLevel && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                      BSL-{form.bslLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
