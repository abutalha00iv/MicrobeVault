export type SearchCategory = "microbe" | "disease" | "flowchart" | "timeline";

export type SearchSuggestion = {
  id: string;
  title: string;
  slug: string;
  category: SearchCategory;
  descriptor?: string | null;
  excerpt?: string | null;
};

export type TaxonomyNode = {
  label: string;
  level: string;
  count?: number;
  children?: TaxonomyNode[];
};

export type FlowchartNodeDescription = Record<string, string>;

export type AIResultCandidate = {
  slug?: string;
  name: string;
  score: number;
  reasoning: string;
  diseaseSlug?: string;
  diseaseName?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

