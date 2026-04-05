import { readFileSync, writeFileSync } from 'fs';

const existing = JSON.parse(readFileSync('c:/Users/User/OneDrive/Desktop/MicrobeVault/prisma/microbes_full.json', 'utf-8'));
const existingSlugs = new Set(existing.map(e => e.slug));

const content = readFileSync('c:/Users/User/OneDrive/Desktop/MicrobeVault/prisma/seed-data.ts', 'utf-8');
const start = content.indexOf('export const ADDITIONAL_MICROBE_SEEDS');
const end = content.indexOf('\nexport const FLOWCHART_SEEDS');
const section = content.slice(start, end);
const lines = section.split('\n');

const removeSet = new Set([
  'neisseria-gonorrhoeae','treponema-pallidum','borrelia-burgdorferi','pseudomonas-aeruginosa',
  'klebsiella-pneumoniae','mrsa','nitrosomonas-europaea','rhizobium-leguminosarum',
  'cryptococcus-neoformans','trichophyton-rubrum','histoplasma-capsulatum','coccidioides-immitis',
  'rabies-virus','hepatitis-b-virus','herpes-simplex-virus-1','poliovirus','variola-virus',
  'bacteriophage-t4','halobacterium-salinarum','thermococcus-kodakarensis','sulfolobus-acidocaldarius',
  'trypanosoma-brucei','entamoeba-histolytica','giardia-lamblia','leishmania-donovani',
  'chlamydomonas-reinhardtii','prochlorococcus-marinus','scrapie-prion'
]);

const newEntries = [];
for (const line of lines) {
  if (!line.trim().startsWith('{ slug:')) continue;
  const slugMatch = line.match(/slug: "([^"]+)"/);
  if (!slugMatch || !removeSet.has(slugMatch[1])) continue;
  if (existingSlugs.has(slugMatch[1])) continue;

  const g = (key) => { const r = new RegExp(key + ': "([^"]+)"'); const m = line.match(r); return m ? m[1] : null; };
  const gb = (key) => { const r = new RegExp(key + ': (true|false)'); const m = line.match(r); return m ? m[1] === 'true' : false; };
  const gn = (key) => { const r = new RegExp(key + ': (\d+)'); const m = line.match(r); return m ? parseInt(m[1]) : null; };

  const taxStr = line.match(/taxonomy: \{([^}]+)\}/)?.[1] || '';
  const tg = (k) => { const r = new RegExp(k + ': "([^"]+)"'); const m = taxStr.match(r); return m ? m[1] : ''; };

  const disSlugMatch = line.match(/diseaseSlugs: \[([^\]]*)\]/);
  const diseaseSlugs = disSlugMatch && disSlugMatch[1].trim()
    ? disSlugMatch[1].split(',').map(s => s.trim().replace(/"/g, ''))
    : [];

  newEntries.push({
    slug: slugMatch[1],
    commonName: g('commonName'),
    scientificName: g('scientificName'),
    kingdomLabel: g('kingdomLabel'),
    taxonomy: {
      domain: tg('domain'), kingdom: tg('kingdom'), phylum: tg('phylum'),
      taxClass: tg('taxClass'), order: tg('order'), family: tg('family'),
      genus: tg('genus'), species: tg('species'), commonClassification: tg('commonClassification')
    },
    discoveryYear: gn('discoveryYear'),
    discoveredBy: g('discoveredBy'),
    discoveryContext: g('discoveryContext'),
    gramStain: g('gramStain'),
    morphology: g('morphology'),
    oxygenRequirement: g('oxygenRequirement'),
    habitat: g('habitat'),
    ecologicalRole: g('ecologicalRole'),
    relationshipType: g('relationshipType'),
    isDangerous: gb('isDangerous'),
    isBeneficial: gb('isBeneficial'),
    diseaseSlugs,
    imageFile: g('imageFile'),
    ncbiTaxonomyId: gn('ncbiTaxonomyId')
  });
}

console.log('Adding new entries:', newEntries.map(e => e.slug));
const merged = [...existing, ...newEntries];
console.log('Total:', merged.length);
writeFileSync('c:/Users/User/OneDrive/Desktop/MicrobeVault/prisma/microbes_full.json', JSON.stringify(merged, null, 2), 'utf-8');
console.log('microbes_full.json written OK');
