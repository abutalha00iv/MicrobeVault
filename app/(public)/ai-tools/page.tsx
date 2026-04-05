import Link from "next/link";
import { BrainCircuit, Microscope, ShieldCheck } from "lucide-react";

const tools = [
  {
    href: "/ai-tools/trait-identifier",
    title: "Trait-Based Microbe Identifier",
    description: "Match structured phenotype traits against the MicrobeVault database and Claude reasoning output.",
    icon: BrainCircuit
  },
  {
    href: "/ai-tools/image-detector",
    title: "Image-Based AI Detector",
    description: "Upload a microscope image, crop it, and receive morphology analysis plus ranked organism matches.",
    icon: Microscope
  },
  {
    href: "/ai-tools/clinical-support",
    title: "Clinical Decision Support",
    description: "Rank likely pathogens from symptoms, exposure history, immune status, and disease cross-references.",
    icon: ShieldCheck
  }
];

export default function AIToolsLandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">AI Toolkit</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Educational analysis tools</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href} className="glass-panel hover-glow rounded-[2rem] p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-[var(--font-display)] text-2xl text-white">{tool.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
