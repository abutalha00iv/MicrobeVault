"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TaxonomyTree } from "@/components/TaxonomyTree";
import { TaxonomyNode } from "@/lib/types";

const TABS = [
  "Overview",
  "Characteristics",
  "Classification",
  "History & Discovery",
  "Ecology & Relationships",
  "Clinical / Medical",
  "Industrial & Beneficial Uses"
] as const;

type MicrobeProfileTabsProps = {
  microbe: {
    scientificName: string;
    descriptionLong: string;
    overviewHtml?: string | null;
    habitat?: string | null;
    cellWall?: string | null;
    reproductionMethod?: string | null;
    metabolicType?: string | null;
    growthConditions?: string | null;
    colonialMorphology?: string | null;
    specialStructures?: unknown;
    taxonomy?: {
      domain?: string | null;
      kingdom?: string | null;
      phylum?: string | null;
      taxClass?: string | null;
      order?: string | null;
      family?: string | null;
      genus?: string | null;
      species?: string | null;
      strain?: string | null;
      commonClassification?: string | null;
    } | null;
    ncbiTaxonomyId?: number | null;
    phylogeneticPosition?: string | null;
    notableRelatives?: unknown;
    discoveryContext?: string | null;
    researchMilestones?: unknown;
    historicalSignificance?: string | null;
    namedAfter?: string | null;
    relationshipType?: string | null;
    hostOrganisms?: unknown;
    roleInMicrobiome?: string | null;
    ecologicalRole?: string | null;
    interactions?: unknown;
    isInfectious: boolean;
    diseases: Array<{
      disease: { slug: string; name: string };
    }>;
    pathogenesisMechanism?: string | null;
    virulenceFactors?: unknown;
    antibioticProfile?: string | null;
    treatmentOptions?: string | null;
    preventionMethods?: string | null;
    biosafetyExplanation?: string | null;
    biotechApplications?: string | null;
    foodIndustryUses?: string | null;
    environmentalUses?: string | null;
    pharmaceuticalUses?: string | null;
    morphology?: string | null;
    oxygenRequirement?: string | null;
  };
};

