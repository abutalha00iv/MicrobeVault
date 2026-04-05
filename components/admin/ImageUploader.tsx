"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Link, X, ImageIcon, CheckCircle2, Loader2 } from "lucide-react";

const IMAGE_TYPES = [
  { value: "illustration", label: "Illustration / Artwork" },
  { value: "microscopy", label: "Microscopy photo" },
  { value: "electron-microscopy", label: "Electron microscopy (SEM/TEM)" },
  { value: "diagram", label: "Diagram / Schematic" },
  { value: "photo", label: "Clinical / Lab photo" },
];

type Props = {
  value?: string;
  imageType?: string;
  imageCaption?: string;
  onChange: (url: string) => void;
  onImageTypeChange?: (type: string) => void;
  onCaptionChange?: (caption: string) => void;
};

export function ImageUploader({
  value,
  imageType = "illustration",
  imageCaption = "",
  onChange,
  onImageTypeChange,
  onCaptionChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const upload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium transition ${
              tab === t
                ? "bg-cyan/15 text-cyan"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t === "upload" ? <Upload className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
            {t === "upload" ? "Upload file" : "Paste URL"}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-cyan bg-cyan/10"
              : "border-cyan/20 bg-cyan/[0.04] hover:border-cyan/40 hover:bg-cyan/[0.08]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-cyan" />
              <p className="text-sm font-medium text-cyan">Uploading image…</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/10">
                <Upload className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Drop image here or{" "}
                  <span className="text-cyan underline underline-offset-2">browse files</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPEG, WebP, GIF — max 10 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL paste tab */}
      {tab === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyUrl(); } }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm text-cyan transition hover:bg-cyan/20"
            >
              Apply
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Paste any publicly accessible image URL (Cloudinary, Wikimedia, etc.)
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="flex items-center gap-2 text-xs text-pathogen">
          <span className="h-1 w-1 rounded-full bg-pathogen" />
          {error}
        </p>
      )}

      {/* Preview */}
      {value && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="relative h-52 w-full">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 480px"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-sm transition hover:bg-pathogen/80 hover:text-white"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3 text-benefit" />
              Image ready
            </div>
          </div>

          {/* Image metadata controls */}
          <div className="space-y-2 border-t border-white/10 p-3">
            <div className="flex gap-2">
              <select
                value={imageType}
                onChange={(e) => onImageTypeChange?.(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              >
                {IMAGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <input
              value={imageCaption}
              onChange={(e) => onCaptionChange?.(e.target.value)}
              placeholder="Image caption (optional)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan/40 focus:outline-none"
            />
            <div className="flex min-w-0 items-center gap-1.5">
              <ImageIcon className="h-3 w-3 shrink-0 text-slate-600" />
              <p className="truncate text-[10px] text-slate-600">{value}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
