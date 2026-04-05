/**
 * seed-remaining.ts — adds microbes from microbes_full.json that are not yet in the DB,
 * along with verified Wikimedia image URLs.
 *
 * Run with: npx tsx prisma/seed-remaining.ts
 */

import { PrismaClient } from "@prisma/client";
import fullJson from "./microbes_full.json";

const prisma = new PrismaClient();

type CompactSeed = (typeof fullJson)[number];

// ── Verified Wikimedia direct URLs (from fix-data.ts API lookups) ─────────────
const VERIFIED_IMAGE_URLS: Record<string, string> = {
  "neisseria-gonorrhoeae":    "https://upload.wikimedia.org/wikipedia/commons/e/ec/Neisseria_gonorrhoeae_PHIL_3693_lores.jpg",
  "borrelia-burgdorferi":     "https://upload.wikimedia.org/wikipedia/commons/6/6e/Borrelia_burgdorferi_01.jpg",
  "klebsiella-pneumoniae":    "https://upload.wikimedia.org/wikipedia/commons/2/28/Klebsiella_pneumoniae.jpg",
  "mrsa":                     "https://upload.wikimedia.org/wikipedia/commons/5/57/Staphylococcus_aureus_01.jpg",
  "nitrosomonas-europaea":    "https://upload.wikimedia.org/wikipedia/commons/f/f3/Archaea.jpg",
  "rhizobium-leguminosarum":  "https://upload.wikimedia.org/wikipedia/commons/9/9e/Rhizobium_leguminosarum.jpg",
  "thermus-aquaticus":        "https://upload.wikimedia.org/wikipedia/commons/f/f5/Grand_prismatic_spring.jpg",
  "cryptococcus-neoformans":  "https://upload.wikimedia.org/wikipedia/commons/3/35/Cryptococcus_neoformans_using_a_light_India_ink_staining_preparation_PHIL_3771_lores.jpg",
  "trichophyton-rubrum":      "https://upload.wikimedia.org/wikipedia/commons/3/37/Trichophyton_rubrum_PHIL_4924_lores.jpg",
  "histoplasma-capsulatum":   "https://upload.wikimedia.org/wikipedia/commons/d/d3/Histoplasma_capsulatum.jpg",
  "coccidioides-immitis":     "https://upload.wikimedia.org/wikipedia/commons/2/20/Coccidioides_immitis_spherule.jpg",
  "herpes-simplex-virus-1":   "https://upload.wikimedia.org/wikipedia/commons/3/3b/Herpes_simplex_virus_TEM_B82-0671_lores.jpg",
  "poliovirus":               "https://upload.wikimedia.org/wikipedia/commons/7/70/Poliovirus_capsid.jpg",
  "variola-virus":            "https://upload.wikimedia.org/wikipedia/commons/8/8b/Smallpox_virus_virions_EM_PHIL_1849_lores.jpg",
  "bacteriophage-t4":         "https://upload.wikimedia.org/wikipedia/commons/4/4c/Bacteriophage.jpg",
  "halobacterium-salinarum":  "https://upload.wikimedia.org/wikipedia/commons/7/72/Halobacterium_salinarum.jpg",
  "thermococcus-kodakarensis":"https://upload.wikimedia.org/wikipedia/commons/f/f3/Archaea.jpg",
  "entamoeba-histolytica":    "https://upload.wikimedia.org/wikipedia/commons/4/4e/Entamoeba_histolytica_01.jpg",
  "giardia-lamblia":          "https://upload.wikimedia.org/wikipedia/commons/a/a0/Giardia_lamblia_SEM_8698_lores.jpg",
  "chlamydomonas-reinhardtii":"https://upload.wikimedia.org/wikipedia/commons/0/06/Chlamydomonas_TEM_09.jpg",
  "prochlorococcus-marinus":  "https://upload.wikimedia.org/wikipedia/commons/5/5e/Prochlorococcus.jpg",
  "bse-prion":                "https://upload.wikimedia.org/wikipedia/commons/b/bd/Neuron.jpg",
  "scrapie-prion":            "https://upload.wikimedia.org/wikipedia/commons/b/bd/Neuron.jpg",
  "treponema-pallidum":       "https://upload.wikimedia.org/wikipedia/commons/b/b3/Treponema_pallidum_EM.jpg",
  "pseudomonas-aeruginosa":   "https://upload.wikimedia.org/wikipedia/commons/7/70/Pseudomonas_aeruginosa.jpg",
  "rabies-virus":             "https://upload.wikimedia.org/wikipedia/commons/f/f5/Rabies_virus.jpg",
  "hepatitis-b-virus":        "https://upload.wikimedia.org/wikipedia/commons/2/2e/Hepatitis_B_Virus.jpg",
  "sulfolobus-acidocaldarius": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Grand_prismatic_spring.jpg",
  "trypanosoma-brucei":       "https://upload.wikimedia.org/wikipedia/commons/8/88/Trypanosoma_brucei_brucei_Scan_Electron_Micrograph.jpg",
  "leishmania-donovani":      "https://upload.wikimedia.org/wikipedia/commons/1/15/Leishmania_donovani_01.jpg",
};

