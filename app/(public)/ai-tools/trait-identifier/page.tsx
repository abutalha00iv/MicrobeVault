import { AIToolLayout } from "@/components/AIToolLayout";
import { TraitIdentifierClient } from "@/components/ai/TraitIdentifierClient";

export default function TraitIdentifierPage() {
  return (
    <AIToolLayout
      activeHref="/ai-tools/trait-identifier"
      title="Trait-Based Microbe Identifier"
      description="Submit structured phenotypic observations and compare them against exact database filters plus Claude reasoning over likely matches."
    >
      <TraitIdentifierClient />
    </AIToolLayout>
  );
}

