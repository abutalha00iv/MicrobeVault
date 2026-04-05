"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";

type ImageResult = {
  morphologyAnalysis: string;
  probableMatches: Array<{ name: string; slug?: string; confidence: number; reason: string }>;
  confirmatoryTests: string[];
};

function getCroppedBase64(image: HTMLImageElement, crop: Crop) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width || image.width;
  canvas.height = crop.height || image.height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }
  context.drawImage(
    image,
    (crop.x || 0) * scaleX,
    (crop.y || 0) * scaleY,
    (crop.width || image.width) * scaleX,
    (crop.height || image.height) * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas.toDataURL("image/png").split(",")[1];
}

export function ImageDetectorClient() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 80, height: 80, x: 10, y: 10 });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const transform = useMemo(() => ({ transform: `scale(${zoom})` }), [zoom]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!source || !imgRef.current || !file) {
      setError("Upload an image before submitting.");
      return;
    }

    const imageBase64 = getCroppedBase64(imgRef.current, crop) || source.split(",")[1];

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai/image-detect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          filename: file.name
        })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Image detector request failed.");
      }
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image detector request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-6">
        <label className="mb-4 block rounded-[1.5rem] border border-dashed border-cyan/30 bg-cyan/5 p-5 text-sm text-slate-200">
          Upload microscope image (JPEG/PNG, max 10MB)
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="mt-3 block w-full text-sm"
            onChange={async (event) => {
              const selected = event.target.files?.[0];
              if (!selected) return;
              setFile(selected);
              const reader = new FileReader();
              reader.onload = () => setSource(String(reader.result));
              reader.readAsDataURL(selected);
            }}
          />
        </label>

        {source ? (
          <div className="space-y-4">
            <ReactCrop crop={crop} onChange={(nextCrop) => setCrop(nextCrop)}>
              <img ref={imgRef} src={source} alt="Microscope preview" style={transform} className="max-h-[420px] w-full object-contain" />
            </ReactCrop>
            <label className="block text-sm text-slate-200">
              Zoom
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          </div>
        ) : null}

        <button type="submit" disabled={loading} className="mt-5 rounded-2xl border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm text-cyan">
          {loading ? "Analyzing image..." : "Analyze image"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="rounded-[2rem] border border-pathogen/30 bg-pathogen/10 p-4 text-sm text-rose-100">
          This tool is for educational purposes only. Clinical diagnosis requires trained laboratory professionals.
        </div>
        {error ? <div className="rounded-[2rem] border border-pathogen/30 bg-pathogen/10 p-4 text-sm text-pathogen">{error}</div> : null}
        {result ? (
          <div className="space-y-4">
            <div className="glass-panel rounded-[2rem] p-5">
              <h2 className="font-[var(--font-display)] text-2xl text-white">Morphology analysis</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{result.morphologyAnalysis}</p>
            </div>
            {result.probableMatches.map((match) => (
              <div key={match.name} className="glass-panel rounded-[2rem] p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-[var(--font-display)] text-2xl text-white">{match.name}</p>
                  <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                    {match.confidence}%
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{match.reason}</p>
                {match.slug ? (
                  <a href={`/microbe/${match.slug}`} className="mt-4 inline-flex text-sm text-cyan hover:underline">
                    View profile
                  </a>
                ) : null}
              </div>
            ))}
            <div className="glass-panel rounded-[2rem] p-5">
              <h2 className="font-[var(--font-display)] text-2xl text-white">Recommended confirmatory tests</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {result.confirmatoryTests.map((test) => (
                  <li key={test}>{test}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-300">
            Upload a microscope image to receive morphology analysis and the top three likely organism matches.
          </div>
        )}
      </div>
    </div>
  );
}
