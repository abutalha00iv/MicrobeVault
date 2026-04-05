export type ReferenceSeed = {
  key: string;
  title: string;
  authors: string;
  journalOrPublisher: string;
  year: number;
  doi?: string;
  url: string;
  sourceType: "journal_article" | "book" | "ncbi" | "who" | "cdc" | "textbook" | "wikipedia" | "news" | "other";
  topic: string;
};

export type DiseaseSeed = {
  slug: string;
  name: string;
  description: string;
  icd10Code?: string;
  bodySystem: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  transmissionRoute: string;
  incubationPeriod: string;
  symptoms: string[];
  treatment: string;
  mortalityRate?: number;
  isEndemic?: boolean;
  isEpidemic?: boolean;
  pathogenesis: string;
  diagnosisMethods: string;
  management: string;
  prevention: string;
  vaccines?: string;
  distributionRegions: string[];
  outbreakTimeline: Array<{ year: number; description: string }>;
};

export type MicrobeSeed = {
  slug: string;
  commonName: string;
  scientificName: string;
  kingdomLabel: "Bacteria" | "Fungi" | "Viruses" | "Archaea" | "Protozoa" | "Algae" | "Prions";
  taxonomy: {
    domain: string;
    kingdom: string;
    phylum: string;
    taxClass: string;
    order: string;
    family: string;
    genus: string;
    species: string;
    strain?: string;
    commonClassification: string;
  };
  discoveryYear: number;
  discoveredBy: string;
  discoveryContext: string;
  gramStain: "positive" | "negative" | "variable" | "unknown";
  morphology: "cocci" | "bacilli" | "spirochete" | "coccobacilli" | "vibrio" | "filamentous" | "pleomorphic" | "helical" | "spherical" | "amoeboid" | "irregular" | "unknown";
  sizeUm: string;
  motility: boolean;
  sporeForming: boolean;
  oxygenRequirement: "aerobic" | "anaerobic" | "facultative" | "microaerophilic" | "aerotolerant" | "unknown";
  temperatureRange: string;
  phRange: string;
  habitat: string;
  isInfectious: boolean;
  isDangerous: boolean;
  bslLevel: number;
  isBeneficial: boolean;
  benefitDescription: string;
  harmDescription: string;
  ecologicalRole: string;
  relationshipType: "commensal" | "mutualistic" | "parasitic" | "saprophytic" | "predation";
  ncbiTaxonomyId?: number;
  imageFile: string;
  diseaseSlugs: string[];
  pathogenesisMechanism: string;
  antibioticProfile: string;
  treatmentOptions: string;
  preventionMethods: string;
  biotechApplications: string;
  foodIndustryUses: string;
  environmentalUses: string;
  pharmaceuticalUses: string;
  hostOrganisms: string[];
  interactions: string[];
  specialStructures: string[];
  virulenceFactors: string[];
  notableRelatives: string[];
  researchMilestones: string[];
  randomFacts: string[];
};

export type CompactMicrobeSeed = {
  slug: string;
  commonName: string;
  scientificName: string;
  kingdomLabel: "Bacteria" | "Fungi" | "Viruses" | "Archaea" | "Protozoa" | "Algae" | "Prions";
  taxonomy: {
    domain: string;
    kingdom: string;
    phylum: string;
    taxClass: string;
    order: string;
    family: string;
    genus: string;
    species: string;
    strain?: string;
    commonClassification: string;
  };
  discoveryYear: number;
  discoveredBy: string;
  discoveryContext: string;
  gramStain: "positive" | "negative" | "variable" | "unknown";
  morphology: "cocci" | "bacilli" | "spirochete" | "coccobacilli" | "vibrio" | "filamentous" | "pleomorphic" | "helical" | "spherical" | "amoeboid" | "irregular" | "unknown";
  oxygenRequirement: "aerobic" | "anaerobic" | "facultative" | "microaerophilic" | "aerotolerant" | "unknown";
  habitat: string;
  ecologicalRole: string;
  relationshipType: "commensal" | "mutualistic" | "parasitic" | "saprophytic" | "predation";
  isDangerous: boolean;
  isBeneficial: boolean;
  diseaseSlugs: string[];
  imageFile: string;
  ncbiTaxonomyId?: number;
};

export type FlowchartSeed = {
  title: string;
  slug: string;
  description: string;
  category: "gram_staining" | "metabolic" | "id_algorithm" | "infection_pathway" | "antibiotic_resistance" | "life_cycle" | "ecological";
  mermaidCode: string;
  svgContent: string;
  nodeDescriptions: Record<string, string>;
  referenceKeys: string[];
};

export type TimelineSeed = {
  year: number;
  title: string;
  description: string;
  eventType: "discovery" | "epidemic" | "treatment" | "research_milestone";
  significance: string;
  discoverers: string;
  country: string;
  microbeSlug?: string;
  diseaseSlug?: string;
};

export const REFERENCE_SEEDS: ReferenceSeed[] = [
  {
    key: "bergey",
    title: "Bergey's Manual of Systematic Bacteriology (2nd ed.)",
    authors: "Garrity, G.M.; Boone, D.R.; Castenholz, R.W.",
    journalOrPublisher: "Springer",
    year: 2001,
    url: "https://link.springer.com/referencework/10.1007/978-0-387-28021-4",
    sourceType: "textbook",
    topic: "Bacteria"
  },
  {
    key: "manual-clinical-microbiology",
    title: "Manual of Clinical Microbiology (12th ed.)",
    authors: "Murray, P.R.; Rosenthal, K.S.; Pfaller, M.A.",
    journalOrPublisher: "ASM Press",
    year: 2019,
    url: "https://asm.org/Books/Manual-of-Clinical-Microbiology",
    sourceType: "textbook",
    topic: "Diseases"
  },
  {
    key: "microbiology-introduction",
    title: "Microbiology: An Introduction (13th ed.)",
    authors: "Tortora, G.J.; Funke, B.R.; Case, C.L.",
    journalOrPublisher: "Pearson",
    year: 2018,
    url: "https://www.pearson.com",
    sourceType: "textbook",
    topic: "General Microbiology"
  },
  {
    key: "who-fact-sheets",
    title: "WHO Disease Fact Sheets",
    authors: "World Health Organization",
    journalOrPublisher: "WHO",
    year: 2025,
    url: "https://www.who.int/news-room/fact-sheets",
    sourceType: "who",
    topic: "Diseases"
  },
  {
    key: "cdc",
    title: "Centers for Disease Control and Prevention",
    authors: "Centers for Disease Control and Prevention",
    journalOrPublisher: "CDC",
    year: 2025,
    url: "https://www.cdc.gov/",
    sourceType: "cdc",
    topic: "Diseases"
  },
  {
    key: "ncbi-taxonomy",
    title: "NCBI Taxonomy Database",
    authors: "National Center for Biotechnology Information",
    journalOrPublisher: "NCBI",
    year: 2025,
    url: "https://www.ncbi.nlm.nih.gov/taxonomy",
    sourceType: "ncbi",
    topic: "General Microbiology"
  },
  {
    key: "pmc",
    title: "PubMed Central",
    authors: "National Center for Biotechnology Information",
    journalOrPublisher: "NCBI",
    year: 2025,
    url: "https://www.ncbi.nlm.nih.gov/pmc/",
    sourceType: "ncbi",
    topic: "Diseases"
  },
  {
    key: "microbewiki",
    title: "MicrobeWiki",
    authors: "Kenyon College",
    journalOrPublisher: "Kenyon College",
    year: 2025,
    url: "https://microbewiki.kenyon.edu",
    sourceType: "other",
    topic: "General Microbiology"
  },
  {
    key: "viralzone",
    title: "ViralZone",
    authors: "Swiss Institute of Bioinformatics",
    journalOrPublisher: "SIB",
    year: 2025,
    url: "https://viralzone.expasy.org",
    sourceType: "other",
    topic: "Viruses"
  },
  {
    key: "mycobank",
    title: "MycoBank",
    authors: "Westerdijk Fungal Biodiversity Institute",
    journalOrPublisher: "MycoBank",
    year: 2025,
    url: "https://www.mycobank.org",
    sourceType: "other",
    topic: "Fungi"
  },
  {
    key: "ictv",
    title: "International Committee on Taxonomy of Viruses",
    authors: "ICTV",
    journalOrPublisher: "ICTV",
    year: 2025,
    url: "https://ictv.global",
    sourceType: "other",
    topic: "Viruses"
  },
  {
    key: "lehninger",
    title: "Lehninger Principles of Biochemistry (8th ed.)",
    authors: "Nelson, D.L.; Cox, M.M.",
    journalOrPublisher: "Macmillan Learning",
    year: 2021,
    url: "https://www.macmillanlearning.com",
    sourceType: "textbook",
    topic: "General Microbiology"
  },
  {
    key: "harrisons",
    title: "Harrison's Principles of Internal Medicine (21st ed.)",
    authors: "Jameson, J.L.; Fauci, A.S.; Kasper, D.L.",
    journalOrPublisher: "McGraw Hill",
    year: 2022,
    url: "https://accessmedicine.mhmedical.com/book.aspx?bookID=3095",
    sourceType: "textbook",
    topic: "Diseases"
  }
];