function toList(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function buildTaxonomyNodes(taxonomy?: MicrobeProfileTabsProps["microbe"]["taxonomy"]): TaxonomyNode[] {
  if (!taxonomy) return [];

  const levels = [
    ["Domain", taxonomy.domain],
    ["Kingdom", taxonomy.kingdom],
    ["Phylum", taxonomy.phylum],
    ["Class", taxonomy.taxClass],
    ["Order", taxonomy.order],
    ["Family", taxonomy.family],
    ["Genus", taxonomy.genus],
    ["Species", taxonomy.species],
    ["Strain", taxonomy.strain]
  ].filter((item) => item[1]) as Array<[string, string]>;

  if (!levels.length) return [];

  const [root, ...rest] = levels;
  const node: TaxonomyNode = { level: root[0].toLowerCase(), label: root[1], children: [] };
  let current = node;
  rest.forEach(([level, label]) => {
    const child: TaxonomyNode = { level: level.toLowerCase(), label, children: [] };
    current.children = [child];
    current = child;
  });
  return [node];
}

export function MicrobeProfileTabs({ microbe }: MicrobeProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const taxonomyNodes = useMemo(() => buildTaxonomyNodes(microbe.taxonomy || undefined), [microbe.taxonomy]);
  const milestones = toList(microbe.researchMilestones);
  const notableRelatives = toList(microbe.notableRelatives);
  const hostOrganisms = toList(microbe.hostOrganisms);
  const interactions = toList(microbe.interactions);
  const specialStructures = toList(microbe.specialStructures);
  const virulenceFactors = toList(microbe.virulenceFactors);

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-3 py-2 text-xs ${activeTab === tab ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-slate-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="glass-panel rounded-[2rem] p-6 md:p-8">
        {activeTab === "Overview" ? (
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="prose-microbe">
              {microbe.overviewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: microbe.overviewHtml }} />
              ) : (
                microbe.descriptionLong.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Habitat</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.habitat || "Habitat not recorded."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Where found in nature</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.ecologicalRole || "Ecological context unavailable."}</p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Characteristics" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {[
                  ["Morphology", microbe.morphology],
                  ["Cell wall", microbe.cellWall],
                  ["Reproduction method", microbe.reproductionMethod],
                  ["Metabolic type", microbe.metabolicType],
                  ["Growth conditions", microbe.growthConditions],
                  ["Colonial morphology", microbe.colonialMorphology],
                  ["Special structures", specialStructures.join(", ") || "None recorded"],
                  ["Oxygen requirement", microbe.oxygenRequirement]
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-4 pr-6 align-top text-slate-400">{label}</td>
                    <td className="py-4 text-slate-200">{value || "Not available"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === "Classification" ? (
          <div className="grid gap-8 lg:grid-cols-[0.8fr,1.2fr]">
            <TaxonomyTree nodes={taxonomyNodes} />
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">NCBI taxonomy ID</p>
                <p className="mt-2 text-sm text-slate-200">
                  {microbe.ncbiTaxonomyId ? (
                    <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/${microbe.ncbiTaxonomyId}`} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
                      {microbe.ncbiTaxonomyId}
                    </Link>
                  ) : (
                    "Unavailable"
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Phylogenetic position</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.phylogeneticPosition || "Phylogenetic summary unavailable."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Notable relatives</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{notableRelatives.join(", ") || "No relatives listed."}</p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "History & Discovery" ? (
          <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm leading-7 text-slate-200">{microbe.discoveryContext || "Discovery narrative unavailable."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Historical significance</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.historicalSignificance || "Historical significance unavailable."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Named after</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.namedAfter || "Naming origin unavailable."}</p>
              </div>
            </div>
            <div className="space-y-3">
              {milestones.length ? (
                milestones.map((milestone) => (
                  <div key={milestone} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
                    {milestone}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
                  Key research milestones are not currently listed.
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "Ecology & Relationships" ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Relationship type</p>
                <p className="mt-2 text-sm capitalize text-slate-200">{microbe.relationshipType || "Unknown"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Host organisms</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{hostOrganisms.join(", ") || "No host list available."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Role in microbiome</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.roleInMicrobiome || "Microbiome role unavailable."}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Environmental role</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.ecologicalRole || "Environmental role unavailable."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Interactions with microorganisms</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{interactions.join(", ") || "Interactions unavailable."}</p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Clinical / Medical" ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Infectious?</p>
                <p className={`mt-2 text-sm ${microbe.isInfectious ? "text-pathogen" : "text-benefit"}`}>{microbe.isInfectious ? "Yes" : "No"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Diseases caused</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {microbe.diseases.length ? (
                    microbe.diseases.map((entry) => (
                      <Link key={entry.disease.slug} href={`/disease/${entry.disease.slug}`} className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                        {entry.disease.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-sm text-slate-200">No disease associations recorded.</span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pathogenesis mechanism</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.pathogenesisMechanism || "Pathogenesis summary unavailable."}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Virulence factors</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{virulenceFactors.join(", ") || "Not recorded."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Antibiotic profile</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.antibioticProfile || "Antimicrobial profile unavailable."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Treatment, prevention, biosafety</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{microbe.treatmentOptions || "Treatment options unavailable."}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{microbe.preventionMethods || "Prevention notes unavailable."}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{microbe.biosafetyExplanation || "Biosafety summary unavailable."}</p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Industrial & Beneficial Uses" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              ["Biotechnology applications", microbe.biotechApplications],
              ["Food industry", microbe.foodIndustryUses],
              ["Environmental uses", microbe.environmentalUses],
              ["Pharmaceutical uses", microbe.pharmaceuticalUses]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{value || "No information available."}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

