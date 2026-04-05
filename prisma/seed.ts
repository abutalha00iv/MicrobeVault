import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  ADDITIONAL_MICROBE_SEEDS,
  DISEASE_SEEDS,
  FLOWCHART_SEEDS,
  MICROBE_SEEDS,
  REFERENCE_SEEDS,
  TIMELINE_SEEDS,
  type CompactMicrobeSeed,
  type DiseaseSeed,
  type MicrobeSeed
} from "./seed-data";
import { refreshSearchIndex } from "../lib/search";

const prisma = new PrismaClient();

const wikimedia = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferDiseaseTemplate(slug: string): DiseaseSeed {
  const title = titleFromSlug(slug);
  const bodySystem =
    slug.includes("pneumonia") || slug.includes("influenza") || slug.includes("covid") || slug.includes("tuberculosis")
      ? "respiratory"
      : slug.includes("ulcer") || slug.includes("cholera") || slug.includes("typhoid") || slug.includes("amoebiasis") || slug.includes("giardiasis")
        ? "gastrointestinal"
        : slug.includes("rabies") || slug.includes("botulism") || slug.includes("cjd") || slug.includes("scrapie")
          ? "neurological"
          : slug.includes("gonorrhea") || slug.includes("syphilis")
            ? "reproductive"
            : slug.includes("candidiasis") || slug.includes("dermatophytosis")
              ? "skin"
              : "systemic";

  const severity =
    slug.includes("ebola") || slug.includes("smallpox") || slug.includes("rabies") || slug.includes("anthrax")
      ? "critical"
      : slug.includes("tuberculosis") || slug.includes("malaria") || slug.includes("visceral") || slug.includes("hiv")
        ? "severe"
        : "moderate";

  return {
    slug,
    name: title,
    description: `${title} is a clinically relevant infectious syndrome represented in the seeded MicrobeVault disease library.`,
    bodySystem,
    severity,
    transmissionRoute: "Depends on organism and exposure setting",
    incubationPeriod: "Variable",
    symptoms: ["fever", "site-specific inflammation", "malaise"],
    treatment: "Treatment depends on organism identity, resistance profile, disease severity, and host status.",
    mortalityRate: severity === "critical" ? 20 : severity === "severe" ? 8 : 2,
    pathogenesis: `The syndrome ${title.toLowerCase()} reflects pathogen replication, host immune response, and organ-specific injury.`,
    diagnosisMethods: "Clinical assessment combined with microbiology, molecular testing, and targeted imaging when indicated.",
    management: "Supportive care plus organism-directed therapy and public health precautions as required.",
    prevention: "Source control, vaccination where available, exposure reduction, and infection-prevention practices.",
    vaccines: "Vaccine availability depends on the causative organism.",
    distributionRegions: ["north-america", "south-america", "europe", "africa", "asia"],
    outbreakTimeline: [{ year: 2000, description: `Modern surveillance improved tracking of ${title.toLowerCase()}.` }]
  };
}