export const DISEASE_SEEDS: DiseaseSeed[] = [
  {
    slug: "staphylococcal-skin-infection",
    name: "Staphylococcal Skin Infection",
    description: "A pyogenic skin and soft tissue infection commonly caused by Staphylococcus aureus, ranging from folliculitis to cellulitis and abscess formation.",
    icd10Code: "L08.9",
    bodySystem: "skin",
    severity: "moderate",
    transmissionRoute: "direct contact",
    incubationPeriod: "Variable; often days",
    symptoms: ["pain", "erythema", "pus formation", "fever"],
    treatment: "Incision and drainage when appropriate plus targeted anti-staphylococcal therapy guided by local resistance patterns.",
    mortalityRate: 1,
    pathogenesis: "S. aureus colonizes damaged skin, deploys adhesins and toxins, and provokes a neutrophilic inflammatory response with abscess formation.",
    diagnosisMethods: "Clinical examination, Gram stain, culture, susceptibility testing.",
    management: "Drainage, wound care, hygiene counseling, and antimicrobial therapy when indicated.",
    prevention: "Hand hygiene, wound coverage, decolonization in recurrent cases.",
    vaccines: "No routine vaccine available.",
    distributionRegions: ["north-america", "south-america", "europe", "africa", "asia", "oceania"],
    outbreakTimeline: [{ year: 1961, description: "MRSA emerged as a major healthcare-associated lineage." }]
  },
  {
    slug: "tuberculosis",
    name: "Tuberculosis",
    description: "A chronic granulomatous infection caused by Mycobacterium tuberculosis, most often affecting the lungs but capable of disseminated disease.",
    icd10Code: "A15.0",
    bodySystem: "respiratory",
    severity: "severe",
    transmissionRoute: "airborne droplets",
    incubationPeriod: "Weeks to years",
    symptoms: ["chronic cough", "night sweats", "weight loss", "fever"],
    treatment: "Combination multidrug therapy with rifampicin, isoniazid, pyrazinamide, and ethambutol followed by continuation therapy.",
    mortalityRate: 15,
    isEndemic: true,
    isEpidemic: false,
    pathogenesis: "Inhaled bacilli survive inside macrophages, trigger granuloma formation, and may reactivate when immune control wanes.",
    diagnosisMethods: "NAAT, sputum smear, culture, chest imaging, interferon-gamma release assays.",
    management: "Directly observed therapy, drug-resistance testing, public health tracing.",
    prevention: "Ventilation, mask use, preventive therapy, BCG in selected settings.",
    vaccines: "BCG offers partial protection against severe childhood disease.",
    distributionRegions: ["africa", "asia", "europe", "south-america"],
    outbreakTimeline: [{ year: 1882, description: "Robert Koch announced the tubercle bacillus." }]
  },
  {
    slug: "anthrax",
    name: "Anthrax",
    description: "An acute zoonotic infection caused by Bacillus anthracis with cutaneous, inhalational, gastrointestinal, and injection-associated forms.",
    icd10Code: "A22.9",
    bodySystem: "systemic",
    severity: "critical",
    transmissionRoute: "animal products and spores",
    incubationPeriod: "1-7 days",
    symptoms: ["black eschar", "fever", "dyspnea", "mediastinal widening"],
    treatment: "Prompt ciprofloxacin- or doxycycline-based combination therapy with antitoxin support in systemic disease.",
    mortalityRate: 45,
    pathogenesis: "Spores germinate in tissues and release edema toxin and lethal toxin that disrupt innate immunity and endothelial integrity.",
    diagnosisMethods: "PCR, culture, immunohistochemistry, exposure history.",
    management: "Urgent antimicrobials, antitoxin, public health notification.",
    prevention: "Occupational PPE, livestock vaccination, exposure prophylaxis.",
    vaccines: "Anthrax vaccine adsorbed for high-risk groups.",
    distributionRegions: ["north-america", "africa", "asia"],
    outbreakTimeline: [{ year: 2001, description: "Anthrax bioterrorism letters in the United States heightened surveillance." }]
  },
  {
    slug: "botulism",
    name: "Botulism",
    description: "A neuroparalytic illness caused by botulinum neurotoxin, usually from Clostridium botulinum contamination or colonization.",
    icd10Code: "A05.1",
    bodySystem: "neurological",
    severity: "critical",
    transmissionRoute: "foodborne toxin or wound contamination",
    incubationPeriod: "12-36 hours",
    symptoms: ["blurred vision", "descending paralysis", "dysphagia", "respiratory failure"],
    treatment: "Equine or human botulinum antitoxin with intensive respiratory support.",
    mortalityRate: 8,
    pathogenesis: "Neurotoxin irreversibly blocks acetylcholine release at the neuromuscular junction.",
    diagnosisMethods: "Clinical pattern, toxin assay, culture from food or stool.",
    management: "Airway support, antitoxin, wound debridement when applicable.",
    prevention: "Proper canning, refrigeration, infant honey avoidance.",
    vaccines: "No routine vaccine for the public.",
    distributionRegions: ["north-america", "europe", "asia"],
    outbreakTimeline: [{ year: 1895, description: "Emile van Ermengem isolated the botulism bacillus after a foodborne outbreak." }]
  },
  {
    slug: "streptococcal-pharyngitis",
    name: "Streptococcal Pharyngitis",
    description: "Acute pharyngitis due to Streptococcus pyogenes, particularly in school-age children.",
    icd10Code: "J02.0",
    bodySystem: "respiratory",
    severity: "mild",
    transmissionRoute: "respiratory droplets",
    incubationPeriod: "2-5 days",
    symptoms: ["sore throat", "fever", "tonsillar exudates", "tender cervical nodes"],
    treatment: "Penicillin or amoxicillin remains first-line therapy in susceptible infections.",
    mortalityRate: 0.1,
    pathogenesis: "Adhesins and streptococcal pyrogenic exotoxins promote mucosal infection and inflammation.",
    diagnosisMethods: "Rapid antigen detection, throat culture, NAAT.",
    management: "Antibiotic therapy, hydration, analgesia.",
    prevention: "Respiratory etiquette and early treatment to prevent transmission.",
    vaccines: "No licensed vaccine.",
    distributionRegions: ["north-america", "south-america", "europe", "asia", "oceania"],
    outbreakTimeline: [{ year: 1940, description: "Penicillin transformed treatment of streptococcal infections." }]
  }
];

