/**
 * fix-data.ts — Run with: npx tsx prisma/fix-data.ts
 *
 * 1. Verifies every microbe's image against Wikimedia Commons API and updates
 *    imageUrl to the real upload.wikimedia.org direct URL.
 * 2. Replaces all flowchart mermaid codes with rich, detailed diagrams.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Best-known Wikimedia Commons filename per microbe slug ────────────────────
const SLUG_TO_FILE: Record<string, string> = {
  // ── Bacteria ──
  "staphylococcus-aureus":       "Staphylococcus aureus 01.jpg",
  "escherichia-coli":            "EscherichiaColi NIAID.jpg",
  "mycobacterium-tuberculosis":  "Mycobacterium tuberculosis Ziehl-Neelsen stain.jpg",
  "bacillus-anthracis":          "Bacillus anthracis.jpg",
  "clostridium-botulinum":       "Clostridium botulinum.jpg",
  "streptococcus-pyogenes":      "Streptococcus pyogenes.jpg",
  "helicobacter-pylori":         "Helicobacter pylori 26695.jpg",
  "salmonella-typhi":            "SalmonellaNIAID.jpg",
  "vibrio-cholerae":             "Vibrio cholerae.jpg",
  "yersinia-pestis":             "Yersinia pestis.jpg",
  "lactobacillus-acidophilus":   "Lactobacillus acidophilus TEM.jpg",
  "thermus-aquaticus":           "Thermus aquaticus.jpg",
  "neisseria-gonorrhoeae":       "Neisseria gonorrhoeae.jpg",
  "borrelia-burgdorferi":        "Borrelia burgdorferi.jpg",
  "klebsiella-pneumoniae":       "Klebsiella pneumoniae.jpg",
  "mrsa":                        "Staphylococcus aureus 01.jpg",
  "nitrosomonas-europaea":       "Nitrosomonas.jpg",
  "rhizobium-leguminosarum":     "Rhizobium leguminosarum.jpg",
  "treponema-pallidum":          "Treponema pallidum.jpg",
  "pseudomonas-aeruginosa":      "Pseudomonas aeruginosa.jpg",
  // ── Fungi ──
  "candida-albicans":            "Candida albicans.jpg",
  "aspergillus-fumigatus":       "Aspergillus fumigatus.jpg",
  "saccharomyces-cerevisiae":    "Saccharomyces cerevisiae under DIC microscopy.jpg",
  "penicillium-notatum":         "Penicillium chrysogenum.jpg",
  "cryptococcus-neoformans":     "Cryptococcus neoformans.jpg",
  "trichophyton-rubrum":         "Trichophyton rubrum.jpg",
  "histoplasma-capsulatum":      "Histoplasma capsulatum.jpg",
  "coccidioides-immitis":        "Coccidioides immitis.jpg",
  // ── Viruses ──
  "sars-cov-2":                  "SARS-CoV-2 without background.png",
  "hiv-1":                       "HIV-1 EM.jpg",
  "influenza-a-h1n1":            "Influenza A virus.jpg",
  "ebola-virus":                 "Ebola virus virions.jpg",
  "herpes-simplex-virus-1":      "Herpes simplex virus.jpg",
  "poliovirus":                  "Poliovirus.jpg",
  "variola-virus":               "Variola virus.jpg",
  "bacteriophage-t4":            "Bacteriophage.jpg",
  "rabies-virus":                "Rabiesvirus.jpg",
  "hepatitis-b-virus":           "Hepatitis B virions.jpg",
  // ── Archaea ──
  "methanobrevibacter-smithii":  "Methanobrevibacter smithii.jpg",
  "halobacterium-salinarum":     "Halobacterium salinarum.jpg",
  "thermococcus-kodakarensis":   "Thermococcus kodakarensis.jpg",
  "sulfolobus-acidocaldarius":   "Sulfolobus acidocaldarius.jpg",
  // ── Protozoa ──
  "plasmodium-falciparum":       "Plasmodium falciparum.jpg",
  "toxoplasma-gondii":           "Toxoplasma gondii.jpg",
  "entamoeba-histolytica":       "Entamoeba histolytica.jpg",
  "giardia-lamblia":             "Giardia lamblia.jpg",
  "trypanosoma-brucei":          "Trypanosoma brucei.jpg",
  "leishmania-donovani":         "Leishmania donovani.jpg",
  // ── Algae ──
  "chlorella-vulgaris":          "Chlorella vulgaris.jpg",
  "chlamydomonas-reinhardtii":   "Chlamydomonas reinhardtii.jpg",
  "prochlorococcus-marinus":     "Prochlorococcus marinus.jpg",
  // ── Prions ──
  "bse-prion":                   "Prion Protein Structure.png",
  "scrapie-prion":               "Prion Protein Structure.png",
};

// Alternative filenames to try if the primary one doesn't exist on Commons
const FALLBACK_FILES: Record<string, string[]> = {
  "mycobacterium-tuberculosis":  ["Mycobacterium tuberculosis Ziehl-Neelsen stain 02.jpg", "Mycobacterium tuberculosis (CDC-PHIL -5789) lores.jpg"],
  "helicobacter-pylori":         ["Helicobacter pylori.jpg"],
  "lactobacillus-acidophilus":   ["Lactobacillus acidophilus.jpg"],
  "thermus-aquaticus":           ["Thermus aquaticus YT-1.jpg"],
  "nitrosomonas-europaea":       ["Nitrosomonas europaea.jpg"],
  "rhizobium-leguminosarum":     ["Rhizobium leguminosarum bv viciae 3841.jpg"],
  "treponema-pallidum":          ["Treponema pallidum 01.jpg"],
  "candida-albicans":            ["CandidaAlbicans.jpg", "Candida albicans SEM.jpg"],
  "cryptococcus-neoformans":     ["CryptococcusNeoformans.jpg", "Cryptococcus neoformans var. grubii CDC.jpg"],
  "histoplasma-capsulatum":      ["Histoplasma capsulatum 01.jpg"],
  "hiv-1":                       ["HIV Virus.jpg", "HIV-Viren.jpg"],
  "poliovirus":                  ["Polio EM PHIL 2099 lores.jpg"],
  "methanobrevibacter-smithii":  ["Methanobrevibacter smithii DSM 861.jpg"],
  "halobacterium-salinarum":     ["Halobacterium salinarum NRC-1.jpg"],
  "thermococcus-kodakarensis":   ["Thermococcus kodakaraensis.jpg"],
  "sulfolobus-acidocaldarius":   ["Sulfolobus acidocaldarius 2.jpg", "Sulfolobus.jpg"],
  "toxoplasma-gondii":           ["Toxoplasma gondii tachy.jpg"],
  "leishmania-donovani":         ["Leishmania donovani 01.jpg"],
  "prochlorococcus-marinus":     ["Prochlorococcus.jpg"],
};

// ── Rich Mermaid Flowchart Code per slug ─────────────────────────────────────
const FLOWCHART_MERMAID: Record<string, string> = {
  "gram-staining-procedure": `flowchart TD
    A([🔬 Start: Prepare bacterial smear]) --> B[Heat-fix smear to glass slide\nPasses flame 3× — kills cells\nfixes them in position]
    B --> C[Apply Crystal Violet\nPrimary stain — 60 seconds\nPenetrates ALL cell walls]
    C --> D[Add Gram's Iodine\nMordant — 60 seconds\nForms CV-I complex in peptidoglycan]
    D --> E[Decolorize with 95% Ethanol\n15–30 seconds — CRITICAL STEP\nRemoves CV-I from thin walls]
    E --> F{Does bacterium retain\ncrystal violet?}
    F -->|YES — thick peptidoglycan\nretains the stain| G[Apply Safranin counterstain\n60 seconds — pink/red]
    F -->|NO — thin peptidoglycan\nstain washed out| G
    G --> H{Examine under\nlight microscope × 100 oil}
    H -->|Purple / Violet cells| I[✅ GRAM-POSITIVE\nThick multilayer peptidoglycan\n20–80 nm wall]
    H -->|Pink / Red cells| J[✅ GRAM-NEGATIVE\nThin peptidoglycan + outer membrane\n2–7 nm wall]
    I --> K[Examples\nStaphylococcus aureus\nStreptococcus pyogenes\nBacillus anthracis\nClostridium botulinum]
    J --> L[Examples\nEscherichia coli\nSalmonella typhi\nPseudomonas aeruginosa\nVibrio cholerae]
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style I fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style J fill:#0c3044,stroke:#FF4757,color:#e0f7f4
    style F fill:#0a1628,stroke:#00F5D4,color:#e0f7f4`,

  "bacterial-identification-algorithm": `flowchart TD
    A([Unknown Bacterial Isolate]) --> B[Gram Stain + Microscopy]
    B --> C{Gram Reaction?}
    C -->|Gram-Positive +| D{Cell Morphology?}
    C -->|Gram-Negative −| E{Cell Morphology?}
    D -->|Cocci in clusters\nor pairs| F[Catalase Test]
    D -->|Rods / Bacilli| G{Spore forming?}
    D -->|Cocci in chains| H[Streptococcus spp.\nα β or γ hemolysis?]
    E -->|Diplococci| I[Oxidase Test → Neisseria\nor Moraxella]
    E -->|Rods| J[Oxidase Test]
    E -->|Curved rods| K[Campylobacter\nor Vibrio]
    F -->|Catalase +| L[Staphylococcus spp.\n→ Coagulase test\nS. aureus vs CoNS]
    F -->|Catalase −| H
    G -->|Yes aerobic| M[Bacillus spp.\nB. anthracis / B. cereus]
    G -->|Yes anaerobic| N[Clostridium spp.\nC. botulinum / C. difficile]
    G -->|No| O[Listeria / Corynebacterium\nErysipelothrix]
    J -->|Oxidase +| P[Pseudomonas\nAeromonas\nPasteurella]
    J -->|Oxidase −| Q[Enterobacteriaceae panel\nIMViC — Indole Methyl-red\nVoges-Proskauer Citrate]
    Q --> R[TSI Agar — sugar fermentation\nH2S gas production]
    R --> S[Species ID:\nE. coli / Salmonella\nKlebsiella / Proteus]
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style S fill:#0c3044,stroke:#00F5D4,color:#e0f7f4`,

  "fungal-classification-flowchart": `flowchart TD
    A([Fungal Clinical Specimen]) --> B[KOH Preparation\n10–20% KOH clears tissue\nDirect microscopy]
    B --> C{Growth form?}
    C -->|Yeast only| D{Budding pattern\nand capsule?}
    C -->|Mold only| E{Colony color\nand texture?}
    C -->|Both forms possible| F[Dimorphic Fungus\nTest at 25°C vs 37°C]
    D -->|Pseudohyphae\nbranching buds| G[Candida species\nGerm tube test 37°C]
    D -->|Large capsule\nIndia ink positive| H[Cryptococcus neoformans\nUrease + Melanin production]
    D -->|Large thick-walled\nyeast — figure-8 shape| I[Blastomyces dermatitidis]
    E -->|White / gray powdery| J{Hyphae structure?}
    E -->|Black / dark colony| K[Dematiaceous fungi\nAlternaria Cladosporium Exophiala]
    E -->|Blue-green / rapid growth| L[Penicillium / Aspergillus\nCheck conidia under microscope]
    F -->|Yeast @ 37°C\nMold @ 25°C| M[Endemic Mycoses\nHistoplasma capsulatum\nCoccidioides immitis\nBlastomyces]
    J -->|Septate 45° angle branching| N[Aspergillus species\nGalactomannan Ag test\nA. fumigatus most common]
    J -->|Non-septate 90° branching| O[Mucormycosis\nRhizopus Mucor Lichtheimia\nVascular invasion — urgent]
    G -->|Germ tube +| P[Candida albicans]
    G -->|Germ tube −| Q[Non-albicans Candida\nC. glabrata C. krusei C. parapsilosis\nAzole resistance common]
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style O fill:#0c3044,stroke:#FF4757,color:#e0f7f4`,

  "virus-classification-by-genome": `flowchart TD
    A([Unknown Virus — initial characterization]) --> B{Nucleic Acid?}
    B -->|DNA genome| C{Strand configuration?}
    B -->|RNA genome| D{Strand configuration?}
    C -->|dsDNA — double stranded| E{Enveloped?}
    C -->|ssDNA — single stranded| F[Parvoviruses — B19\nAnelloviruses — TTV\nCircoviruses]
    D -->|dsRNA — double stranded| G[Reoviruses\nRotavirus — infantile gastroenteritis\nOrbivirus — Bluetongue]
    D -->|ssRNA| H{Polarity?}
    E -->|Enveloped| I[Herpesviruses — HSV CMV EBV VZV\nPoxviruses — Variola Vaccinia\nHepadnaviruses — HBV]
    E -->|Non-enveloped| J[Adenoviruses — respiratory\nPapovaviruses — HPV\nPolyomaviruses — BK JC]
    H -->|Positive sense +\nDirect translation| K[Picornaviruses — Poliovirus HAV\nFlaviviruses — Dengue Zika HCV\nCoronaviruses — SARS-CoV-2 MERS]
    H -->|Negative sense −\nRequires RNA-dep RNA pol| L[Orthomyxoviruses — Influenza A B\nRhabdoviruses — Rabies\nFiloviruses — Ebola Marburg\nParamyxoviruses — Measles Mumps RSV]
    H -->|Ambisense / Retrovirus| M[Retroviruses — HIV-1 HIV-2 HTLV\nReverse transcriptase → DNA copy\nArenaviruses — Lassa]
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style M fill:#0c3044,stroke:#FF4757,color:#e0f7f4`,

  "metabolic-pathway-overview": `flowchart TD
    A([Glucose C6H12O6 enters cell]) --> B[Glycolysis — Cytoplasm\n10 enzymatic steps\nNet: 2 ATP + 2 NADH + 2 Pyruvate]
    B --> C{Oxygen O2\navailable?}
    C -->|Aerobic — O2 present| D[Pyruvate Decarboxylation\nMitochondrial matrix\nPyruvate → Acetyl-CoA + CO2\nGenerates 1 NADH per pyruvate]
    C -->|Anaerobic — no O2| E{Fermentation route?}
    D --> F[TCA Cycle / Krebs Cycle\n8 reactions per turn × 2\n6 NADH + 2 FADH2 + 2 GTP\nReleases CO2]
    F --> G[Electron Transport Chain\nInner mitochondrial membrane\nNADH → 2.5 ATP\nFADH2 → 1.5 ATP\nProton gradient → ATP synthase]
    G --> H[✅ Aerobic Respiration Total\n~30–32 ATP per glucose\nH2O produced as byproduct]
    E -->|Lactic acid fermentation| I[Pyruvate → Lactate\nNAD+ regenerated\n2 ATP net\nMuscle cells Lactobacillus]
    E -->|Alcoholic fermentation| J[Pyruvate → Ethanol + CO2\nNAD+ regenerated\n2 ATP net\nSaccharomyces cerevisiae]
    E -->|Mixed acid fermentation| K[Acetate + Formate\n+ Ethanol + Succinate\nEnterobacteriaceae\nIMViC diagnostic tests]
    E -->|Methanogenesis| L[CO2 + H2 → CH4 + H2O\nArchaeal pathway\nMethanobrevibacter smithii\nGut methane production]
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style H fill:#0c3044,stroke:#00F5D4,color:#e0f7f4`,

  "infection-pathway-diagram": `flowchart LR
    A([Pathogen in environment\nor reservoir host]) --> B{Route of entry\ninto new host}
    B -->|Airborne / Droplet| C[Inhaled into\nrespiratory tract\nInfluenza SARS-CoV-2 TB]
    B -->|Fecal-oral / Ingestion| D[GI tract mucosa\nSalmonella Vibrio\nPoliovirus HAV]
    B -->|Direct contact / Wound| E[Skin or mucosa breach\nStaph aureus HSV\nTreponema pallidum]
    B -->|Vector-borne| F[Arthropod bite\nPlasmodium — mosquito\nBorrelia — tick]
    B -->|Parenteral / Blood| G[IV drug use / transfusion\nHIV HBV HCV]
    C --> H[Attachment to host receptors\nAdhesins — pili fimbriae\nSpike protein — SARS-CoV-2]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[Colonization and immune evasion\nCapsules — Klebsiella Strep pneumo\nProtein A — S. aureus\nIgA protease — Neisseria]
    I --> J[Invasion and dissemination\nHyaluronidase collagenase\nIntracellular spread\nLymphatic / bloodstream]
    J --> K{Mechanism of\ntissue damage}
    K -->|Exotoxins| L[Pore-forming — Staph alpha toxin\nAB toxins — Botulinum Cholera\nSuperantigens — TSST-1]
    K -->|Endotoxin / LPS| M[Gram-negative cell wall\nTNF-α IL-1 IL-6 cascade\nSeptic shock]
    K -->|Intracellular replication| N[Obligate intracellular\nChlamydia Rickettsia\nMycobacterium TB]
    L --> O[Host immune response\nInnate: NK neutrophils macrophages\nAdaptive: T-cells antibodies]
    M --> O
    N --> O
    O --> P{Clinical outcome}
    P -->|Clearance| Q[✅ Recovery\nImmune memory formed]
    P -->|Persistent| R[Chronic carrier\nor latent infection]
    P -->|Overwhelming| S[Sepsis / SIRS\nMulti-organ failure]`,

  "antibiotic-resistance-mechanisms": `flowchart TD
    A([Antibiotic administered]) --> B[Drug enters bacterial environment]
    B --> C{Outer membrane\nbarrier — Gram-neg?}
    C -->|Yes| D{Porin channels\nstill present?}
    C -->|No — Gram-pos| E[Drug reaches periplasm\nor cytoplasm]
    D -->|Porins lost or mutated| F[❌ Reduced permeability\nImipenem resistance — Klebsiella\nPorin OmpK35/36 loss]
    D -->|Porins intact| E
    E --> G{Efflux pumps\nactivated?}
    G -->|Yes — pump drug out| H[❌ Efflux-mediated resistance\nMexAB-OprM — Pseudomonas\nAcrAB-TolC — E. coli\nMultidrug efflux — MDR]
    G -->|No| I{Drug reaches\ntarget?}
    I -->|Enzymatic inactivation first| J[❌ Drug degradation\nβ-Lactamases — penicillins cephalosporins\nESBL KPC NDM-1 OXA\nAminoglycoside-modifying enzymes\nChloramphenicol acetyltransferase]
    I -->|Drug binds modified target| K[❌ Target alteration\nPBP2a mecA — MRSA\nDNA gyrase gyrA mutation — FQ\n23S rRNA mutation — macrolides\nVanA/VanB — Vancomycin resistance]
    I -->|Drug reaches intact target| L[✅ Drug inhibits bacterium\nSusceptible organism]
    J --> M{Resistance genes\nspread?}
    K --> M
    H --> M
    F --> M
    M -->|Plasmid conjugation\nTransposon / integron| N[Horizontal Gene Transfer\nSame or different species\nRapid pandemic spread]
    M -->|Chromosomal mutation\nClonal expansion| O[Vertical transmission\nSelect pressure drives\nclonal dominance]
    N --> P[Multidrug-Resistant Organism\nMDRO — XDR — PDR\nLimited therapeutic options]
    O --> P
    style L fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style P fill:#0c3044,stroke:#FF4757,color:#e0f7f4`,

  "life-cycle-diagrams": `flowchart TD
    subgraph Phage["🦠 Bacteriophage Life Cycle"]
    direction TB
    A1[Phage approaches\nbacterial cell] --> B1[Tail fibers recognize\nspecific surface receptor]
    B1 --> C1[Phage genome injected\nDNA or RNA — protein coat remains outside]
    C1 --> D1{Lytic or\nLysogenic decision?}
    D1 -->|Lytic cycle selected\nhigh host health| E1[Early mRNA synthesis\nHost machinery hijacked]
    E1 --> F1[Phage DNA replication\nNew genome copies made]
    F1 --> G1[Late genes expressed\nCapsid + tail proteins assembled]
    G1 --> H1[Virion assembly\n100–200 new phage particles]
    H1 --> I1[Holin + endolysin burst cell\nProgeny phage released]
    D1 -->|Lysogenic — host stressed\nor lambda phage CI repressor| J1[Phage DNA integrates\nas prophage in chromosome]
    J1 --> K1[Prophage replicates\nsilently with host cell]
    K1 --> L1{SOS response\nUV or DNA damage?}
    L1 -->|No stress| K1
    L1 -->|SOS induced| M1[Prophage excised\nfrom chromosome]
    M1 --> E1
    end
    subgraph Para["🦟 Plasmodium Life Cycle — Malaria"]
    direction TB
    A2[Infected Anopheles\nmosquito bites human] --> B2[Sporozoites injected\ninto bloodstream]
    B2 --> C2[Liver stage — 7–14 days\nHepatic schizogony\nAsymptomatic]
    C2 --> D2[Merozoites released\ninto bloodstream]
    D2 --> E2[Erythrocytic stage\nInvade red blood cells]
    E2 --> F2[Ring → Trophozoite → Schizont\n48 h cycle P. falciparum]
    F2 --> G2[RBC lyses\nFever spike + anemia]
    G2 --> E2
    G2 --> H2[Some become gametocytes\nMale + female forms]
    H2 --> I2[Mosquito ingests gametocytes\nduring blood meal]
    I2 --> J2[Sexual reproduction\nin mosquito midgut]
    J2 --> A2
    end`,

  "microbiome-ecology-flow": `flowchart TD
    A([Healthy Gut Microbiome\n1000+ species — 38 trillion microbes\nFirmicutes Bacteroidetes dominant]) --> B{Perturbation event?}
    B -->|Broad-spectrum antibiotics| C[Dysbiosis — community collapse\nDiversity loss in 3–4 days\nResistant taxa expand]
    B -->|High-fat low-fiber diet\nWestern diet shift| D[Firmicutes ↑ Bacteroidetes ↓\nMetabolic dysbiosis\nObesity association]
    B -->|Enteric infection\nSalmonella Norovirus| E[Pathobiont expansion\nEpithelial barrier disruption\nInflammatory response]
    B -->|Immunosuppression| F[Opportunistic overgrowth\nCandida Clostridium\nKlebsiella]
    B -->|No perturbation| A
    C --> G[C. difficile expansion\nSpore-forming colonizer\nToxin A + B production]
    D --> H[Leaky gut — tight junction loss\nLPS translocation\nSystemic low-grade inflammation]
    E --> I[Acute gastroenteritis\nDehydration electrolyte loss\nDuration 3–7 days typical]
    F --> J[Invasive candidiasis\nor gut translocation\nbacteremia risk]
    G --> K{Severity?}
    K -->|Mild CDI| L[Oral vancomycin\nor fidaxomicin 10 days]
    K -->|Severe / recurrent CDI| M[Fecal Microbiota Transplant\n>90% cure rate\nDonor stool — colonoscopy / capsule]
    H --> N[Chronic disease associations\nType-2 diabetes\nNAFLD — colorectal cancer]
    I --> O[Oral rehydration salts\nZinc supplementation\nProbiotics — Lactobacillus rhamnosus]
    L --> P[Microbiome partial restoration\n6–8 weeks recovery]
    M --> P
    O --> P
    P --> Q[Dietary support\nHigh-fiber prebiotics\nFermented foods]
    Q --> A
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style G fill:#0c3044,stroke:#FF4757,color:#e0f7f4`,

  "kochs-postulates": `flowchart TD
    A([Disease outbreak observed\nin host population]) --> B[Epidemiological investigation\nCase definition + case finding\nExposure history]
    B --> C[POSTULATE 1 — Association\nIsolate potential pathogen\nfrom ALL diseased hosts]
    C --> D{Found consistently\nin sick hosts only?}
    D -->|No — also in healthy hosts| E[Commensal or incidental finding\nNot causative agent\nSearch continues]
    D -->|Yes — strong association| F[POSTULATE 2 — Isolation\nGrow organism in PURE culture\nFree from host tissue\nSeparate from other microbes]
    F --> G{Successfully\ncultured?}
    G -->|Cannot culture — obligate intracellular\nor VBNC state| H[Molecular Koch's postulates\nMekalanos 1996\nSequence in diseased tissue\nAbsent in healthy tissue\nVirulence gene knockouts]
    G -->|Pure culture obtained| I[POSTULATE 3 — Inoculation\nIntroduce pure culture into\nHEALTHY susceptible host\nAnimal model or volunteer]
    I --> J{Same disease\nreproduced?}
    J -->|No — not pathogenic\nin this host| K[Host specificity issue\nor wrong host model\nReassess organism]
    J -->|Yes — disease confirmed| L[POSTULATE 4 — Re-isolation\nRecover organism from\nexperimentally diseased host\nCulture again — compare]
    L --> M{Identical to\noriginal isolate?}
    M -->|No — contamination or\ndifferent organism| E
    M -->|Yes — causal link confirmed| N[✅ Organism confirmed as\ncausative agent of disease\nRobert Koch — TB 1882\nAnthrax 1876 — Cholera 1883]
    N --> O[Modern extensions\nMolecular epidemiology\nWhole genome sequencing\nMetagenomics for unculturable pathogens]
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style N fill:#0c3044,stroke:#00F5D4,color:#e0f7f4`,

  "aseptic-technique-protocol": `flowchart TD
    A([Laboratory session begins]) --> B[Personal protective equipment\nGloves + lab coat required\nMask + eye protection if aerosols]
    B --> C[Prepare workspace\nClear bench — 70% ethanol wipe\nAllow 2 minutes contact time]
    C --> D[Organize all materials\nBEFORE opening any containers\nLabel tubes and plates first]
    D --> E{Work environment?}
    E -->|Open bench — non-BSC| F[Flame inoculating loop\nBunsen burner until red-hot\nCool in sterile agar before use]
    E -->|Biosafety cabinet BSC| G[Turn on BSC 10 min before use\nWork 15 cm from front edge\nNo lateral arm sweep movements]
    E -->|Laminar flow hood| H[Sterile techniques for\nnon-hazardous materials\nMedia preparation filtration]
    F --> I[Tube or flask transfer]
    G --> I
    H --> I
    I --> J[Hold container at 45° angle\nFlame mouth before AND after\nMinimize opening duration < 3s]
    J --> K[Transfer specimen / inoculum\nAvoid talking coughing sneezing\nover open cultures]
    K --> L[Immediately re-cap / re-cork\nLabel: date + organism + initials\n+ incubation conditions]
    L --> M[Incubate at correct conditions\nTemperature humidity CO2 if needed]
    M --> N{Check at 18–24 hours\nfor contamination}
    N -->|Contamination detected\nfuzzy growth wrong color| O[Place in biohazard waste bag\nAutoclave before disposal\nDocument and repeat]
    N -->|Clean growth\nas expected| P[✅ Aseptic technique successful\nProceed with experiment]
    O --> A
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style P fill:#0c3044,stroke:#00F5D4,color:#e0f7f4`,

  "sterilization-methods-comparison": `flowchart TD
    A([Item requiring\nsterilization or disinfection]) --> B{What is the\nmaterial?}
    B -->|Surgical instruments\nmetal glass wrapped goods| C[Moist Heat — Autoclave\n121°C / 15 psi / 15–20 min\nor 134°C / 3 min flash]
    B -->|Heat-sensitive devices\nendoscopes catheters| D{Moisture\ntolerant?}
    B -->|Liquids — media\nor biologics| E[Filtration\n0.22 μm membrane\nRemoves bacteria + fungi\n0.1 μm removes mycoplasma]
    B -->|Environmental surfaces| F[Chemical disinfection\n10% bleach — broad spectrum\n70% ethanol — vegetative bacteria\nQuaternary ammonium — skin]
    C --> C1[Validation: Biological indicator\nGeobacillus stearothermophilus spores\n6-log reduction required]
    D -->|No — completely dry| G[Ethylene Oxide — EtO gas\n29–65°C / 2–6 hours\nHighly penetrating\nAerate 8–12h after — toxic]
    D -->|Yes — moisture OK| H[Hydrogen Peroxide Plasma\nSterrad system\n<50°C — safe for electronics\nNo toxic residue]
    D -->|Radiation compatible| I[Gamma Irradiation\n25 kGy dose\nFree radical DNA damage\nSingle-use device manufacturing]
    E --> E1[Cannot remove viruses\nor prions with 0.22 μm\nUse heat or additional steps]
    G --> G1[Monitor: chemical + biological\nindicators per load\nEtO banned in some regions]
    H --> H1[Short cycle 28–75 min\nWrapped instruments OK\nNo lumen restriction < 1 mm]
    I --> I1[Cold process — no heat\nBulk manufacturing only\nRegulated dose verification]
    C1 --> J[✅ Sterility achieved\nDocument each cycle\nMaintain sterilization records]
    G1 --> J
    H1 --> J
    I1 --> J
    E1 --> J
    style A fill:#0c3044,stroke:#00F5D4,color:#e0f7f4
    style J fill:#0c3044,stroke:#00F5D4,color:#e0f7f4`,
};

// ── Wikimedia Commons API helper ──────────────────────────────────────────────
async function resolveWikimediaUrl(filename: string): Promise<string | null> {
  try {
    const apiUrl =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&titles=File:${encodeURIComponent(filename)}` +
      `&prop=imageinfo&iiprop=url&format=json`;

    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "MicrobeVault/1.0 (educational database; fix-data script)" },
    });
    if (!res.ok) return null;

    const data = await res.json() as {
      query: { pages: Record<string, { missing?: string; imageinfo?: { url: string }[] }> };
    };

    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    if (!page || "missing" in page) return null;

    return page.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== MicrobeVault fix-data ===\n");

  // ── 1. Fix microbe images ─────────────────────────────────────────────────
  console.log("▶ Fetching all microbes from database…");
  const microbes = await prisma.microbe.findMany({ select: { id: true, slug: true, scientificName: true } });
  console.log(`  Found ${microbes.length} microbes.\n`);

  let imageFixed = 0;
  let imageFailed = 0;

  for (const microbe of microbes) {
    const primaryFile = SLUG_TO_FILE[microbe.slug];
    if (!primaryFile) {
      console.log(`  ⚠  No file mapping for slug: ${microbe.slug} — skipping`);
      continue;
    }

    const filesToTry = [primaryFile, ...(FALLBACK_FILES[microbe.slug] ?? [])];
    let resolvedUrl: string | null = null;

    for (const filename of filesToTry) {
      process.stdout.write(`  Checking ${microbe.slug} → "${filename}" … `);
      resolvedUrl = await resolveWikimediaUrl(filename);
      if (resolvedUrl) {
        console.log("✓");
        break;
      } else {
        console.log("✗ not found");
      }
      await sleep(200); // be polite to Wikimedia API
    }

    if (resolvedUrl) {
      await prisma.microbe.update({ where: { id: microbe.id }, data: { imageUrl: resolvedUrl } });
      imageFixed++;
    } else {
      // Keep using the Special:FilePath fallback URL (will follow redirect in browser)
      const fallbackUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(primaryFile)}`;
      await prisma.microbe.update({ where: { id: microbe.id }, data: { imageUrl: fallbackUrl } });
      console.log(`  ↩  ${microbe.slug} kept as Special:FilePath redirect fallback`);
      imageFailed++;
    }

    await sleep(100);
  }

  console.log(`\n  Images: ${imageFixed} resolved via API, ${imageFailed} kept as redirect fallback.\n`);

  // ── 2. Fix flowchart mermaid codes ─────────────────────────────────────────
  console.log("▶ Updating flowchart mermaid codes…");
  const flowcharts = await prisma.flowchart.findMany({ select: { id: true, slug: true, title: true } });
  console.log(`  Found ${flowcharts.length} flowcharts.\n`);

  let fcFixed = 0;
  for (const fc of flowcharts) {
    const mermaidCode = FLOWCHART_MERMAID[fc.slug];
    if (!mermaidCode) {
      console.log(`  ⚠  No mermaid update for flowchart slug: ${fc.slug}`);
      continue;
    }
    await prisma.flowchart.update({
      where: { id: fc.id },
      data: { mermaidCode },
    });
    console.log(`  ✓  ${fc.slug}`);
    fcFixed++;
  }

  console.log(`\n  Flowcharts updated: ${fcFixed}/${flowcharts.length}\n`);
  console.log("=== Done ===");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
