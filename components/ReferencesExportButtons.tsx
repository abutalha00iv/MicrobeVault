"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";

function toBibTeX(reference: {
  id: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  journalOrPublisher?: string | null;
  doi?: string | null;
  url?: string | null;
}) {
  const key = reference.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `@article{${key},
  title = {${reference.title}},
  author = {${reference.authors || "Unknown"}},
  journal = {${reference.journalOrPublisher || "Unknown"}},
  year = {${reference.year || ""}},
  doi = {${reference.doi || ""}},
  url = {${reference.url || ""}}
}`;
}

export function ReferencesExportButtons({ references }: { references: any[] }) {
  const bibtex = references.map((reference) => toBibTeX(reference)).join("\n\n");

  const exportPdf = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    pdf.setFontSize(18);
    pdf.text("MicrobeVault References", 40, y);
    y += 28;
    pdf.setFontSize(10);

    references.forEach((reference, index) => {
      const line = `[${index + 1}] ${reference.authors || "Unknown author"} (${reference.year || "n.d."}). ${reference.title}. ${reference.journalOrPublisher || ""}`;
      const wrapped = pdf.splitTextToSize(line, 515);
      if (y + wrapped.length * 12 > 780) {
        pdf.addPage();
        y = 40;
      }
      pdf.text(wrapped, 40, y);
      y += wrapped.length * 12 + 8;
    });

    pdf.save("microbevault-references.pdf");
  };

  return (
    <div className="flex gap-3">
      <button type="button" onClick={exportPdf} className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan">
        <Download className="h-4 w-4" />
        Download PDF
      </button>
      <a
        href={`data:text/plain;charset=utf-8,${encodeURIComponent(bibtex)}`}
        download="microbevault-references.bib"
        className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
      >
        <Download className="h-4 w-4" />
        Download BibTeX
      </a>
    </div>
  );
}

