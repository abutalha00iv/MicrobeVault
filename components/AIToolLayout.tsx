import Link from "next/link";
import { BrainCircuit, Microscope, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_LINKS = [
  {
    href: "/ai-tools/trait-identifier",
    label: "Trait Identifier",
    icon: BrainCircuit
  },
  {
    href: "/ai-tools/image-detector",
    label: "Image AI",
    icon: Microscope
  },
  {
    href: "/ai-tools/clinical-support",
    label: "Clinical Support",
    icon: ShieldCheck
  }
];

export function AIToolLayout({
  activeHref,
  title,
  description,
  children
}: {
  activeHref: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
        <aside className="glass-panel h-fit rounded-[2rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan">AI Toolkit</p>
          <nav className="mt-5 space-y-2">
            {TOOL_LINKS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                    activeHref === tool.href
                      ? "border-cyan/30 bg-cyan/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan/20 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 text-cyan" />
                  {tool.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">MicrobeVault AI</p>
            <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
