import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: URLSearchParams;
};

export function Pagination({ page, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mt-10 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <Link
        href={page > 1 ? buildHref(page - 1) : "#"}
        aria-disabled={page <= 1}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Link>
      <p className="text-sm text-slate-300">
        Page {page} of {totalPages}
      </p>
      <Link
        href={page < totalPages ? buildHref(page + 1) : "#"}
        aria-disabled={page >= totalPages}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

