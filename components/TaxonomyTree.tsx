"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { TaxonomyNode } from "@/lib/types";

const LEVEL_STYLES: Record<string, { badge: string; dot: string; border: string }> = {
  kingdom: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    border: "border-l-violet-500/50",
  },
  phylum: {
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    border: "border-l-blue-500/50",
  },
  class: {
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    dot: "bg-cyan-400",
    border: "border-l-cyan-500/50",
  },
  order: {
    badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    dot: "bg-teal-400",
    border: "border-l-teal-500/50",
  },
  family: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    border: "border-l-amber-500/50",
  },
  genus: {
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
    border: "border-l-orange-500/50",
  },
  species: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
    border: "border-l-rose-500/50",
  },
};

function getLevelStyle(level: string) {
  return (
    LEVEL_STYLES[level.toLowerCase()] ?? {
      badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
      dot: "bg-slate-400",
      border: "border-l-slate-500/50",
    }
  );
}

export function TaxonomyTree({
  nodes,
  onSelect,
}: {
  nodes: TaxonomyNode[];
  onSelect?: (node: TaxonomyNode) => void;
}) {
  return (
    <div className="space-y-1.5">
      {nodes.map((node) => (
        <TaxonomyTreeNode
          key={`${node.level}-${node.label}`}
          node={node}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
}

function TaxonomyTreeNode({
  node,
  onSelect,
  depth,
}: {
  node: TaxonomyNode;
  onSelect?: (node: TaxonomyNode) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = Boolean(node.children?.length);
  const style = getLevelStyle(node.level);

  return (
    <div className={depth > 0 ? `ml-4 border-l-2 pl-3 ${style.border}` : ""}>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) setOpen((v) => !v);
          onSelect?.(node);
        }}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {/* Expand / collapse chevron */}
          {hasChildren ? (
            open ? (
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            )
          ) : (
            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${style.dot}`} />
          )}

          {/* Label */}
          <span className="min-w-0 truncate text-sm font-medium text-white">
            {node.label}
          </span>
        </span>

        <span className="flex flex-shrink-0 items-center gap-2">
          {/* Level badge */}
          <span
            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${style.badge}`}
          >
            {node.level}
          </span>
          {/* Count badge */}
          {node.count !== undefined ? (
            <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              {node.count}
            </span>
          ) : null}
        </span>
      </button>

      {open && hasChildren ? (
        <div className="mt-1 space-y-1">
          {node.children!.map((child) => (
            <TaxonomyTreeNode
              key={`${child.level}-${child.label}`}
              node={child}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