// Fallback for any slug not in the verified map
const FALLBACK_BY_KINGDOM: Record<string, string> = {
  "Bacteria":  "https://upload.wikimedia.org/wikipedia/commons/5/57/Staphylococcus_aureus_01.jpg",
  "Fungi":     "https://upload.wikimedia.org/wikipedia/commons/e/e7/Aspergillus_fumigatus.jpg",
  "Viruses":   "https://upload.wikimedia.org/wikipedia/commons/0/00/SARS-CoV-2_without_background.png",
  "Archaea":   "https://upload.wikimedia.org/wikipedia/commons/f/f3/Archaea.jpg",
  "Protozoa":  "https://upload.wikimedia.org/wikipedia/commons/a/a0/Giardia_lamblia_SEM_8698_lores.jpg",
  "Algae":     "https://upload.wikimedia.org/wikipedia/commons/6/61/Green_algae.jpg",
  "Prions":    "https://upload.wikimedia.org/wikipedia/commons/b/bd/Neuron.jpg",
};

function expandCompact(seed: CompactSeed) {
  const harmful = seed.isDangerous
    ? `${seed.scientificName} is associated with clinically important disease and requires careful interpretation in human or animal specimens.`
    : "";
  const beneficial = seed.isBeneficial
    ? `${seed.scientificName} is valued for its ecological or biotechnological contribution and is not primarily known as a pathogen.`
    : "";

  const sizeUm =
    seed.kingdomLabel === "Viruses" ? "0.02–0.3"
    : seed.kingdomLabel === "Prions" ? "Submicroscopic"
    : seed.kingdomLabel === "Protozoa" ? "5–50"
    : seed.kingdomLabel === "Algae" ? "2–20"
    : "0.5–5";

  const motility =
    ["spirochete", "helical", "pleomorphic"].includes(seed.morphology) ||
    seed.scientificName.includes("Giardia");

  const sporeForming =
    seed.scientificName.includes("Bacillus") ||
    seed.scientificName.includes("Clostridium");

  const temperatureRange =
    seed.kingdomLabel === "Archaea" && seed.scientificName.includes("Thermo") ? "70–95 °C"
    : seed.kingdomLabel === "Algae" ? "15–30 °C"
    : "20–37 °C";

  const phRange =
    seed.scientificName.includes("Sulfolobus") ? "2.0–4.0"
    : seed.kingdomLabel === "Algae" ? "6.0–8.0"
    : "6.0–7.5";

  const pathogenesisMechanism = seed.isDangerous
    ? `${seed.scientificName} causes harm through host colonization, tissue tropism, and virulence determinants.`
    : `${seed.scientificName} is not primarily a pathogen and is better known for its ecological or laboratory significance.`;

  const antibioticProfile =
    seed.kingdomLabel === "Bacteria"
      ? "Antimicrobial susceptibility varies by lineage; stewardship and laboratory testing remain essential."
      : seed.kingdomLabel === "Fungi"
        ? "Antifungal susceptibility depends on species identity and host context."
        : seed.kingdomLabel === "Viruses"
          ? "Antiviral options are virus-specific and often limited."
          : "Classical antibiotic susceptibility is not a defining feature for this organism.";

  const treatmentOptions = seed.isDangerous
    ? `Therapy depends on the syndrome linked to ${seed.scientificName}, host factors, and local resistance data.`
    : `No routine treatment is generally required because ${seed.scientificName} is not primarily pathogenic.`;

  const preventionMethods = seed.isDangerous
    ? "Prevention centers on exposure control, hygiene, vector or reservoir management, and vaccination when available."
    : "Stewardship involves preserving the relevant habitat or culture conditions and avoiding contamination.";

  const descriptionShort = `${seed.commonName} is a ${seed.taxonomy.commonClassification.toLowerCase()} catalogued in MicrobeVault for taxonomy, ecology, and clinical significance.`;
  const p1 = `${seed.scientificName} was described by ${seed.discoveredBy} in ${seed.discoveryYear}. ${seed.discoveryContext}`;
  const p2 = `The organism is typically encountered in ${seed.habitat.toLowerCase()} and plays the following ecological role: ${seed.ecologicalRole.toLowerCase()}.`;
  const p3 = seed.isDangerous
    ? `${harmful} Clinical interpretation should consider ${pathogenesisMechanism.toLowerCase()}`
    : `${beneficial || `${seed.scientificName} is notable for its usefulness in research and ecosystem function.`}`;

  return {
    ...seed,
    sizeUm,
    motility,
    sporeForming,
    temperatureRange,
    phRange,
    bslLevel: seed.isDangerous ? 2 : 1,
    isInfectious: seed.isDangerous,
    benefitDescription: beneficial,
    harmDescription: harmful,
    pathogenesisMechanism,
    antibioticProfile,
    treatmentOptions,
    preventionMethods,
    biotechApplications: seed.isBeneficial
      ? `${seed.scientificName} is useful in teaching, biotechnology, or systems biology.`
      : `Research on ${seed.scientificName} informs pathogenesis, diagnostics, or public health preparedness.`,
    foodIndustryUses: seed.scientificName.includes("Saccharomyces")
      ? "Central yeast in baking, brewing, and fermentation."
      : seed.scientificName.includes("Lactobacillus") ? "Common probiotic and fermentation-associated bacterium." : "",
    environmentalUses: seed.scientificName.includes("Rhizobium") || seed.scientificName.includes("Nitrosomonas")
      ? `Supports environmental cycling through ${seed.ecologicalRole.toLowerCase()}.` : "",
    pharmaceuticalUses: seed.scientificName.includes("Penicillium")
      ? "Historically linked to penicillin discovery and antibiotic development."
      : seed.scientificName.includes("Thermus") ? "Taq polymerase transformed diagnostics and molecular biology." : "",
    hostOrganisms: seed.relationshipType === "mutualistic" ? ["Humans", "Plants"]
      : seed.relationshipType === "parasitic" ? ["Humans", "Animals"] : ["Environment"],
    interactions: [`Interacts with surrounding microbiota or host tissues according to its ${seed.relationshipType} lifestyle.`],
    specialStructures: seed.kingdomLabel === "Viruses" ? ["Capsid", "Envelope when applicable"]
      : seed.kingdomLabel === "Prions" ? ["Misfolded PrP conformer"]
      : seed.kingdomLabel === "Fungi" ? ["Cell wall", "Spore or budding structures"]
      : ["Surface proteins"],
    virulenceFactors: seed.isDangerous
      ? [`Disease linked to ${seed.scientificName} depends on adhesion, replication, immune evasion, or toxin-like mechanisms.`]
      : [],
    notableRelatives: [`Related members of ${seed.taxonomy.genus}`],
    researchMilestones: [`${seed.discoveryYear}: ${seed.discoveryContext}`],
    randomFacts: [
      `${seed.scientificName} belongs to ${seed.taxonomy.commonClassification.toLowerCase()}.`,
      `${seed.scientificName} is catalogued in the ${seed.kingdomLabel.toLowerCase()} section of MicrobeVault.`
    ],
    descriptionShort,
    descriptionLong: `${p1}\n\n${p2}\n\n${p3}`,
    overviewHtml: `<p>${p1}</p><p>${p2}</p><p>${p3}</p>`,
  };
}

