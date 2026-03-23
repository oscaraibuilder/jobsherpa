import type { InsertScoutJob } from "@shared/schema";

export interface JobSearchParams {
  titles: string[];
  locations: string[];
  remoteStatus?: "remote" | "hybrid" | "onsite" | "any";
  industries?: string[];
  minSalary?: number;
  maxSalary?: number;
  limit?: number;
}

export interface FetchedJob {
  externalId: string;
  title: string;
  company: string;
  locationRaw?: string;
  normalizedLocation?: string;
  remoteStatus?: string;
  employmentType?: string;
  seniority?: string;
  industries?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobUrl: string;
  applyUrl?: string;
  companyUrl?: string;
  logoUrl?: string;
  descriptionRaw: string;
  descriptionClean?: string;
  postedAt?: Date;
  countryCode?: string;
  city?: string;
}

export interface JobProviderResult {
  jobs: FetchedJob[];
  hasMore: boolean;
  total?: number;
}

export interface BaseJobProvider {
  name: string;
  sourceId?: string;
  
  initialize(sourceId: string): void;
  search(params: JobSearchParams): Promise<JobProviderResult>;
  toScoutJob(job: FetchedJob): InsertScoutJob;
}