function expandCompact(seed: CompactMicrobeSeed): MicrobeSeed {
  const harmful = seed.isDangerous
    ? `${seed.scientificName} is associated with clinically important disease and requires careful interpretation in human or animal specimens.`
    : "";
  const beneficial = seed.isBeneficial
    ? `${seed.scientificName} is valued for its ecological or biotechnological contribution and is not primarily known as a pathogen.`
    : "";

  return {
    ...seed,
    sizeUm:
      seed.kingdomLabel === "Viruses"
        ? "0.02-0.3"
        : seed.kingdomLabel === "Prions"
          ? "Submicroscopic"
          : seed.kingdomLabel === "Protozoa"
            ? "5-50"
            : seed.kingdomLabel === "Algae"
              ? "2-20"
              : "0.5-5",
    motility: ["spirochete", "helical", "pleomorphic"].includes(seed.morphology) || seed.scientificName.includes("Giardia"),
    sporeForming: seed.scientificName.includes("Bacillus") || seed.scientificName.includes("Clostridium"),
    temperatureRange:
      seed.kingdomLabel === "Archaea" && seed.scientificName.includes("Thermo")
        ? "70-95 C"
        : seed.kingdomLabel === "Algae"
          ? "15-30 C"
          : "20-37 C",
    phRange:
      seed.scientificName.includes("Sulfolobus")
        ? "2.0-4.0"
        : seed.kingdomLabel === "Algae"
          ? "6.0-8.0"
          : "6.0-7.5",
    benefitDescription: beneficial || "",
    harmDescription: harmful || "",
    pathogenesisMechanism:
      seed.isDangerous
        ? `${seed.scientificName} causes harm through host colonization, tissue tropism, and virulence determinants characteristic of ${seed.taxonomy.commonClassification.toLowerCase()}.`
        : `${seed.scientificName} is not primarily a pathogen and is better known for its ecological or laboratory significance.`,
    antibioticProfile:
      seed.kingdomLabel === "Bacteria"
        ? "Antimicrobial susceptibility varies by lineage; stewardship and laboratory testing remain essential."
        : seed.kingdomLabel === "Fungi"
          ? "Antifungal susceptibility depends on species identity and host context."
          : seed.kingdomLabel === "Viruses"
            ? "Antiviral options are virus-specific and often limited."
            : "Classical antibiotic susceptibility is not a defining feature for this organism.",
    treatmentOptions:
      seed.isDangerous
        ? `Therapy depends on the syndrome linked to ${seed.scientificName}, host factors, and local resistance or susceptibility data.`
        : `No routine treatment is generally required because ${seed.scientificName} is not primarily pathogenic.`,
    preventionMethods:
      seed.isDangerous
        ? "Prevention centers on exposure control, hygiene, vector or reservoir management, and vaccination when available."
        : "Stewardship involves preserving the relevant habitat or culture conditions and avoiding contamination.",
    biotechApplications:
      seed.isBeneficial
        ? `${seed.scientificName} is useful in teaching, biotechnology, or systems biology because of its well-characterized physiology.`
        : `Research on ${seed.scientificName} informs pathogenesis, diagnostics, or public health preparedness.`,
    foodIndustryUses:
      seed.scientificName.includes("Saccharomyces")
        ? "Central yeast in baking, brewing, and fermentation."
        : seed.scientificName.includes("Lactobacillus")
          ? "Common probiotic and fermentation-associated bacterium."
          : "",
    environmentalUses:
      seed.scientificName.includes("Rhizobium") || seed.scientificName.includes("Nitrosomonas") || seed.scientificName.includes("Chlorella")
        ? `Supports environmental cycling or remediation through ${seed.ecologicalRole.toLowerCase()}.`
        : "",
    pharmaceuticalUses:
      seed.scientificName.includes("Penicillium")
        ? "Historically linked to penicillin discovery and antibiotic development."
        : seed.scientificName.includes("Thermus")
          ? "Taq polymerase transformed diagnostics and molecular biology."
          : "",
    hostOrganisms:
      seed.relationshipType === "mutualistic"
        ? ["Humans", "Plants"]
        : seed.relationshipType === "parasitic"
          ? ["Humans", "Animals"]
          : ["Environment"],
    interactions: [`Interacts with surrounding microbiota or host tissues according to its ${seed.relationshipType} lifestyle.`],
    specialStructures:
      seed.kingdomLabel === "Viruses"
        ? ["Capsid", "Envelope when applicable"]
        : seed.kingdomLabel === "Prions"
          ? ["Misfolded PrP conformer"]
          : seed.kingdomLabel === "Fungi"
            ? ["Cell wall", "Spore or budding structures"]
            : ["Surface proteins"],
    virulenceFactors:
      seed.isDangerous
        ? [`Disease linked to ${seed.scientificName} depends on adhesion, replication, immune evasion, or toxin-like mechanisms.`]
        : [],
    notableRelatives: [`Related members of ${seed.taxonomy.genus}`],
    researchMilestones: [`${seed.discoveryYear}: ${seed.discoveryContext}`],
    randomFacts: [
      `${seed.scientificName} belongs to ${seed.taxonomy.commonClassification.toLowerCase()}.`,
      `${seed.scientificName} is catalogued in the ${seed.kingdomLabel.toLowerCase()} section of MicrobeVault.`
    ]
  };
}

function buildDescriptions(seed: MicrobeSeed) {
  const descriptionShort = `${seed.commonName} is a ${seed.taxonomy.commonClassification.toLowerCase()} catalogued in MicrobeVault for taxonomy, ecology, and clinical significance.`;
  const paragraph1 = `${seed.scientificName} was described by ${seed.discoveredBy} in ${seed.discoveryYear}. ${seed.discoveryContext}`;
  const paragraph2 = `The organism is typically encountered in ${seed.habitat.toLowerCase()} and plays the following ecological role: ${seed.ecologicalRole.toLowerCase()}.`;
  const paragraph3 = seed.isDangerous
    ? `${seed.harmDescription} Clinical interpretation should consider ${seed.pathogenesisMechanism.toLowerCase()}`
    : `${seed.benefitDescription || `${seed.scientificName} is notable for its usefulness in research and ecosystem function.`} ${seed.biotechApplications}`;

  return {
    descriptionShort,
    descriptionLong: `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}`,
    overviewHtml: `<p>${paragraph1}<sup><a href="#reference-1">[1]</a></sup></p><p>${paragraph2}<sup><a href="#reference-2">[2]</a></sup></p><p>${paragraph3}<sup><a href="#reference-3">[3]</a></sup></p>`
  };
}