export const MICROBE_SEEDS: MicrobeSeed[] = [
  {
    slug: "staphylococcus-aureus",
    commonName: "Golden staph",
    scientificName: "Staphylococcus aureus",
    kingdomLabel: "Bacteria",
    taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Bacillota", taxClass: "Bacilli", order: "Bacillales", family: "Staphylococcaceae", genus: "Staphylococcus", species: "aureus", commonClassification: "Gram-positive coccus" },
    discoveryYear: 1880,
    discoveredBy: "Alexander Ogston",
    discoveryContext: "Ogston described clustered cocci in surgical abscesses, connecting the organism to suppurative disease.",
    gramStain: "positive",
    morphology: "cocci",
    sizeUm: "0.5-1.0",
    motility: false,
    sporeForming: false,
    oxygenRequirement: "facultative",
    temperatureRange: "30-37 C",
    phRange: "6.5-7.5",
    habitat: "Skin, nares, fomites, healthcare environments.",
    isInfectious: true,
    isDangerous: true,
    bslLevel: 2,
    isBeneficial: false,
    benefitDescription: "",
    harmDescription: "Causes skin infections, bacteremia, pneumonia, endocarditis, and toxin-mediated syndromes.",
    ecologicalRole: "Common human commensal with opportunistic pathogenic potential.",
    relationshipType: "commensal",
    ncbiTaxonomyId: 1280,
    imageFile: "Staphylococcus aureus 01.jpg",
    diseaseSlugs: ["staphylococcal-skin-infection"],
    pathogenesisMechanism: "Adhesins, protein A, coagulase, and toxins promote colonization, immune evasion, and tissue destruction.",
    antibioticProfile: "Methicillin-sensitive strains remain beta-lactam treatable; resistant lineages require alternate therapy.",
    treatmentOptions: "Source control plus beta-lactams or anti-MRSA agents guided by susceptibility testing.",
    preventionMethods: "Hand hygiene, contact precautions, decolonization in selected high-risk settings.",
    biotechApplications: "Used in immunology and pathogenesis research as a model Gram-positive pathogen.",
    foodIndustryUses: "",
    environmentalUses: "",
    pharmaceuticalUses: "Virulence factors and resistance mechanisms inform antimicrobial development.",
    hostOrganisms: ["Humans"],
    interactions: ["Competes with nasal microbiota", "Forms biofilms on devices"],
    specialStructures: ["Capsule", "Surface adhesins"],
    virulenceFactors: ["Protein A", "alpha-toxin", "Panton-Valentine leukocidin"],
    notableRelatives: ["Staphylococcus epidermidis", "Staphylococcus saprophyticus"],
    researchMilestones: ["1880: linked to abscess formation", "1961: methicillin-resistant lineages recognized"],
    randomFacts: ["Often grows in grape-like clusters on microscopy.", "Salt tolerance helps it persist on skin and surfaces."]
  },
  {
    slug: "escherichia-coli",
    commonName: "E. coli",
    scientificName: "Escherichia coli",
    kingdomLabel: "Bacteria",
    taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Pseudomonadota", taxClass: "Gammaproteobacteria", order: "Enterobacterales", family: "Enterobacteriaceae", genus: "Escherichia", species: "coli", commonClassification: "Gram-negative rod" },
    discoveryYear: 1885,
    discoveredBy: "Theodor Escherich",
    discoveryContext: "Escherich isolated the organism from infant stool while studying the intestinal microbiota.",
    gramStain: "negative",
    morphology: "bacilli",
    sizeUm: "1-3 x 0.4-0.7",
    motility: true,
    sporeForming: false,
    oxygenRequirement: "facultative",
    temperatureRange: "20-44 C",
    phRange: "6.0-7.5",
    habitat: "Lower gastrointestinal tract of humans and warm-blooded animals; water and food when contaminated.",
    isInfectious: true,
    isDangerous: true,
    bslLevel: 2,
    isBeneficial: true,
    benefitDescription: "Most strains contribute to vitamin production, colonization resistance, and gut ecology.",
    harmDescription: "Pathotypes can cause diarrheal disease, urinary tract infection, neonatal meningitis, and sepsis.",
    ecologicalRole: "Dominant facultative anaerobe in the intestinal microbiome and a sentinel indicator of fecal contamination.",
    relationshipType: "commensal",
    ncbiTaxonomyId: 562,
    imageFile: "EscherichiaColi NIAID.jpg",
    diseaseSlugs: ["bacterial-pneumonia"],
    pathogenesisMechanism: "Virulence depends on pathotype-specific adhesins, toxins, secretion systems, and invasive potential.",
    antibioticProfile: "Resistance patterns vary widely, with ESBL and carbapenem-resistant strains now clinically significant.",
    treatmentOptions: "Supportive care for enteric disease and targeted antimicrobials for extraintestinal infection.",
    preventionMethods: "Food safety, water sanitation, catheter stewardship, and infection control.",
    biotechApplications: "Flagship host for cloning, recombinant protein production, and synthetic biology.",
    foodIndustryUses: "Nonpathogenic strains serve as quality-control indicators rather than production organisms.",
    environmentalUses: "Indicator organism for sanitation and water-quality testing.",
    pharmaceuticalUses: "Widely used for plasmid amplification and biologic production.",
    hostOrganisms: ["Humans", "Mammals"],
    interactions: ["Competes with gut anaerobes", "Can exchange resistance plasmids"],
    specialStructures: ["Fimbriae", "Flagella", "Outer membrane"],
    virulenceFactors: ["LPS", "fimbrial adhesins", "Shiga toxin in specific pathotypes"],
    notableRelatives: ["Escherichia albertii", "Shigella spp."],
    researchMilestones: ["1970s: cloning work made E. coli central to biotechnology", "Modern genomics defined diverse pathotypes"],
    randomFacts: ["K-12 derivatives are staple lab strains worldwide.", "Most E. coli are harmless gut residents."]
  },
  {
    slug: "mycobacterium-tuberculosis",
    commonName: "Tubercle bacillus",
    scientificName: "Mycobacterium tuberculosis",
    kingdomLabel: "Bacteria",
    taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Actinomycetota", taxClass: "Actinomycetes", order: "Mycobacteriales", family: "Mycobacteriaceae", genus: "Mycobacterium", species: "tuberculosis", commonClassification: "Acid-fast bacillus" },
    discoveryYear: 1882,
    discoveredBy: "Robert Koch",
    discoveryContext: "Koch identified the tubercle bacillus using staining and culture methods, establishing a microbial cause of tuberculosis.",
    gramStain: "variable",
    morphology: "bacilli",
    sizeUm: "2-4 x 0.2-0.5",
    motility: false,
    sporeForming: false,
    oxygenRequirement: "aerobic",
    temperatureRange: "35-37 C",
    phRange: "6.4-7.0",
    habitat: "Human hosts, especially within macrophages and lung lesions.",
    isInfectious: true,
    isDangerous: true,
    bslLevel: 3,
    isBeneficial: false,
    benefitDescription: "",
    harmDescription: "Causes pulmonary and extrapulmonary tuberculosis with major global morbidity and mortality.",
    ecologicalRole: "Obligate human pathogen adapted to latent and active infection cycles.",
    relationshipType: "parasitic",
    ncbiTaxonomyId: 1773,
    imageFile: "Mycobacterium tuberculosis Ziehl-Neelsen stain.jpg",
    diseaseSlugs: ["tuberculosis"],
    pathogenesisMechanism: "Survives inside macrophages, inhibits phagolysosome maturation, and drives granulomatous inflammation.",
    antibioticProfile: "Requires multidrug therapy; multidrug-resistant and extensively drug-resistant forms complicate treatment.",
    treatmentOptions: "Combination therapy with first-line agents followed by continuation treatment guided by susceptibility.",
    preventionMethods: "Airborne isolation, ventilation, contact tracing, preventive therapy, and vaccination where indicated.",
    biotechApplications: "Drives research into host-pathogen interactions, latency, and vaccine design.",
    foodIndustryUses: "",
    environmentalUses: "",
    pharmaceuticalUses: "Major target for antimicrobial discovery and immune-focused therapeutics.",
    hostOrganisms: ["Humans"],
    interactions: ["Lives within macrophages", "Persists in granulomas with host immune pressure"],
    specialStructures: ["Mycolic acid-rich envelope", "Cord factor"],
    virulenceFactors: ["ESX-1 secretion system", "lipoarabinomannan"],
    notableRelatives: ["Mycobacterium bovis", "Mycobacterium africanum"],
    researchMilestones: ["1882: causative organism announced", "1940s: anti-tubercular therapy began to transform outcomes"],
    randomFacts: ["Its waxy envelope makes acid-fast staining essential.", "Latency is a defining feature of infection biology."]
  },
  {
    slug: "bacillus-anthracis",
    commonName: "Anthrax bacillus",
    scientificName: "Bacillus anthracis",
    kingdomLabel: "Bacteria",
    taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Bacillota", taxClass: "Bacilli", order: "Bacillales", family: "Bacillaceae", genus: "Bacillus", species: "anthracis", commonClassification: "Spore-forming Gram-positive rod" },
    discoveryYear: 1876,
    discoveredBy: "Robert Koch",
    discoveryContext: "Koch used anthrax to help establish the causal framework later formalized as Koch's postulates.",
    gramStain: "positive",
    morphology: "bacilli",
    sizeUm: "3-5 x 1-1.2",
    motility: false,
    sporeForming: true,
    oxygenRequirement: "aerobic",
    temperatureRange: "12-45 C",
    phRange: "6.0-8.0",
    habitat: "Soil and animal products, especially where resilient spores accumulate.",
    isInfectious: true,
    isDangerous: true,
    bslLevel: 3,
    isBeneficial: false,
    benefitDescription: "",
    harmDescription: "Produces anthrax with cutaneous, gastrointestinal, inhalational, or injection-associated presentations.",
    ecologicalRole: "Zoonotic soil-associated pathogen cycling between environment and animal hosts.",
    relationshipType: "parasitic",
    ncbiTaxonomyId: 1392,
    imageFile: "Bacillus anthracis.jpg",
    diseaseSlugs: ["anthrax"],
    pathogenesisMechanism: "Dormant spores germinate in the host and elaborate anthrax toxins plus a poly-D-glutamate capsule.",
    antibioticProfile: "Usually susceptible to fluoroquinolones, tetracyclines, and other agents when treated early.",
    treatmentOptions: "Rapid antimicrobial therapy and antitoxin in systemic disease.",
    preventionMethods: "Occupational controls, livestock vaccination, and post-exposure prophylaxis.",
    biotechApplications: "Historical model for microbial causation and spore biology.",
    foodIndustryUses: "",
    environmentalUses: "",
    pharmaceuticalUses: "Anthrax toxin domains are widely used in receptor and toxin-uptake research.",
    hostOrganisms: ["Livestock", "Humans"],
    interactions: ["Persists in soils as spores", "Amplifies in grazing animals"],
    specialStructures: ["Endospores", "Capsule"],
    virulenceFactors: ["Protective antigen", "edema factor", "lethal factor"],
    notableRelatives: ["Bacillus cereus", "Bacillus thuringiensis"],
    researchMilestones: ["1876: landmark proof of microbial disease causation", "2001: bioterror events renewed interest in detection and countermeasures"],
    randomFacts: ["Its spores can persist in soil for years.", "Anthrax was central to the early history of microbiology."]
  },
  {
    slug: "clostridium-botulinum",
    commonName: "Botulism bacillus",
    scientificName: "Clostridium botulinum",
    kingdomLabel: "Bacteria",
    taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Bacillota", taxClass: "Clostridia", order: "Eubacteriales", family: "Clostridiaceae", genus: "Clostridium", species: "botulinum", commonClassification: "Anaerobic spore-forming rod" },
    discoveryYear: 1895,
    discoveredBy: "Emile van Ermengem",
    discoveryContext: "Van Ermengem isolated the organism during investigation of a fatal ham-associated outbreak.",
    gramStain: "positive",
    morphology: "bacilli",
    sizeUm: "4-6 x 0.9-1.2",
    motility: true,
    sporeForming: true,
    oxygenRequirement: "anaerobic",
    temperatureRange: "10-48 C",
    phRange: "4.6-8.5",
    habitat: "Soil, marine sediments, canned foods under anaerobic conditions.",
    isInfectious: true,
    isDangerous: true,
    bslLevel: 2,
    isBeneficial: false,
    benefitDescription: "",
    harmDescription: "Produces botulinum neurotoxin, one of the most potent toxins known.",
    ecologicalRole: "Environmental anaerobe with clinically important toxin production.",
    relationshipType: "saprophytic",
    ncbiTaxonomyId: 1491,
    imageFile: "Clostridium botulinum.jpg",
    diseaseSlugs: ["botulism"],
    pathogenesisMechanism: "Disease is toxin-mediated rather than invasive in most cases, blocking cholinergic neurotransmission.",
    antibioticProfile: "Antibiotics have limited value in toxin-mediated foodborne disease but may help wound botulism.",
    treatmentOptions: "Supportive care, antitoxin, and wound management when applicable.",
    preventionMethods: "Safe food preservation, pressure canning, and avoidance of honey in infants under 1 year.",
    biotechApplications: "Botulinum neurotoxin derivatives are widely studied in neurobiology.",
    foodIndustryUses: "",
    environmentalUses: "",
    pharmaceuticalUses: "Purified toxin preparations are used therapeutically in neurology and cosmetic medicine.",
    hostOrganisms: ["Humans", "Fish", "Birds"],
    interactions: ["Germinates in anaerobic niches", "Competes poorly in oxygenated environments"],
    specialStructures: ["Endospores"],
    virulenceFactors: ["Botulinum neurotoxin"],
    notableRelatives: ["Clostridium tetani", "Clostridium perfringens"],
    researchMilestones: ["1895: organism linked to foodborne outbreak", "Modern serotyping distinguished multiple toxin variants"],
    randomFacts: ["The organism itself may remain localized while its toxin causes systemic paralysis.", "Low-acid canned foods are a classic risk setting."]
  },
  {
    slug: "streptococcus-pyogenes",
    commonName: "Group A strep",
    scientificName: "Streptococcus pyogenes",
    kingdomLabel: "Bacteria",
    taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Bacillota", taxClass: "Bacilli", order: "Lactobacillales", family: "Streptococcaceae", genus: "Streptococcus", species: "pyogenes", commonClassification: "Beta-hemolytic Gram-positive coccus" },
    discoveryYear: 1884,
    discoveredBy: "Friedrich Fehleisen",
    discoveryContext: "Fehleisen isolated streptococci from erysipelas lesions and helped connect the group to human disease.",
    gramStain: "positive",
    morphology: "cocci",
    sizeUm: "0.6-1.0",
    motility: false,
    sporeForming: false,
    oxygenRequirement: "facultative",
    temperatureRange: "25-37 C",
    phRange: "6.0-7.5",
    habitat: "Human throat and skin with asymptomatic carriage in some hosts.",
    isInfectious: true,
    isDangerous: true,
    bslLevel: 2,
    isBeneficial: false,
    benefitDescription: "",
    harmDescription: "Causes pharyngitis, skin infections, necrotizing fasciitis, scarlet fever, and post-infectious immune sequelae.",
    ecologicalRole: "Human-adapted pathogen transmitted by respiratory and direct contact routes.",
    relationshipType: "parasitic",
    ncbiTaxonomyId: 1314,
    imageFile: "Streptococcus pyogenes.jpg",
    diseaseSlugs: ["streptococcal-pharyngitis"],
    pathogenesisMechanism: "M protein, streptolysins, and exotoxins promote adhesion, inflammation, and invasive potential.",
    antibioticProfile: "Penicillin susceptibility remains typical, though macrolide resistance can occur.",
    treatmentOptions: "Penicillin or amoxicillin with supportive care; aggressive surgery in necrotizing disease.",
    preventionMethods: "Respiratory etiquette, early treatment, and wound hygiene.",
    biotechApplications: "Immunologic tools and genome evolution studies often use GAS strains.",
    foodIndustryUses: "",
    environmentalUses: "",
    pharmaceuticalUses: "Streptococcal enzymes and immune interactions remain important translational research targets.",
    hostOrganisms: ["Humans"],
    interactions: ["Colonizes pharyngeal epithelium", "Evades complement and neutrophil killing"],
    specialStructures: ["Hyaluronic acid capsule", "M protein"],
    virulenceFactors: ["M protein", "streptolysin O", "Spe toxins"],
    notableRelatives: ["Streptococcus agalactiae", "Streptococcus dysgalactiae"],
    researchMilestones: ["Early 20th century: scarlet fever toxin biology characterized", "Modern genomics clarified hypervirulent clones"],
    randomFacts: ["The same species can cause mild pharyngitis or fulminant invasive disease.", "Post-streptococcal sequelae are immune-mediated rather than due to ongoing infection."]
  }
];

