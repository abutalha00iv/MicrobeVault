"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download, Printer, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Hand, X } from "lucide-react";

type FlowchartViewerProps = {
  id: string;
  title: string;
  mermaidCode?: string | null;
  svgContent: string;
  nodeDescriptions?: Record<string, string> | null;
};

export function FlowchartViewer({ id, mermaidCode, svgContent, nodeDescriptions, title }: FlowchartViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      themeVariables: {
        primaryColor: "#0c3044",
        primaryTextColor: "#e0f7f4",
        primaryBorderColor: "#00F5D4",
        lineColor: "#00d4b8",
        secondaryColor: "#0a1628",
        tertiaryColor: "#0f1e35",
        background: "#070d1a",
        mainBkg: "#0c1a2e",
        nodeBorder: "#00F5D4",
        clusterBkg: "#0a1628",
        clusterBorder: "#1e3a5f",
        titleColor: "#e0f7f4",
        edgeLabelBackground: "#0a1628",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "14px",
      },
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsRendered(false);

    const render = async () => {
      if (!containerRef.current) return;

      if (mermaidCode) {
        try {
          const { svg } = await mermaid.render(`mermaid-${id}`, mermaidCode);
          if (mounted && containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch {
          if (mounted && containerRef.current) {
            containerRef.current.innerHTML = svgContent;
          }
        }
      } else if (mounted && containerRef.current) {
        containerRef.current.innerHTML = svgContent;
      }

      if (mounted && containerRef.current) {
        setIsRendered(true);
        containerRef.current.querySelectorAll("[id]").forEach((el) => {
          if (nodeDescriptions?.[el.id]) {
            (el as HTMLElement).style.cursor = "pointer";
            el.addEventListener("click", () => setActiveNode(el.id));
          }
        });
      }
    };

    void render();
    return () => {
      mounted = false;
    };
  }, [id, mermaidCode, svgContent, nodeDescriptions]);

  // Non-passive wheel handler for zoom-to-cursor
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;

      setScale((prevScale) => {
        const newScale = Math.min(5, Math.max(0.2, prevScale * factor));
        const ratio = newScale / prevScale;
        const relX = mouseX - centerX;
        const relY = mouseY - centerY;
        setPan((prevPan) => ({
          x: relX - (relX - prevPan.x) * ratio,
          y: relY - (relY - prevPan.y) * ratio,
        }));
        return newScale;
      });
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", onWheel);
  }, []);

  // Escape to exit fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const download = async (mode: "png" | "pdf") => {
    if (!containerRef.current) return;
    const dataUrl = await toPng(containerRef.current, {
      cacheBust: true,
      backgroundColor: "#070d1a",
    });
    if (mode === "png") {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
    } else {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px" });
      pdf.addImage(dataUrl, "PNG", 24, 24, 780, 420);
      pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    }
  };

  const zoomPct = Math.round(scale * 100);

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 flex flex-col gap-4 bg-[#04080f] p-6" : "space-y-4"}>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: zoom + view controls */}
        <div className="flex items-center gap-2">
          {/* Zoom pill */}
          <div className="flex items-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => {
                setScale((s) => {
                  const n = Math.max(0.2, s * 0.85);
                  return n;
                });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3.5rem] text-center font-mono text-xs text-slate-300">{zoomPct}%</span>
            <button
              type="button"
              onClick={() => {
                setScale((s) => Math.min(5, s * 1.15));
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={reset}
            className="flex h-9 items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Right: export buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => download("png")}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan transition-colors hover:bg-cyan/20"
          >
            <Download className="h-3.5 w-3.5" />
            PNG
          </button>
          <button
            type="button"
            onClick={() => download("pdf")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        ref={wrapperRef}
        className="relative overflow-hidden rounded-[2rem]"
        style={{
          height: isFullscreen ? "calc(100vh - 160px)" : "580px",
          background: "linear-gradient(135deg, #070d1a 0%, #080f1e 50%, #060c18 100%)",
          border: "1px solid rgba(0, 245, 212, 0.12)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,245,212,0.06)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,245,212,0.18) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.35,
          }}
        />
        {/* Ambient glow spots */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-400/[0.05] blur-3xl" />

        {/* Pannable / zoomable layer */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
            willChange: "transform",
            transition: isDragging ? "none" : "transform 0.12s ease-out",
          }}
        >
          <div
            ref={containerRef}
            className="[&_svg]:h-auto [&_svg]:max-w-full [&_svg_text]:font-sans"
          />
        </div>

        {/* Drag / scroll hint */}
        {isRendered && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/50 px-3 py-1 text-xs text-slate-500 backdrop-blur-sm">
            <Hand className="h-3 w-3" />
            Drag to pan · Scroll to zoom
          </div>
        )}

        {/* Zoom badge — top right */}
        <div className="pointer-events-none absolute right-4 top-4 rounded-xl border border-white/[0.08] bg-black/40 px-2 py-1 font-mono text-xs text-slate-500 backdrop-blur-sm">
          {zoomPct}%
        </div>
      </div>

      {/* ── Node description panel ── */}
      {activeNode && nodeDescriptions?.[activeNode] && (
        <div className="relative overflow-hidden rounded-3xl border border-cyan/20 p-5"
          style={{
            background: "linear-gradient(135deg, rgba(0,245,212,0.06) 0%, rgba(59,130,246,0.03) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveNode(null)}
            className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3">
            <div
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan"
              style={{ boxShadow: "0 0 10px rgba(0,245,212,0.8)" }}
            />
            <div>
              <p className="text-sm font-semibold text-white">Node explanation</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{nodeDescriptions[activeNode]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
