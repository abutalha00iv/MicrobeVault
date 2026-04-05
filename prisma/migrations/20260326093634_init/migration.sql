-- CreateEnum
CREATE TYPE "GramStain" AS ENUM ('positive', 'negative', 'variable', 'unknown');

-- CreateEnum
CREATE TYPE "Morphology" AS ENUM ('cocci', 'bacilli', 'spirochete', 'coccobacilli', 'vibrio', 'filamentous', 'pleomorphic', 'helical', 'spherical', 'amoeboid', 'irregular', 'unknown');

-- CreateEnum
CREATE TYPE "OxygenRequirement" AS ENUM ('aerobic', 'anaerobic', 'facultative', 'microaerophilic', 'aerotolerant', 'unknown');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('commensal', 'mutualistic', 'parasitic', 'saprophytic', 'predation');

-- CreateEnum
CREATE TYPE "DiseaseSeverity" AS ENUM ('mild', 'moderate', 'severe', 'critical');

-- CreateEnum
CREATE TYPE "DiseaseRole" AS ENUM ('primary_cause', 'secondary', 'opportunistic');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('SEM', 'light', 'fluorescence', 'illustration', 'life_cycle');

-- CreateEnum
CREATE TYPE "FlowchartCategory" AS ENUM ('gram_staining', 'metabolic', 'id_algorithm', 'infection_pathway', 'antibiotic_resistance', 'life_cycle', 'ecological');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('discovery', 'epidemic', 'treatment', 'research_milestone');

-- CreateEnum
CREATE TYPE "ReferenceSourceType" AS ENUM ('journal_article', 'book', 'ncbi', 'who', 'cdc', 'textbook', 'wikipedia', 'news', 'other');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "microbes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,
    "description_short" TEXT NOT NULL,
    "description_long" TEXT NOT NULL,
    "overview_html" TEXT,
    "discovery_year" INTEGER,
    "discovered_by" TEXT,
    "discovery_context" TEXT,
    "gram_stain" "GramStain",
    "morphology" "Morphology",
    "size_um" TEXT,
    "motility" BOOLEAN,
    "spore_forming" BOOLEAN,
    "oxygen_requirement" "OxygenRequirement",
    "temperature_range" TEXT,
    "ph_range" TEXT,
    "habitat" TEXT,
    "is_infectious" BOOLEAN NOT NULL DEFAULT false,
    "is_dangerous" BOOLEAN NOT NULL DEFAULT false,
    "bsl_level" INTEGER,
    "is_beneficial" BOOLEAN NOT NULL DEFAULT false,
    "benefit_description" TEXT,
    "harm_description" TEXT,
    "ecological_role" TEXT,
    "relationship_type" "RelationshipType",
    "ncbi_taxonomy_id" INTEGER,
    "ncbi_last_fetched" TIMESTAMP(3),
    "image_url" TEXT,
    "synonyms" JSONB,
    "kingdom_label" TEXT,
    "cell_wall" TEXT,
    "reproduction_method" TEXT,
    "metabolic_type" TEXT,
    "growth_conditions" TEXT,
    "colonial_morphology" TEXT,
    "special_structures" JSONB,
    "phylogenetic_position" TEXT,
    "notable_relatives" JSONB,
    "research_milestones" JSONB,
    "historical_significance" TEXT,
    "named_after" TEXT,
    "host_organisms" JSONB,
    "role_in_microbiome" TEXT,
    "interactions" JSONB,
    "pathogenesis_mechanism" TEXT,
    "virulence_factors" JSONB,
    "antibiotic_profile" TEXT,
    "treatment_options" TEXT,
    "prevention_methods" TEXT,
    "biosafety_explanation" TEXT,
    "biotech_applications" TEXT,
    "food_industry_uses" TEXT,
    "environmental_uses" TEXT,
    "pharmaceutical_uses" TEXT,
    "random_facts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "microbes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxonomy" (
    "id" TEXT NOT NULL,
    "microbe_id" TEXT NOT NULL,
    "domain" TEXT,
    "kingdom" TEXT,
    "phylum" TEXT,
    "class" TEXT,
    "order" TEXT,
    "family" TEXT,
    "genus" TEXT,
    "species" TEXT,
    "strain" TEXT,
    "common_classification" TEXT,

    CONSTRAINT "taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diseases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "overview_html" TEXT,
    "icd10_code" TEXT,
    "body_system" TEXT NOT NULL,
    "severity" "DiseaseSeverity" NOT NULL,
    "transmission_route" TEXT,
    "incubation_period" TEXT,
    "symptoms" JSONB,
    "treatment" TEXT,
    "mortality_rate" DOUBLE PRECISION,
    "is_endemic" BOOLEAN NOT NULL DEFAULT false,
    "is_epidemic" BOOLEAN NOT NULL DEFAULT false,
    "pathogenesis" TEXT,
    "diagnosis_methods" TEXT,
    "management" TEXT,
    "prevention" TEXT,
    "vaccines" TEXT,
    "distribution_regions" JSONB,
    "outbreak_timeline" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microbe_diseases" (
    "microbe_id" TEXT NOT NULL,
    "disease_id" TEXT NOT NULL,
    "role" "DiseaseRole" NOT NULL,

    CONSTRAINT "microbe_diseases_pkey" PRIMARY KEY ("microbe_id","disease_id")
);