function referenceKeysForKingdom(kingdom: string) {
  switch (kingdom) {
    case "Bacteria":
      return ["bergey", "manual-clinical-microbiology", "ncbi-taxonomy"];
    case "Fungi":
      return ["mycobank", "manual-clinical-microbiology", "ncbi-taxonomy"];
    case "Viruses":
      return ["ictv", "viralzone", "ncbi-taxonomy"];
    case "Archaea":
      return ["bergey", "ncbi-taxonomy", "microbiology-introduction"];
    case "Protozoa":
      return ["harrisons", "who-fact-sheets", "ncbi-taxonomy"];
    case "Algae":
      return ["microbiology-introduction", "ncbi-taxonomy", "lehninger"];
    default:
      return ["harrisons", "who-fact-sheets", "ncbi-taxonomy"];
  }
}

async function main() {
  await prisma.flowchartReference.deleteMany();
  await prisma.diseaseReference.deleteMany();
  await prisma.microbeReference.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.ncbiData.deleteMany();
  await prisma.microbeVideo.deleteMany();
  await prisma.microbeImage.deleteMany();
  await prisma.microbeDisease.deleteMany();
  await prisma.taxonomy.deleteMany();
  await prisma.disease.deleteMany();
  await prisma.flowchart.deleteMany();
  await prisma.microbe.deleteMany();
  await prisma.admin.deleteMany();

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!", 12);
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      hashedPassword,
      role: "SUPER_ADMIN"
    }
  });

  const referenceMap = new Map<string, string>();
  for (const seed of REFERENCE_SEEDS) {
    const reference = await prisma.reference.create({
      data: {
        title: seed.title,
        authors: seed.authors,
        journalOrPublisher: seed.journalOrPublisher,
        year: seed.year,
        doi: seed.doi,
        url: seed.url,
        sourceType: seed.sourceType,
        topic: seed.topic,
        accessedDate: new Date(),
        isVerified: true,
        addedByAdminId: admin.id
      }
    });
    referenceMap.set(seed.key, reference.id);
  }

  const diseaseSeeds = new Map<string, DiseaseSeed>();
  DISEASE_SEEDS.forEach((seed) => diseaseSeeds.set(seed.slug, seed));
  [...MICROBE_SEEDS, ...ADDITIONAL_MICROBE_SEEDS.map(expandCompact)].forEach((microbe) => {
    microbe.diseaseSlugs.forEach((slug) => {
      if (!diseaseSeeds.has(slug)) {
        diseaseSeeds.set(slug, inferDiseaseTemplate(slug));
      }
    });
  });

  const diseaseMap = new Map<string, string>();
  for (const seed of diseaseSeeds.values()) {
    const disease = await prisma.disease.create({
      data: {
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        icd10Code: seed.icd10Code,
        bodySystem: seed.bodySystem,
        severity: seed.severity,
        transmissionRoute: seed.transmissionRoute,
        incubationPeriod: seed.incubationPeriod,
        symptoms: seed.symptoms,
        treatment: seed.treatment,
        mortalityRate: seed.mortalityRate,
        isEndemic: seed.isEndemic || false,
        isEpidemic: seed.isEpidemic || false,
        pathogenesis: seed.pathogenesis,
        diagnosisMethods: seed.diagnosisMethods,
        management: seed.management,
        prevention: seed.prevention,
        vaccines: seed.vaccines,
        distributionRegions: seed.distributionRegions,
        outbreakTimeline: seed.outbreakTimeline,
        overviewHtml: `<p>${seed.description}<sup><a href="#reference-1">[1]</a></sup></p><p>${seed.pathogenesis}<sup><a href="#reference-2">[2]</a></sup></p>`
      }
    });

    diseaseMap.set(seed.slug, disease.id);
    for (const key of ["who-fact-sheets", "cdc", "harrisons"]) {
      const referenceId = referenceMap.get(key);
      if (referenceId) {
        await prisma.diseaseReference.create({
          data: {
            diseaseId: disease.id,
            referenceId,
            contextNote: "Seeded authoritative disease reference"
          }
        });
      }
    }
  }

  const fullMicrobeSeeds = [...MICROBE_SEEDS, ...ADDITIONAL_MICROBE_SEEDS.map(expandCompact)];
  const microbeIdMap = new Map<string, string>();

  for (const seed of fullMicrobeSeeds) {
    const copy = { ...seed, ...buildDescriptions(seed) };
    const microbe = await prisma.microbe.create({
      data: {
        slug: copy.slug,
        commonName: copy.commonName,
        scientificName: copy.scientificName,
        descriptionShort: copy.descriptionShort,
        descriptionLong: copy.descriptionLong,
        overviewHtml: copy.overviewHtml,
        discoveryYear: copy.discoveryYear,
        discoveredBy: copy.discoveredBy,
        discoveryContext: copy.discoveryContext,
        gramStain: copy.gramStain,
        morphology: copy.morphology,
        sizeUm: copy.sizeUm,
        motility: copy.motility,
        sporeForming: copy.sporeForming,
        oxygenRequirement: copy.oxygenRequirement,
        temperatureRange: copy.temperatureRange,
        phRange: copy.phRange,
        habitat: copy.habitat,
        isInfectious: copy.isInfectious,
        isDangerous: copy.isDangerous,
        bslLevel: copy.bslLevel,
        isBeneficial: copy.isBeneficial,
        benefitDescription: copy.benefitDescription,
        harmDescription: copy.harmDescription,
        ecologicalRole: copy.ecologicalRole,
        relationshipType: copy.relationshipType,
        ncbiTaxonomyId: copy.ncbiTaxonomyId,
        imageUrl: wikimedia(copy.imageFile),
        kingdomLabel: copy.kingdomLabel,
        cellWall:
          copy.kingdomLabel === "Bacteria"
            ? `${copy.taxonomy.commonClassification} envelope adapted to its lineage.`
            : copy.kingdomLabel === "Fungi"
              ? "Chitin- and glucan-containing fungal wall."
              : copy.kingdomLabel === "Viruses"
                ? "No cell wall; genome packaged in capsid and sometimes envelope."
                : "Cell covering varies with the organism.",
        reproductionMethod:
          copy.kingdomLabel === "Viruses"
            ? "Replication inside host cells."
            : copy.kingdomLabel === "Fungi"
              ? "Budding or sporulation depending on form."
              : copy.kingdomLabel === "Protozoa"
                ? "Asexual replication with stage-specific transitions."
                : "Binary fission or lineage-specific cell division.",
        metabolicType: `${copy.oxygenRequirement} metabolism consistent with ${copy.taxonomy.commonClassification.toLowerCase()}.`,
        growthConditions: `Typical growth range: ${copy.temperatureRange}, pH ${copy.phRange}.`,
        colonialMorphology: `${copy.scientificName} produces lineage-appropriate morphology in culture or microscopy.`,
        specialStructures: copy.specialStructures,
        phylogeneticPosition: `${copy.scientificName} belongs to ${copy.taxonomy.family} within ${copy.taxonomy.order}.`,
        notableRelatives: copy.notableRelatives,
        researchMilestones: copy.researchMilestones,
        historicalSignificance: `${copy.scientificName} remains significant in microbiology because ${copy.discoveryContext.toLowerCase()}`,
        namedAfter: `The naming of ${copy.scientificName} follows historical taxonomic conventions for its lineage.`,
        hostOrganisms: copy.hostOrganisms,
        roleInMicrobiome: copy.relationshipType === "commensal" || copy.relationshipType === "mutualistic" ? `${copy.scientificName} can participate in stable host-associated communities.` : null,
        interactions: copy.interactions,
        pathogenesisMechanism: copy.pathogenesisMechanism,
        virulenceFactors: copy.virulenceFactors,
        antibioticProfile: copy.antibioticProfile,
        treatmentOptions: copy.treatmentOptions,
        preventionMethods: copy.preventionMethods,
        biosafetyExplanation: `BSL-${copy.bslLevel} reflects the containment expectations associated with ${copy.scientificName}.`,
        biotechApplications: copy.biotechApplications,
        foodIndustryUses: copy.foodIndustryUses,
        environmentalUses: copy.environmentalUses,
        pharmaceuticalUses: copy.pharmaceuticalUses,
        randomFacts: copy.randomFacts,
        taxonomy: {
          create: {
            ...copy.taxonomy
          }
        }
      }
    });

    microbeIdMap.set(copy.slug, microbe.id);

    for (const diseaseSlug of copy.diseaseSlugs) {
      const diseaseId = diseaseMap.get(diseaseSlug);
      if (diseaseId) {
        await prisma.microbeDisease.create({
          data: {
            microbeId: microbe.id,
            diseaseId,
            role: "primary_cause"
          }
        });
      }
    }

    await prisma.microbeImage.createMany({
      data: [
        {
          microbeId: microbe.id,
          imageUrl: wikimedia(copy.imageFile),
          imageType: copy.kingdomLabel === "Viruses" ? "SEM" : "light",
          caption: `${copy.scientificName} microscopy image`,
          sourceCredit: "Wikimedia Commons",
          altText: `${copy.scientificName} microscopy image`,
          isPrimary: true
        },
        {
          microbeId: microbe.id,
          imageUrl: wikimedia(copy.imageFile),
          imageType: "illustration",
          caption: `${copy.scientificName} reference illustration`,
          sourceCredit: "Wikimedia Commons",
          altText: `${copy.scientificName} illustration`,
          isPrimary: false
        }
      ]
    });

    for (const key of referenceKeysForKingdom(copy.kingdomLabel)) {
      const referenceId = referenceMap.get(key);
      if (referenceId) {
        await prisma.microbeReference.create({
          data: {
            microbeId: microbe.id,
            referenceId,
            contextNote: "Seeded core profile reference"
          }
        });
      }
    }

    if (copy.ncbiTaxonomyId) {
      const reference = await prisma.reference.upsert({
        where: {
          doi: `ncbi-taxonomy-${copy.ncbiTaxonomyId}`
        },
        update: {
          title: `NCBI Taxonomy: ${copy.scientificName}`,
          authors: "National Center for Biotechnology Information",
          journalOrPublisher: "NCBI",
          year: new Date().getFullYear(),
          url: `https://www.ncbi.nlm.nih.gov/taxonomy/${copy.ncbiTaxonomyId}`,
          sourceType: "ncbi",
          topic: copy.kingdomLabel,
          accessedDate: new Date(),
          isVerified: true,
          addedByAdminId: admin.id
        },
        create: {
          title: `NCBI Taxonomy: ${copy.scientificName}`,
          authors: "National Center for Biotechnology Information",
          journalOrPublisher: "NCBI",
          year: new Date().getFullYear(),
          doi: `ncbi-taxonomy-${copy.ncbiTaxonomyId}`,
          url: `https://www.ncbi.nlm.nih.gov/taxonomy/${copy.ncbiTaxonomyId}`,
          sourceType: "ncbi",
          topic: copy.kingdomLabel,
          accessedDate: new Date(),
          isVerified: true,
          addedByAdminId: admin.id
        }
      });
      await prisma.microbeReference.upsert({
        where: {
          microbeId_referenceId: {
            microbeId: microbe.id,
            referenceId: reference.id
          }
        },
        update: {
          contextNote: "Direct taxonomy link"
        },
        create: {
          microbeId: microbe.id,
          referenceId: reference.id,
          contextNote: "Direct taxonomy link"
        }
      });
    }
  }

  for (const seed of FLOWCHART_SEEDS) {
    const flowchart = await prisma.flowchart.create({
      data: {
        title: seed.title,
        slug: seed.slug,
        description: seed.description,
        category: seed.category,
        mermaidCode: seed.mermaidCode,
        svgContent: seed.svgContent,
        nodeDescriptions: seed.nodeDescriptions
      }
    });

    for (const referenceKey of seed.referenceKeys) {
      const referenceId = referenceMap.get(referenceKey);
      if (referenceId) {
        await prisma.flowchartReference.create({
          data: {
            flowchartId: flowchart.id,
            referenceId,
            contextNote: "Flowchart based on source"
          }
        });
      }
    }
  }

  for (const seed of TIMELINE_SEEDS) {
    await prisma.timelineEvent.create({
      data: {
        year: seed.year,
        title: seed.title,
        description: seed.description,
        eventType: seed.eventType,
        significance: seed.significance,
        discoverers: seed.discoverers,
        country: seed.country,
        microbeId: seed.microbeSlug ? microbeIdMap.get(seed.microbeSlug) : undefined,
        diseaseId: seed.diseaseSlug ? diseaseMap.get(seed.diseaseSlug) : undefined
      }
    });
  }

  try {
    await refreshSearchIndex();
  } catch {
    // Redis is optional during seeding.
  }

  console.log(`Seeded ${fullMicrobeSeeds.length} microbes, ${diseaseMap.size} diseases, ${FLOWCHART_SEEDS.length} flowcharts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