export const ADDITIONAL_MICROBE_SEEDS: CompactMicrobeSeed[] = [
  { slug: "helicobacter-pylori", commonName: "H. pylori", scientificName: "Helicobacter pylori", kingdomLabel: "Bacteria", taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Campylobacterota", taxClass: "Campylobacteria", order: "Campylobacterales", family: "Helicobacteraceae", genus: "Helicobacter", species: "pylori", commonClassification: "Microaerophilic curved rod" }, discoveryYear: 1982, discoveredBy: "Barry Marshall and Robin Warren", discoveryContext: "Marshall and Warren recognized spiral bacteria in gastric biopsies and connected them to peptic ulcer disease.", gramStain: "negative", morphology: "helical", oxygenRequirement: "microaerophilic", habitat: "Human gastric mucosa beneath the mucus layer.", ecologicalRole: "Persistent gastric colonizer that can shift from chronic colonization to pathogenic inflammation.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["peptic-ulcer-disease"], imageFile: "Helicobacter pylori.jpg", ncbiTaxonomyId: 210 },
  { slug: "salmonella-typhi", commonName: "Typhoid bacillus", scientificName: "Salmonella enterica serovar Typhi", kingdomLabel: "Bacteria", taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Pseudomonadota", taxClass: "Gammaproteobacteria", order: "Enterobacterales", family: "Enterobacteriaceae", genus: "Salmonella", species: "enterica", strain: "Typhi", commonClassification: "Enteric Gram-negative rod" }, discoveryYear: 1884, discoveredBy: "Karl Joseph Eberth", discoveryContext: "Eberth described the bacillus in patients with enteric fever.", gramStain: "negative", morphology: "bacilli", oxygenRequirement: "facultative", habitat: "Human intestinal tract, bloodstream, and contaminated water.", ecologicalRole: "Human-restricted invasive enteric pathogen.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["typhoid-fever"], imageFile: "SalmonellaNIAID.jpg", ncbiTaxonomyId: 90371 },
  { slug: "vibrio-cholerae", commonName: "Cholera vibrio", scientificName: "Vibrio cholerae", kingdomLabel: "Bacteria", taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Pseudomonadota", taxClass: "Gammaproteobacteria", order: "Vibrionales", family: "Vibrionaceae", genus: "Vibrio", species: "cholerae", commonClassification: "Curved Gram-negative rod" }, discoveryYear: 1854, discoveredBy: "Filippo Pacini", discoveryContext: "Pacini observed comma-shaped organisms in intestinal contents of cholera victims.", gramStain: "negative", morphology: "vibrio", oxygenRequirement: "facultative", habitat: "Brackish water, estuaries, and infected human intestine.", ecologicalRole: "Aquatic bacterium that becomes a major enteric pathogen in outbreak settings.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["cholera"], imageFile: "Vibrio cholerae.jpg", ncbiTaxonomyId: 666 },
  { slug: "yersinia-pestis", commonName: "Plague bacillus", scientificName: "Yersinia pestis", kingdomLabel: "Bacteria", taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Pseudomonadota", taxClass: "Gammaproteobacteria", order: "Enterobacterales", family: "Yersiniaceae", genus: "Yersinia", species: "pestis", commonClassification: "Gram-negative coccobacillus" }, discoveryYear: 1894, discoveredBy: "Alexandre Yersin", discoveryContext: "Yersin isolated the plague bacillus during the Hong Kong epidemic.", gramStain: "negative", morphology: "coccobacilli", oxygenRequirement: "facultative", habitat: "Rodent-flea cycles and infected mammalian tissues.", ecologicalRole: "Vector-borne zoonotic pathogen.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["plague"], imageFile: "Yersinia pestis.jpg", ncbiTaxonomyId: 632 },
  { slug: "lactobacillus-acidophilus", commonName: "Acidophilus", scientificName: "Lactobacillus acidophilus", kingdomLabel: "Bacteria", taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Bacillota", taxClass: "Bacilli", order: "Lactobacillales", family: "Lactobacillaceae", genus: "Lactobacillus", species: "acidophilus", commonClassification: "Lactic acid bacterium" }, discoveryYear: 1900, discoveredBy: "Moro and colleagues", discoveryContext: "Lactic acid-producing rods were described as important members of the human intestinal flora.", gramStain: "positive", morphology: "bacilli", oxygenRequirement: "aerotolerant", habitat: "Human gut, fermented foods, and probiotic formulations.", ecologicalRole: "Acid-producing mutualist that helps maintain mucosal microbial balance.", relationshipType: "mutualistic", isDangerous: false, isBeneficial: true, diseaseSlugs: [], imageFile: "Lactobacillus acidophilus.jpg", ncbiTaxonomyId: 1579 },
  { slug: "thermus-aquaticus", commonName: "Taq source bacterium", scientificName: "Thermus aquaticus", kingdomLabel: "Bacteria", taxonomy: { domain: "Bacteria", kingdom: "Bacteria", phylum: "Deinococcota", taxClass: "Deinococci", order: "Thermales", family: "Thermaceae", genus: "Thermus", species: "aquaticus", commonClassification: "Thermophilic rod" }, discoveryYear: 1969, discoveredBy: "Thomas Brock and Hudson Freeze", discoveryContext: "The organism was isolated from hot springs and later became famous as the source of Taq polymerase.", gramStain: "negative", morphology: "bacilli", oxygenRequirement: "aerobic", habitat: "Hot springs and thermal habitats.", ecologicalRole: "Thermophile that recycles organic matter at high temperature.", relationshipType: "saprophytic", isDangerous: false, isBeneficial: true, diseaseSlugs: [], imageFile: "Thermus aquaticus.jpg", ncbiTaxonomyId: 271 },
  { slug: "candida-albicans", commonName: "Candida", scientificName: "Candida albicans", kingdomLabel: "Fungi", taxonomy: { domain: "Eukaryota", kingdom: "Fungi", phylum: "Ascomycota", taxClass: "Saccharomycetes", order: "Saccharomycetales", family: "Debaryomycetaceae", genus: "Candida", species: "albicans", commonClassification: "Dimorphic yeast" }, discoveryYear: 1923, discoveredBy: "Christine Marie Berkhout", discoveryContext: "Berkhout formalized the genus Candida for medically relevant yeasts.", gramStain: "positive", morphology: "pleomorphic", oxygenRequirement: "facultative", habitat: "Human mucosa, GI tract, and skin folds.", ecologicalRole: "Common commensal yeast that becomes opportunistic under microbiome or immune disruption.", relationshipType: "commensal", isDangerous: true, isBeneficial: false, diseaseSlugs: ["candidiasis"], imageFile: "Candida albicans.jpg", ncbiTaxonomyId: 5476 },
  { slug: "aspergillus-fumigatus", commonName: "A. fumigatus", scientificName: "Aspergillus fumigatus", kingdomLabel: "Fungi", taxonomy: { domain: "Eukaryota", kingdom: "Fungi", phylum: "Ascomycota", taxClass: "Eurotiomycetes", order: "Eurotiales", family: "Aspergillaceae", genus: "Aspergillus", species: "fumigatus", commonClassification: "Mold with septate hyphae" }, discoveryYear: 1863, discoveredBy: "Johann Fresenius", discoveryContext: "Fresenius described the mold, which later became a key opportunistic pathogen in immunocompromised hosts.", gramStain: "unknown", morphology: "filamentous", oxygenRequirement: "aerobic", habitat: "Soil, compost, ventilation systems, and decaying vegetation.", ecologicalRole: "Thermotolerant saprophyte that releases airborne conidia.", relationshipType: "saprophytic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["aspergillosis"], imageFile: "Aspergillus fumigatus.jpg", ncbiTaxonomyId: 746128 },
  { slug: "saccharomyces-cerevisiae", commonName: "Baker's yeast", scientificName: "Saccharomyces cerevisiae", kingdomLabel: "Fungi", taxonomy: { domain: "Eukaryota", kingdom: "Fungi", phylum: "Ascomycota", taxClass: "Saccharomycetes", order: "Saccharomycetales", family: "Saccharomycetaceae", genus: "Saccharomyces", species: "cerevisiae", commonClassification: "Budding yeast" }, discoveryYear: 1838, discoveredBy: "Charles Cagniard-Latour", discoveryContext: "Microscopy of fermentation established yeast as a living agent rather than a simple chemical ferment.", gramStain: "unknown", morphology: "spherical", oxygenRequirement: "facultative", habitat: "Fruit surfaces, fermentation vats, and laboratory cultures.", ecologicalRole: "Model fermenter and central organism in carbohydrate-rich niches.", relationshipType: "saprophytic", isDangerous: false, isBeneficial: true, diseaseSlugs: [], imageFile: "Saccharomyces cerevisiae under DIC microscopy.jpg", ncbiTaxonomyId: 4932 },
  { slug: "penicillium-notatum", commonName: "Penicillin mold", scientificName: "Penicillium notatum", kingdomLabel: "Fungi", taxonomy: { domain: "Eukaryota", kingdom: "Fungi", phylum: "Ascomycota", taxClass: "Eurotiomycetes", order: "Eurotiales", family: "Trichocomaceae", genus: "Penicillium", species: "notatum", commonClassification: "Antibiotic-producing mold" }, discoveryYear: 1928, discoveredBy: "Alexander Fleming", discoveryContext: "A contaminating mold colony inhibiting staphylococci led Fleming to penicillin.", gramStain: "unknown", morphology: "filamentous", oxygenRequirement: "aerobic", habitat: "Decaying vegetation and laboratory environments.", ecologicalRole: "Decomposer producing antimicrobial secondary metabolites.", relationshipType: "saprophytic", isDangerous: false, isBeneficial: true, diseaseSlugs: [], imageFile: "Penicillium chrysogenum.jpg", ncbiTaxonomyId: 5076 },
  { slug: "sars-cov-2", commonName: "COVID-19 virus", scientificName: "SARS-CoV-2", kingdomLabel: "Viruses", taxonomy: { domain: "Viruses", kingdom: "Riboviria", phylum: "Pisuviricota", taxClass: "Pisoniviricetes", order: "Nidovirales", family: "Coronaviridae", genus: "Betacoronavirus", species: "SARS-CoV-2", commonClassification: "Enveloped positive-sense RNA virus" }, discoveryYear: 2019, discoveredBy: "Chinese CDC and international collaborators", discoveryContext: "Metagenomic sequencing rapidly identified a novel coronavirus associated with atypical pneumonia in Wuhan.", gramStain: "unknown", morphology: "spherical", oxygenRequirement: "unknown", habitat: "Human respiratory tract and susceptible host cells expressing ACE2.", ecologicalRole: "Respiratory pathogen with zoonotic origins and pandemic spread.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["covid-19"], imageFile: "SARS-CoV-2 without background.png", ncbiTaxonomyId: 2697049 },
  { slug: "hiv-1", commonName: "Human immunodeficiency virus type 1", scientificName: "HIV-1", kingdomLabel: "Viruses", taxonomy: { domain: "Viruses", kingdom: "Riboviria", phylum: "Artverviricota", taxClass: "Revtraviricetes", order: "Ortervirales", family: "Retroviridae", genus: "Lentivirus", species: "Human immunodeficiency virus 1", commonClassification: "Enveloped retrovirus" }, discoveryYear: 1983, discoveredBy: "Francoise Barre-Sinoussi and Luc Montagnier", discoveryContext: "A retrovirus isolated from lymphadenopathy samples was connected to AIDS.", gramStain: "unknown", morphology: "spherical", oxygenRequirement: "unknown", habitat: "Human CD4+ T cells, macrophages, and lymphoid tissues.", ecologicalRole: "Persistent human retrovirus that drives immune deficiency when untreated.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["hiv-aids"], imageFile: "HIV-1 EM.jpg", ncbiTaxonomyId: 11676 },
  { slug: "influenza-a-h1n1", commonName: "Influenza A H1N1", scientificName: "Influenza A virus H1N1", kingdomLabel: "Viruses", taxonomy: { domain: "Viruses", kingdom: "Orthornavirae", phylum: "Negarnaviricota", taxClass: "Insthoviricetes", order: "Articulavirales", family: "Orthomyxoviridae", genus: "Alphainfluenzavirus", species: "Influenza A virus", commonClassification: "Segmented negative-sense RNA virus" }, discoveryYear: 1933, discoveredBy: "Wilson Smith, Christopher Andrewes, Patrick Laidlaw", discoveryContext: "Isolation of human influenza virus from ferrets revolutionized respiratory virology.", gramStain: "unknown", morphology: "spherical", oxygenRequirement: "unknown", habitat: "Respiratory tract of humans, birds, swine, and other hosts.", ecologicalRole: "Rapidly evolving zoonotic respiratory virus with reassortment-driven emergence.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["influenza"], imageFile: "Influenza A virus.jpg", ncbiTaxonomyId: 11320 },
  { slug: "ebola-virus", commonName: "Ebola virus", scientificName: "Ebola virus", kingdomLabel: "Viruses", taxonomy: { domain: "Viruses", kingdom: "Orthornavirae", phylum: "Negarnaviricota", taxClass: "Monjiviricetes", order: "Mononegavirales", family: "Filoviridae", genus: "Orthoebolavirus", species: "Zaire ebolavirus", commonClassification: "Filamentous negative-sense RNA virus" }, discoveryYear: 1976, discoveredBy: "International outbreak teams in Zaire and Sudan", discoveryContext: "Filovirus outbreaks with hemorrhagic fever led to recognition of Ebola virus.", gramStain: "unknown", morphology: "filamentous", oxygenRequirement: "unknown", habitat: "Mammalian hosts and likely bat reservoirs.", ecologicalRole: "High-consequence zoonotic pathogen causing severe systemic disease.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["ebola-virus-disease"], imageFile: "Ebola virus virions.jpg", ncbiTaxonomyId: 186538 },
  { slug: "methanobrevibacter-smithii", commonName: "Dominant human gut archaeon", scientificName: "Methanobrevibacter smithii", kingdomLabel: "Archaea", taxonomy: { domain: "Archaea", kingdom: "Archaea", phylum: "Euryarchaeota", taxClass: "Methanobacteria", order: "Methanobacteriales", family: "Methanobacteriaceae", genus: "Methanobrevibacter", species: "smithii", commonClassification: "Methanogenic archaeon" }, discoveryYear: 1982, discoveredBy: "Miller and Wolin group", discoveryContext: "Gut methanogens were cultivated and described as important members of the human intestinal ecosystem.", gramStain: "unknown", morphology: "coccobacilli", oxygenRequirement: "anaerobic", habitat: "Human colon and anaerobic digestive tracts.", ecologicalRole: "Consumes hydrogen and helps shape fermentation energetics in the gut.", relationshipType: "commensal", isDangerous: false, isBeneficial: true, diseaseSlugs: [], imageFile: "Methanobrevibacter smithii.jpg", ncbiTaxonomyId: 2172 },
  { slug: "plasmodium-falciparum", commonName: "Malaria parasite", scientificName: "Plasmodium falciparum", kingdomLabel: "Protozoa", taxonomy: { domain: "Eukaryota", kingdom: "Protozoa", phylum: "Apicomplexa", taxClass: "Aconoidasida", order: "Haemosporida", family: "Plasmodiidae", genus: "Plasmodium", species: "falciparum", commonClassification: "Apicomplexan blood parasite" }, discoveryYear: 1880, discoveredBy: "Alphonse Laveran", discoveryContext: "Pigmented parasites were recognized in blood smears from patients with malaria.", gramStain: "unknown", morphology: "pleomorphic", oxygenRequirement: "unknown", habitat: "Human liver and erythrocytes plus Anopheles mosquitoes.", ecologicalRole: "Vector-borne intracellular parasite of humans and mosquitoes.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["malaria"], imageFile: "Plasmodium falciparum.jpg", ncbiTaxonomyId: 5833 },
  { slug: "toxoplasma-gondii", commonName: "Toxoplasma", scientificName: "Toxoplasma gondii", kingdomLabel: "Protozoa", taxonomy: { domain: "Eukaryota", kingdom: "Protozoa", phylum: "Apicomplexa", taxClass: "Conoidasida", order: "Eucoccidiorida", family: "Sarcocystidae", genus: "Toxoplasma", species: "gondii", commonClassification: "Apicomplexan tissue parasite" }, discoveryYear: 1908, discoveredBy: "Charles Nicolle and Louis Manceaux", discoveryContext: "The parasite was first identified in the gundi rodent and later connected to human disease.", gramStain: "unknown", morphology: "pleomorphic", oxygenRequirement: "unknown", habitat: "Felid intestines, warm-blooded intermediate hosts, and tissue cysts.", ecologicalRole: "Complex zoonotic parasite maintained through felid definitive hosts.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["toxoplasmosis"], imageFile: "Toxoplasma gondii.jpg", ncbiTaxonomyId: 5811 },
  { slug: "chlorella-vulgaris", commonName: "Chlorella", scientificName: "Chlorella vulgaris", kingdomLabel: "Algae", taxonomy: { domain: "Eukaryota", kingdom: "Algae", phylum: "Chlorophyta", taxClass: "Trebouxiophyceae", order: "Chlorellales", family: "Chlorellaceae", genus: "Chlorella", species: "vulgaris", commonClassification: "Unicellular green alga" }, discoveryYear: 1890, discoveredBy: "Martinus Beijerinck", discoveryContext: "Beijerinck described Chlorella as a small photosynthetic alga with biotechnological promise.", gramStain: "unknown", morphology: "spherical", oxygenRequirement: "unknown", habitat: "Freshwater and wastewater systems.", ecologicalRole: "Photosynthetic carbon fixer used in biomass and remediation studies.", relationshipType: "saprophytic", isDangerous: false, isBeneficial: true, diseaseSlugs: [], imageFile: "Chlorella vulgaris.jpg", ncbiTaxonomyId: 3077 },
  { slug: "bse-prion", commonName: "BSE prion", scientificName: "Bovine spongiform encephalopathy prion", kingdomLabel: "Prions", taxonomy: { domain: "Proteins", kingdom: "Prions", phylum: "Misfolded proteins", taxClass: "Prion proteins", order: "NA", family: "Prion protein", genus: "PrPSc", species: "BSE agent", commonClassification: "Infectious protein particle" }, discoveryYear: 1986, discoveredBy: "UK veterinary surveillance teams", discoveryContext: "Spongiform neurodegeneration in cattle was recognized as a transmissible prion disease.", gramStain: "unknown", morphology: "irregular", oxygenRequirement: "unknown", habitat: "Neural tissues and contaminated feed chains.", ecologicalRole: "Proteinaceous infectious particle that propagates by templated misfolding.", relationshipType: "parasitic", isDangerous: true, isBeneficial: false, diseaseSlugs: ["variant-cjd"], imageFile: "Prion Protein Structure.png" },
];

export const FLOWCHART_SEEDS: FlowchartSeed[] = [
  { title: "Gram Staining Procedure", slug: "gram-staining-procedure", description: "Stepwise staining workflow with interpretation checkpoints.", category: "gram_staining", mermaidCode: "flowchart TD\nA[Heat-fix smear]-->B[Crystal violet]\nB-->C[Iodine]\nC-->D[Alcohol decolorize]\nD-->E[Safranin counterstain]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { A: "Fix cells to the slide without distorting morphology.", B: "Primary stain binds peptidoglycan-rich walls.", D: "The differentiating step determines Gram reaction." }, referenceKeys: ["bergey", "cdc"] },
  { title: "Bacterial Identification Algorithm", slug: "bacterial-identification-algorithm", description: "Dichotomous key linking Gram stain, morphology, oxygen use, and biochemical behavior.", category: "id_algorithm", mermaidCode: "flowchart TD\nA[Gram result]-->B{Positive?}\nB-->C[Cocci]\nB-->D[Negative rods]\nC-->E[Catalase]\nD-->F[Oxidase]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { A: "Start with microscopy and staining.", E: "Catalase helps separate staphylococci from streptococci." }, referenceKeys: ["bergey", "manual-clinical-microbiology"] },
  { title: "Fungal Classification Flowchart", slug: "fungal-classification-flowchart", description: "Sort fungi by morphology, dimorphism, and reproductive structures.", category: "id_algorithm", mermaidCode: "flowchart TD\nA[Fungal isolate]-->B{Yeast or mold?}\nB-->C[Yeast]\nB-->D[Mold]\nD-->E{Dimorphic?}", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { C: "Budding patterns and capsules can be decisive.", E: "Temperature-dependent dimorphism has clinical implications." }, referenceKeys: ["mycobank", "manual-clinical-microbiology"] },
  { title: "Virus Classification by Genome", slug: "virus-classification-by-genome", description: "Interactive overview of genome type, envelope, and symmetry.", category: "id_algorithm", mermaidCode: "flowchart TD\nA[Virus]-->B{DNA or RNA?}\nB-->C[DNA]\nB-->D[RNA]\nD-->E{Positive or negative sense?}", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { A: "Entry node for capsid and genome logic.", E: "Sense polarity strongly influences replication strategy." }, referenceKeys: ["ictv", "viralzone"] },
  { title: "Metabolic Pathway Overview", slug: "metabolic-pathway-overview", description: "Aerobic and anaerobic routes tied to growth conditions and ATP yield.", category: "metabolic", mermaidCode: "flowchart TD\nA[Substrate]-->B[Glycolysis]\nB-->C{Oxygen?}\nC-->D[TCA + ETC]\nC-->E[Fermentation]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { B: "Common central pathway feeding multiple metabolic programs.", D: "Highest ATP yield under aerobic respiration." }, referenceKeys: ["lehninger", "microbiology-introduction"] },
  { title: "Infection Pathway Diagram", slug: "infection-pathway-diagram", description: "From entry and colonization to tissue damage and immune response.", category: "infection_pathway", mermaidCode: "flowchart LR\nA[Entry]-->B[Colonization]\nB-->C[Invasion]\nC-->D[Tissue damage]\nD-->E[Immune response]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { B: "Adherence and niche establishment determine early success.", D: "Damage may be toxin-mediated, inflammatory, or both." }, referenceKeys: ["manual-clinical-microbiology", "harrisons"] },
  { title: "Antibiotic Resistance Mechanisms", slug: "antibiotic-resistance-mechanisms", description: "Compare efflux, enzymatic inactivation, target modification, and permeability loss.", category: "antibiotic_resistance", mermaidCode: "flowchart TD\nA[Resistance]-->B[Efflux pumps]\nA-->C[Drug enzymes]\nA-->D[Target change]\nA-->E[Reduced permeability]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { B: "Common in Gram-negative multidrug resistance.", C: "Beta-lactamases are the archetypal example." }, referenceKeys: ["manual-clinical-microbiology", "cdc"] },
  { title: "Life Cycle Diagrams", slug: "life-cycle-diagrams", description: "Contrasts bacteriophage lytic and lysogenic cycles plus parasitic stage transitions.", category: "life_cycle", mermaidCode: "flowchart TD\nA[Attachment]-->B[Genome entry]\nB-->C{Lytic or lysogenic?}\nC-->D[Lytic burst]\nC-->E[Prophage state]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { C: "Temperate phages can choose persistence or rapid replication." }, referenceKeys: ["viralzone", "microbiology-introduction"] },
  { title: "Microbiome Ecology Flow", slug: "microbiome-ecology-flow", description: "Maps symbiosis, dysbiosis, barrier failure, and recovery.", category: "ecological", mermaidCode: "flowchart TD\nA[Stable microbiome]-->B{Perturbation?}\nB-->C[Dysbiosis]\nC-->D[Inflammation]\nD-->E[Recovery or chronicity]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { C: "Antibiotics, diet shifts, or infection can disrupt community balance." }, referenceKeys: ["microbiology-introduction", "manual-clinical-microbiology"] },
  { title: "Koch's Postulates", slug: "kochs-postulates", description: "Interactive proof steps connecting an organism to a disease outcome.", category: "id_algorithm", mermaidCode: "flowchart TD\nA[Find organism in disease]-->B[Isolate in pure culture]\nB-->C[Cause disease in host]\nC-->D[Re-isolate organism]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { D: "Re-isolation closes the causal loop in classical bacteriology." }, referenceKeys: ["bergey", "microbiology-introduction"] },
  { title: "Aseptic Technique Protocol", slug: "aseptic-technique-protocol", description: "Bench workflow for sterile transfers and contamination prevention.", category: "infection_pathway", mermaidCode: "flowchart TD\nA[Disinfect bench]-->B[Organize materials]\nB-->C[Flame or sanitize]\nC-->D[Transfer specimen]\nD-->E[Re-cap and label]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { C: "Instrument hygiene is the core break point for contamination control." }, referenceKeys: ["cdc", "manual-clinical-microbiology"] },
  { title: "Sterilization Methods Comparison", slug: "sterilization-methods-comparison", description: "Compare moist heat, dry heat, filtration, gas, and radiation methods.", category: "infection_pathway", mermaidCode: "flowchart TD\nA[Item type]-->B{Heat stable?}\nB-->C[Autoclave]\nB-->D[Filter or gas]\nC-->E[Validated sterility]", svgContent: "<svg xmlns='http://www.w3.org/2000/svg'></svg>", nodeDescriptions: { B: "Material compatibility determines method selection." }, referenceKeys: ["cdc", "microbiology-introduction"] }
];

export const TIMELINE_SEEDS: TimelineSeed[] = [
  { year: 1676, title: "Leeuwenhoek describes animalcules", description: "Microscopy opened the first view into invisible life and microbial morphology.", eventType: "research_milestone", significance: "Major breakthrough", discoverers: "Antonie van Leeuwenhoek", country: "Netherlands" },
  { year: 1854, title: "Pacini documents cholera vibrio", description: "Comma-shaped bacteria were observed in cholera patients, anticipating later germ-theory acceptance.", eventType: "discovery", significance: "Important", discoverers: "Filippo Pacini", country: "Italy", microbeSlug: "vibrio-cholerae", diseaseSlug: "cholera" },
  { year: 1876, title: "Anthrax proves microbial causation", description: "Work on Bacillus anthracis helped formalize the causal logic later called Koch's postulates.", eventType: "discovery", significance: "Major breakthrough", discoverers: "Robert Koch", country: "Germany", microbeSlug: "bacillus-anthracis", diseaseSlug: "anthrax" },
  { year: 1882, title: "Tubercle bacillus announced", description: "Mycobacterium tuberculosis was established as the cause of tuberculosis.", eventType: "discovery", significance: "Major breakthrough", discoverers: "Robert Koch", country: "Germany", microbeSlug: "mycobacterium-tuberculosis", diseaseSlug: "tuberculosis" },
  { year: 1894, title: "Plague bacillus isolated", description: "The etiologic agent of plague was identified during an epidemic investigation.", eventType: "discovery", significance: "Important", discoverers: "Alexandre Yersin", country: "Hong Kong", microbeSlug: "yersinia-pestis", diseaseSlug: "plague" },
  { year: 1928, title: "Penicillin observed", description: "A Penicillium colony inhibiting bacterial growth seeded the antibiotic era.", eventType: "research_milestone", significance: "Major breakthrough", discoverers: "Alexander Fleming", country: "United Kingdom", microbeSlug: "penicillium-notatum" },
  { year: 1953, title: "DNA era reshapes microbiology", description: "Molecular biology accelerated microbial genetics, phage work, and taxonomy.", eventType: "research_milestone", significance: "Important", discoverers: "Multiple investigators", country: "International", microbeSlug: "bacteriophage-t4" },
  { year: 1983, title: "HIV identified", description: "A new retrovirus was linked to AIDS and transformed virology and global health.", eventType: "discovery", significance: "Major breakthrough", discoverers: "Barre-Sinoussi and Montagnier teams", country: "France", microbeSlug: "hiv-1", diseaseSlug: "hiv-aids" },
  { year: 1985, title: "PCR depends on Taq polymerase", description: "Thermus aquaticus enabled thermostable DNA amplification and modern molecular diagnostics.", eventType: "research_milestone", significance: "Major breakthrough", discoverers: "Kary Mullis and colleagues", country: "United States", microbeSlug: "thermus-aquaticus" },
  { year: 2001, title: "Anthrax letters raise biosurveillance", description: "Deliberate release events accelerated preparedness, diagnostics, and biodefense infrastructure.", eventType: "epidemic", significance: "Important", discoverers: "Public health response", country: "United States", diseaseSlug: "anthrax" },
  { year: 2014, title: "Ebola epidemic drives genomic response", description: "Real-time sequencing became central to outbreak tracking and transmission mapping.", eventType: "epidemic", significance: "Important", discoverers: "International outbreak consortia", country: "West Africa", microbeSlug: "ebola-virus", diseaseSlug: "ebola-virus-disease" },
  { year: 2019, title: "SARS-CoV-2 emerges", description: "A new coronavirus triggered a global pandemic and rapid-scale genomic surveillance.", eventType: "epidemic", significance: "Major breakthrough", discoverers: "Global surveillance networks", country: "China", microbeSlug: "sars-cov-2", diseaseSlug: "covid-19" }
];