-- CreateTable
CREATE TABLE "microbe_images" (
    "id" TEXT NOT NULL,
    "microbe_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "caption" TEXT,
    "source_credit" TEXT,
    "alt_text" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "microbe_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microbe_videos" (
    "id" TEXT NOT NULL,
    "microbe_id" TEXT NOT NULL,
    "youtube_video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel_title" TEXT,
    "duration" TEXT,
    "thumbnail_url" TEXT,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "microbe_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flowcharts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FlowchartCategory" NOT NULL,
    "svg_content" TEXT NOT NULL,
    "mermaid_code" TEXT,
    "pdf_url" TEXT,
    "node_descriptions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flowcharts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ncbi_data" (
    "id" TEXT NOT NULL,
    "microbe_id" TEXT NOT NULL,
    "taxonomy_json" JSONB NOT NULL,
    "sequence_summary" TEXT,
    "gene_count" INTEGER,
    "genbank_count" INTEGER,
    "pubmed_count" INTEGER,
    "sra_count" INTEGER,
    "genome_assemblies" INTEGER,
    "pubmed_abstracts" JSONB,
    "last_fetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ncbi_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "microbe_id" TEXT,
    "disease_id" TEXT,
    "event_type" "EventType" NOT NULL,
    "significance" TEXT,
    "discoverers" TEXT,
    "country" TEXT,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "journal_or_publisher" TEXT,
    "year" INTEGER,
    "doi" TEXT,
    "url" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "source_type" "ReferenceSourceType" NOT NULL,
    "topic" TEXT,
    "accessed_date" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "added_by_admin" TEXT,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microbe_references" (
    "microbe_id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "context_note" TEXT,

    CONSTRAINT "microbe_references_pkey" PRIMARY KEY ("microbe_id","reference_id")
);

-- CreateTable
CREATE TABLE "disease_references" (
    "disease_id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "context_note" TEXT,

    CONSTRAINT "disease_references_pkey" PRIMARY KEY ("disease_id","reference_id")
);

-- CreateTable
CREATE TABLE "flowchart_references" (
    "flowchart_id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "context_note" TEXT,

    CONSTRAINT "flowchart_references_pkey" PRIMARY KEY ("flowchart_id","reference_id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "microbes_slug_key" ON "microbes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "microbes_scientific_name_key" ON "microbes"("scientific_name");

-- CreateIndex
CREATE INDEX "microbes_kingdom_label_idx" ON "microbes"("kingdom_label");

-- CreateIndex
CREATE INDEX "microbes_is_dangerous_is_beneficial_idx" ON "microbes"("is_dangerous", "is_beneficial");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_microbe_id_key" ON "taxonomy"("microbe_id");

-- CreateIndex
CREATE INDEX "taxonomy_kingdom_phylum_class_order_family_genus_idx" ON "taxonomy"("kingdom", "phylum", "class", "order", "family", "genus");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_name_key" ON "diseases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_slug_key" ON "diseases"("slug");

-- CreateIndex
CREATE INDEX "diseases_body_system_severity_idx" ON "diseases"("body_system", "severity");

-- CreateIndex
CREATE INDEX "microbe_images_microbe_id_idx" ON "microbe_images"("microbe_id");

-- CreateIndex
CREATE INDEX "microbe_videos_microbe_id_idx" ON "microbe_videos"("microbe_id");

-- CreateIndex
CREATE UNIQUE INDEX "flowcharts_slug_key" ON "flowcharts"("slug");

-- CreateIndex
CREATE INDEX "flowcharts_category_idx" ON "flowcharts"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ncbi_data_microbe_id_key" ON "ncbi_data"("microbe_id");

-- CreateIndex
CREATE INDEX "timeline_events_year_event_type_idx" ON "timeline_events"("year", "event_type");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "references_doi_key" ON "references"("doi");

-- CreateIndex
CREATE INDEX "references_source_type_year_idx" ON "references"("source_type", "year");

-- CreateIndex
CREATE INDEX "activity_logs_admin_id_created_at_idx" ON "activity_logs"("admin_id", "created_at");

-- AddForeignKey
ALTER TABLE "taxonomy" ADD CONSTRAINT "taxonomy_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microbe_diseases" ADD CONSTRAINT "microbe_diseases_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "diseases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microbe_diseases" ADD CONSTRAINT "microbe_diseases_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microbe_images" ADD CONSTRAINT "microbe_images_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microbe_videos" ADD CONSTRAINT "microbe_videos_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ncbi_data" ADD CONSTRAINT "ncbi_data_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "diseases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "references" ADD CONSTRAINT "references_added_by_admin_fkey" FOREIGN KEY ("added_by_admin") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microbe_references" ADD CONSTRAINT "microbe_references_microbe_id_fkey" FOREIGN KEY ("microbe_id") REFERENCES "microbes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microbe_references" ADD CONSTRAINT "microbe_references_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disease_references" ADD CONSTRAINT "disease_references_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "diseases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disease_references" ADD CONSTRAINT "disease_references_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_references" ADD CONSTRAINT "flowchart_references_flowchart_id_fkey" FOREIGN KEY ("flowchart_id") REFERENCES "flowcharts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_references" ADD CONSTRAINT "flowchart_references_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
