/**
 * download-images.ts — Run with: npx tsx prisma/download-images.ts
 *
 * Downloads every microbe's image into public/images/microbes/ and updates
 * the database to use the local path. Skips slugs that already have a local
 * path stored. Uses the Wikimedia Commons API to find correct URLs when the
 * stored URL is missing or a redirect.
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OUT_DIR = path.join(process.cwd(), "public", "images", "microbes");

// ── Best-known filenames per slug (with fallbacks) ────────────────────────────
const SLUG_FILES: Record<string, string[]> = {
  "staphylococcus-aureus":        ["Staphylococcus aureus 01.jpg"],
  "escherichia-coli":             ["EscherichiaColi NIAID.jpg", "Escherichia coli.jpg"],
  "mycobacterium-tuberculosis":   ["Mycobacterium tuberculosis Ziehl-Neelsen stain.jpg", "Mycobacterium tuberculosis (CDC-PHIL -5789) lores.jpg"],
  "bacillus-anthracis":           ["Bacillus anthracis.jpg"],
  "clostridium-botulinum":        ["Clostridium botulinum.jpg", "Clostridium botulinum 01.jpg"],
  "streptococcus-pyogenes":       ["Streptococcus pyogenes.jpg"],
  "helicobacter-pylori":          ["Helicobacter pylori 26695.jpg", "Helicobacter pylori.jpg"],
  "salmonella-typhi":             ["SalmonellaNIAID.jpg", "Salmonella typhimurium.jpg"],
  "vibrio-cholerae":              ["Vibrio cholerae.jpg", "Vibrio cholerae O1.jpg"],
  "yersinia-pestis":              ["Yersinia pestis.jpg", "Yersinia pestis fluorescent.jpg"],
  "lactobacillus-acidophilus":    ["Lactobacillus acidophilus TEM.jpg", "Lactobacillus acidophilus SEM.jpg", "Lactobacillus acidophilus.jpg"],
  "thermus-aquaticus":            ["Grand prismatic spring.jpg", "Thermus aquaticus YT-1.jpg"],
  "neisseria-gonorrhoeae":        ["Neisseria gonorrhoeae.jpg", "Neisseria gonorrhoeae PHIL 3693 lores.jpg"],
  "borrelia-burgdorferi":         ["Borrelia burgdorferi.jpg", "Borrelia burgdorferi 01.jpg", "Borrelia.jpg", "Lyme borreliosis borrelia.jpg"],
  "klebsiella-pneumoniae":        ["Klebsiella pneumoniae.jpg", "Klebsiella pneumoniae 01.jpg", "Klebsiella pneumoniae PHIL 2.jpg"],
  "mrsa":                         ["Staphylococcus aureus 01.jpg"],
  "nitrosomonas-europaea":        ["Nitrosomonas.jpg", "Nitrosomonas europaea.jpg", "Nitrosomonas europaea str. Schmidt.jpg"],
  "rhizobium-leguminosarum":      ["Rhizobium leguminosarum.jpg", "Rhizobium leguminosarum bv viciae 3841.jpg", "Rhizobium.jpg"],
  "treponema-pallidum":           ["Treponema pallidum.jpg", "Treponema pallidum 01.jpg", "Treponema pallidum EM.jpg"],
  "pseudomonas-aeruginosa":       ["Pseudomonas aeruginosa 01.jpg", "Pseudomonas aeruginosa bacteria.jpg", "Pseudomonas aeruginosa 02.jpg"],
  "candida-albicans":             ["Candida albicans.jpg", "CandidaAlbicans.jpg", "Candida albicans SEM.jpg"],
  "aspergillus-fumigatus":        ["Aspergillus fumigatus.jpg"],
  "saccharomyces-cerevisiae":     ["S cerevisiae under DIC microscopy.jpg", "Saccharomyces cerevisiae SEM.jpg"],
  "penicillium-notatum":          ["Penicillium chrysogenum.jpg", "Penicillium notatum.jpg"],
  "cryptococcus-neoformans":      ["Cryptococcus neoformans.jpg", "CryptococcusNeoformans.jpg", "Cryptococcus neoformans var. grubii CDC.jpg"],
  "trichophyton-rubrum":          ["Trichophyton rubrum.jpg", "Trichophyton rubrum PHIL 4924 lores.jpg", "Trichophyton rubrum2.jpg", "Trichophyton.jpg"],
  "histoplasma-capsulatum":       ["Histoplasma capsulatum.jpg", "Histoplasma capsulatum 01.jpg", "Histoplasma.jpg", "Histoplasma capsulatum yeast phase.jpg"],
  "coccidioides-immitis":         ["Coccidioides immitis.jpg", "Coccidioides immitis spherule.jpg"],
  "sars-cov-2":                   ["SARS-CoV-2 without background.png", "SARS-CoV-2.jpg"],
  "hiv-1":                        ["HIV-1 EM.jpg", "HIV budding Color.jpg", "HIV Virus.jpg", "HIV-Viren.jpg"],
  "influenza-a-h1n1":             ["Influenza A virus.jpg", "Influenza A virus - negative stain image TEM.JPG"],
  "ebola-virus":                  ["Ebola virus virions.jpg", "Ebola virus em.jpg", "Ebola Zaire virus.jpg"],
  "herpes-simplex-virus-1":       ["Herpes simplex virus.jpg", "Herpesvirus.jpg", "Herpes simplex virus TEM B82-0671 lores.jpg"],
  "poliovirus":                   ["Poliovirus.jpg", "Poliovirus capsid.jpg", "Polio EM PHIL 2099 lores.jpg", "Poliovirus replication.jpg"],
  "variola-virus":                ["Variola virus.jpg", "Smallpox virus virions EM PHIL 1849 lores.jpg", "Variola.jpg", "Smallpox virus.jpg"],
  "bacteriophage-t4":             ["T4 bacteriophage.jpg", "Bacteriophage T4.jpg", "Bacteriophage structure.jpg", "T-even phage.jpg", "Bacteriophage_T4_structure.png", "T4 phage.jpg"],
  "rabies-virus":                 ["Rabiesvirus.jpg", "Rabies virus EM PHIL 1140 lores.jpg", "Rabies lyssavirus.jpg", "Lyssavirus.jpg", "Rabies virus.jpg"],
  "hepatitis-b-virus":            ["Hepatitis B virions.jpg", "Hepatitis B Virus.jpg", "HBV virions.jpg", "Hepatitis B.jpg", "HBV.jpg"],
  "methanobrevibacter-smithii":   ["Methanobrevibacter smithii.jpg", "Methanobrevibacter smithii DSM 861.jpg", "Methanobrevibacter smithii MCS.jpg"],
  "halobacterium-salinarum":      ["Halobacterium salinarum.jpg", "Halobacterium salinarum NRC-1.jpg", "Halobacterium sp NRC-1.jpg", "Halobacterium halobium.jpg"],
  "thermococcus-kodakarensis":    ["Thermococcus kodakarensis.jpg", "Thermococcus kodakaraensis.jpg", "Thermococcus.jpg"],
  "sulfolobus-acidocaldarius":    ["Grand prismatic spring.jpg", "Sulfolobus acidocaldarius 2.jpg", "Sulfolobus.jpg"],
  "plasmodium-falciparum":        ["Plasmodium falciparum.jpg", "Plasmodium falciparum 01.jpg"],
  "toxoplasma-gondii":            ["Toxoplasma gondii.jpg", "Toxoplasma gondii tachy.jpg"],
  "entamoeba-histolytica":        ["Entamoeba histolytica.jpg", "Entamoeba histolytica 01.jpg"],
  "giardia-lamblia":              ["Giardia lamblia.jpg", "Giardia lamblia SEM 8698 lores.jpg"],
  "trypanosoma-brucei":           ["Trypanosoma brucei.jpg", "Trypanosoma brucei brucei Scan Electron Micrograph.jpg", "Trypanosoma brucei 1.jpg", "Trypanosoma.jpg", "Trypanosoma brucei brucei.jpg"],
  "leishmania-donovani":          ["Leishmania donovani.jpg", "Leishmania donovani 01.jpg", "Leishmania.jpg", "Leishmania donovani amastigotes.jpg"],
  "chlorella-vulgaris":           ["Green algae.jpg", "Chlorella vulgaris.jpg"],
  "chlamydomonas-reinhardtii":    ["Chlamydomonas reinhardtii.jpg", "Chlamydomonas TEM 09.jpg"],
  "prochlorococcus-marinus":      ["Prochlorococcus marinus.jpg", "Prochlorococcus.jpg"],
  "bse-prion":                    ["Prion Protein Structure.png", "Neuron.jpg"],
  "scrapie-prion":                ["Prion Protein Structure.png", "Neuron.jpg"],
};

// ── Wikimedia Commons API ──────────────────────────────────────────────────────
async function resolveCommonsFilename(filename: string): Promise<string | null> {
  try {
    const apiUrl =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&titles=File:${encodeURIComponent(filename)}` +
      `&prop=imageinfo&iiprop=url&format=json`;
    const data = await fetchJson(apiUrl);
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    if (!page || "missing" in page) return null;
    return page.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

// ── Commons full-text search fallback ────────────────────────────────────────
async function searchCommons(query: string): Promise<string | null> {
  try {
    const apiUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
      `&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json`;
    const data = await fetchJson(apiUrl);
    const results: { title: string }[] = data?.query?.search ?? [];
    for (const result of results) {
      // result.title is like "File:Foo.jpg"
      const filename = result.title.replace(/^File:/, "");
      const url = await resolveCommonsFilename(filename);
      await sleep(400);
      if (url) return url;
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveSlug(slug: string): Promise<string | null> {
  const filenames = SLUG_FILES[slug];
  if (filenames) {
    for (const filename of filenames) {
      const url = await resolveCommonsFilename(filename);
      await sleep(400);
      if (url) return url;
    }
  }
  // Fallback: search Commons using the slug as a query term
  const searchTerm = slug.replace(/-/g, " ");
  process.stdout.write(`(searching "${searchTerm}") `);
  return searchCommons(searchTerm + " microscopy");
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { "User-Agent": "MicrobeVault/1.0 (educational; download-images)" } }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

function downloadFile(url: string, dest: string, redirects = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (redirects > 10) return reject(new Error("Too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { "User-Agent": "MicrobeVault/1.0 (educational; download-images)" } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
        res.resume();
        return downloadFile(res.headers.location, dest, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
      file.on("error", (e) => { fs.unlink(dest, () => {}); reject(e); });
    }).on("error", reject);
  });
}

async function downloadWithRetry(url: string, dest: string, retries = 4): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await downloadFile(url, dest);
      return;
    } catch (err: any) {
      if (i === retries - 1) throw err;
      const wait = 5000 * (i + 1); // 5s, 10s, 15s
      process.stdout.write(`(wait ${wait / 1000}s) `);
      await sleep(wait);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== MicrobeVault download-images ===\n");
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const microbes = await prisma.microbe.findMany({
    select: { id: true, slug: true, scientificName: true, imageUrl: true },
  });
  console.log(`Found ${microbes.length} microbes.\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const microbe of microbes) {
    // Already using a local path — nothing to do
    if (microbe.imageUrl?.startsWith("/images/microbes/")) {
      // Check file actually exists on disk
      const localPath = path.join(process.cwd(), "public", microbe.imageUrl);
      if (fs.existsSync(localPath)) {
        console.log(`  [${microbe.slug}] Local ✓`);
        skipped++;
        continue;
      }
      // File missing — fall through to re-download
      console.log(`  [${microbe.slug}] Local path in DB but file missing — re-downloading`);
    }

    // Always resolve fresh via the Commons API (ensures we get the current URL,
    // avoids using stale/deleted stored URLs that would 404).
    process.stdout.write(`  [${microbe.slug}] Resolving via Commons API… `);
    const srcUrl = await resolveSlug(microbe.slug);
    if (!srcUrl) {
      console.log("not found — skipping");
      failed++;
      continue;
    }
    console.log(srcUrl.split("/").pop());

    // Determine extension
    const extMatch = srcUrl!.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const filename = `${microbe.slug}.${ext}`;
    const destPath = path.join(OUT_DIR, filename);
    const publicPath = `/images/microbes/${filename}`;

    // If file already on disk (e.g. from a previous run), just update DB
    if (fs.existsSync(destPath)) {
      await prisma.microbe.update({ where: { id: microbe.id }, data: { imageUrl: publicPath } });
      console.log(`  [${microbe.slug}] Already on disk → DB updated`);
      skipped++;
      continue;
    }

    process.stdout.write(`  [${microbe.slug}] Downloading… `);
    try {
      await downloadWithRetry(srcUrl!, destPath);
      await prisma.microbe.update({ where: { id: microbe.id }, data: { imageUrl: publicPath } });
      console.log(`✓  saved as ${filename}`);
      downloaded++;
    } catch (err: any) {
      console.log(`✗  ${err.message}`);
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      failed++;
    }

    await sleep(15000); // 15 s between downloads — respect Wikimedia rate limits
  }

  console.log(`\nDone! ${downloaded} downloaded, ${skipped} skipped, ${failed} failed.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
