import { Metadata } from "next";
import { BRAND_NAME, DESCRIPTION, TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About ${BRAND_NAME}`,
  description: DESCRIPTION
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[2rem] p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">About</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl text-white">
          {BRAND_NAME}: {TAGLINE}
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-300">
          <p>
            MicrobeVault brings microbiology encyclopedia content, disease reference material, live NCBI exploration,
            interactive flowcharts, and three guarded AI educational tools into one production-focused platform.
          </p>
          <p>
            The encyclopedia is organized around taxonomy, ecology, and clinical significance. Every microbe and disease
            page includes traceable references, source badges, and linkable citations so learners and professionals can
            audit where each claim came from.
          </p>
          <p>
            The AI tools are designed for educational support only. Trait-based identification, image analysis, and
            clinical pathogen ranking all include prominent disclaimers and should never replace laboratory confirmation
            or licensed medical judgment.
          </p>
          <p>
            The fastest way to use MicrobeVault is to start with the homepage search, then branch into encyclopedia
            browsing, disease cross-links, NCBI records, or flowcharts depending on the question you are trying to
            answer.
          </p>
        </div>
      </div>
    </div>
  );
}

