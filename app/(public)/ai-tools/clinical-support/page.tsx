import { AIToolLayout } from "@/components/AIToolLayout";
import { ClinicalSupportClient } from "@/components/ai/ClinicalSupportClient";

export default function ClinicalSupportPage() {
  return (
    <AIToolLayout
      activeHref="/ai-tools/clinical-support"
      title="Clinical Decision Support"
      description="Rank likely pathogens from patient age, symptoms, duration, body systems, exposures, and immune status while cross-referencing the MicrobeVault disease database."
    >
      <ClinicalSupportClient />
    </AIToolLayout>
  );
}