async function main() {
  console.log("=== seed-remaining: adding microbes from microbes_full.json ===\n");

  // Find which slugs already exist
  const existing = await prisma.microbe.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map((m) => m.slug));
  console.log(`Already in DB: ${existingSlugs.size} microbes`);

  const toAdd = fullJson.filter((m) => !existingSlugs.has(m.slug));
  console.log(`To add: ${toAdd.length} microbes\n`);

  if (toAdd.length === 0) {
    console.log("Nothing to add. Exiting.");
    return;
  }

  // Get admin for references
  const admin = await prisma.admin.findFirst();
  if (!admin) { console.error("No admin found — run seed.ts first."); return; }

  // Get reference map
  const references = await prisma.reference.findMany({ select: { id: true, doi: true, journalOrPublisher: true } });
  const refByPublisher = new Map(references.map((r) => [r.journalOrPublisher, r.id]));

  function refIdForKingdom(kingdom: string): string | undefined {
    const map: Record<string, string> = {
      Bacteria: "Bergey's Manual of Systematic Bacteriology",
      Fungi: "MycoBank Database",
      Viruses: "ICTV Reports",
      Archaea: "Bergey's Manual of Systematic Bacteriology",
      Protozoa: "Harrison's Principles of Internal Medicine",
      Algae: "Introduction to Microbiology",
      Prions: "Harrison's Principles of Internal Medicine",
    };
    return refByPublisher.get(map[kingdom] ?? "");
  }

  // Get/create disease map
  const diseaseRecords = await prisma.disease.findMany({ select: { id: true, slug: true } });
  const diseaseMap = new Map(diseaseRecords.map((d) => [d.slug, d.id]));

  let added = 0;

  for (const compact of toAdd) {
    const seed = expandCompact(compact);
    const imageUrl =
      VERIFIED_IMAGE_URLS[seed.slug] ??
      FALLBACK_BY_KINGDOM[seed.kingdomLabel] ??
      "https://upload.wikimedia.org/wikipedia/commons/5/57/Staphylococcus_aureus_01.jpg";

    try {
      // Create disease records if missing
      for (const dSlug of seed.diseaseSlugs) {
        if (!diseaseMap.has(dSlug)) {
          const name = dSlug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
          const d = await prisma.disease.create({
            data: {
              name,
              slug: dSlug,
              description: `${name} is a clinically relevant infectious syndrome.`,
              bodySystem: "systemic",
              severity: seed.isDangerous ? "severe" : "moderate",
              transmissionRoute: "Varies by exposure",
              incubationPeriod: "Variable",
              symptoms: ["fever", "malaise", "site-specific inflammation"],
              treatment: "Organism-directed therapy based on culture and sensitivity.",
              pathogenesis: `Pathogenesis involves ${seed.pathogenesisMechanism.toLowerCase()}`,
              diagnosisMethods: "Clinical assessment combined with microbiology and molecular testing.",
              management: "Supportive care plus organism-directed therapy.",
              prevention: "Exposure control, hygiene, vaccination where available.",
              distributionRegions: ["global"],
              outbreakTimeline: [],
              overviewHtml: `<p>${name} is a clinically relevant infectious syndrome.</p>`,
            },
          });
          diseaseMap.set(dSlug, d.id);
        }
      }

      const microbe = await prisma.microbe.create({
        data: {
          slug: seed.slug,
          commonName: seed.commonName,
          scientificName: seed.scientificName,
          descriptionShort: seed.descriptionShort,
          descriptionLong: seed.descriptionLong,
          overviewHtml: seed.overviewHtml,
          discoveryYear: seed.discoveryYear,
          discoveredBy: seed.discoveredBy,
          discoveryContext: seed.discoveryContext,
          gramStain: seed.gramStain,
          morphology: seed.morphology,
          sizeUm: seed.sizeUm,
          motility: seed.motility,
          sporeForming: seed.sporeForming,
          oxygenRequirement: seed.oxygenRequirement,
          temperatureRange: seed.temperatureRange,
          phRange: seed.phRange,
          habitat: seed.habitat,
          isInfectious: seed.isInfectious,
          isDangerous: seed.isDangerous,
          bslLevel: seed.bslLevel,
          isBeneficial: seed.isBeneficial,
          benefitDescription: seed.benefitDescription,
          harmDescription: seed.harmDescription,
          ecologicalRole: seed.ecologicalRole,
          relationshipType: seed.relationshipType,
          ncbiTaxonomyId: seed.ncbiTaxonomyId,
          imageUrl,
          kingdomLabel: seed.kingdomLabel,
          cellWall:
            seed.kingdomLabel === "Bacteria"
              ? `${seed.taxonomy.commonClassification} envelope adapted to its lineage.`
              : seed.kingdomLabel === "Fungi"
                ? "Chitin- and glucan-containing fungal wall."
                : seed.kingdomLabel === "Viruses"
                  ? "No cell wall; genome packaged in capsid and sometimes envelope."
                  : "Cell covering varies with the organism.",
          reproductionMethod:
            seed.kingdomLabel === "Viruses" ? "Replication inside host cells."
            : seed.kingdomLabel === "Fungi" ? "Budding or sporulation depending on form."
            : seed.kingdomLabel === "Protozoa" ? "Asexual replication with stage-specific transitions."
            : "Binary fission or lineage-specific cell division.",
          metabolicType: `${seed.oxygenRequirement} metabolism consistent with ${seed.taxonomy.commonClassification.toLowerCase()}.`,
          growthConditions: `Typical growth range: ${seed.temperatureRange}, pH ${seed.phRange}.`,
          colonialMorphology: `${seed.scientificName} produces lineage-appropriate morphology in culture or microscopy.`,
          specialStructures: seed.specialStructures,
          phylogeneticPosition: `${seed.scientificName} belongs to ${seed.taxonomy.family} within ${seed.taxonomy.order}.`,
          notableRelatives: seed.notableRelatives,
          researchMilestones: seed.researchMilestones,
          historicalSignificance: `${seed.scientificName} remains significant because ${seed.discoveryContext.toLowerCase()}`,
          namedAfter: `Naming of ${seed.scientificName} follows historical taxonomic conventions.`,
          hostOrganisms: seed.hostOrganisms,
          roleInMicrobiome:
            seed.relationshipType === "commensal" || seed.relationshipType === "mutualistic"
              ? `${seed.scientificName} can participate in stable host-associated communities.`
              : null,
          interactions: seed.interactions,
          pathogenesisMechanism: seed.pathogenesisMechanism,
          virulenceFactors: seed.virulenceFactors,
          antibioticProfile: seed.antibioticProfile,
          treatmentOptions: seed.treatmentOptions,
          preventionMethods: seed.preventionMethods,
          biosafetyExplanation: `BSL-${seed.bslLevel} reflects the containment expectations for ${seed.scientificName}.`,
          biotechApplications: seed.biotechApplications,
          foodIndustryUses: seed.foodIndustryUses,
          environmentalUses: seed.environmentalUses,
          pharmaceuticalUses: seed.pharmaceuticalUses,
          randomFacts: seed.randomFacts,
          taxonomy: {
            create: { ...seed.taxonomy },
          },
        },
      });

      // Disease links
      for (const dSlug of seed.diseaseSlugs) {
        const diseaseId = diseaseMap.get(dSlug);
        if (diseaseId) {
          await prisma.microbeDisease.createMany({
            data: [{ microbeId: microbe.id, diseaseId, role: "primary_cause" }],
            skipDuplicates: true,
          });
        }
      }

      // Images
      await prisma.microbeImage.createMany({
        data: [
          {
            microbeId: microbe.id,
            imageUrl,
            imageType: seed.kingdomLabel === "Viruses" ? "SEM" : "light",
            caption: `${seed.scientificName} microscopy image`,
            sourceCredit: "Wikimedia Commons",
            altText: `${seed.scientificName} microscopy image`,
            isPrimary: true,
          },
        ],
      });

      // Reference
      const refId = refIdForKingdom(seed.kingdomLabel);
      if (refId) {
        await prisma.microbeReference.createMany({
          data: [{ microbeId: microbe.id, referenceId: refId, contextNote: "Seeded profile reference" }],
          skipDuplicates: true,
        });
      }

      // NCBI reference
      if (seed.ncbiTaxonomyId) {
        const ncbiRef = await prisma.reference.upsert({
          where: { doi: `ncbi-taxonomy-${seed.ncbiTaxonomyId}` },
          update: {},
          create: {
            title: `NCBI Taxonomy: ${seed.scientificName}`,
            authors: "National Center for Biotechnology Information",
            journalOrPublisher: "NCBI",
            year: new Date().getFullYear(),
            doi: `ncbi-taxonomy-${seed.ncbiTaxonomyId}`,
            url: `https://www.ncbi.nlm.nih.gov/taxonomy/${seed.ncbiTaxonomyId}`,
            sourceType: "ncbi",
            topic: seed.kingdomLabel,
            accessedDate: new Date(),
            isVerified: true,
            addedByAdminId: admin.id,
          },
        });
        await prisma.microbeReference.createMany({
          data: [{ microbeId: microbe.id, referenceId: ncbiRef.id, contextNote: "Direct taxonomy link" }],
          skipDuplicates: true,
        });
      }

      console.log(`  ✓ ${seed.slug} (${seed.kingdomLabel})`);
      added++;
    } catch (err: unknown) {
      console.error(`  ✗ ${seed.slug}:`, (err as Error).message);
    }
  }

  console.log(`\n=== Done. Added ${added}/${toAdd.length} microbes. ===`);
  const total = await prisma.microbe.count();
  console.log(`Total microbes in DB: ${total}`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
