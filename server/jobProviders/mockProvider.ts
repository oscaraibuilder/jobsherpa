import type { InsertScoutJob } from "@shared/schema";
import type { BaseJobProvider, FetchedJob, JobProviderResult, JobSearchParams } from "./types";

const MOCK_COMPANIES = [
  { name: "TechCorp", industry: "Technology", logoUrl: null },
  { name: "DataFlow Systems", industry: "Data & Analytics", logoUrl: null },
  { name: "CloudNine Solutions", industry: "Cloud Computing", logoUrl: null },
  { name: "FinanceHub", industry: "Financial Services", logoUrl: null },
  { name: "HealthTech Innovations", industry: "Healthcare Technology", logoUrl: null },
  { name: "RetailMax", industry: "E-commerce", logoUrl: null },
  { name: "GreenEnergy Corp", industry: "Clean Energy", logoUrl: null },
  { name: "MediaWorks", industry: "Media & Entertainment", logoUrl: null },
  { name: "SecureNet", industry: "Cybersecurity", logoUrl: null },
  { name: "AutoDrive Systems", industry: "Automotive Technology", logoUrl: null },
];

const MOCK_LOCATIONS = [
  { city: "San Francisco", state: "CA", country: "US", remote: "hybrid" },
  { city: "New York", state: "NY", country: "US", remote: "onsite" },
  { city: "Austin", state: "TX", country: "US", remote: "hybrid" },
  { city: "Seattle", state: "WA", country: "US", remote: "remote" },
  { city: "Boston", state: "MA", country: "US", remote: "hybrid" },
  { city: "Denver", state: "CO", country: "US", remote: "remote" },
  { city: "Chicago", state: "IL", country: "US", remote: "onsite" },
  { city: "Los Angeles", state: "CA", country: "US", remote: "hybrid" },
  { city: "Remote", state: "", country: "US", remote: "remote" },
  { city: "Atlanta", state: "GA", country: "US", remote: "hybrid" },
];

const TITLE_VARIATIONS: Record<string, string[]> = {
  "software engineer": [
    "Software Engineer",
    "Software Developer",
    "Full Stack Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Software Engineer II",
    "Senior Software Engineer",
  ],
  "product manager": [
    "Product Manager",
    "Senior Product Manager",
    "Associate Product Manager",
    "Technical Product Manager",
    "Product Manager, Growth",
  ],
  "data scientist": [
    "Data Scientist",
    "Senior Data Scientist",
    "Machine Learning Engineer",
    "Data Analyst",
    "Applied Scientist",
  ],
  "ux designer": [
    "UX Designer",
    "Product Designer",
    "UI/UX Designer",
    "Senior UX Designer",
    "Design Lead",
  ],
  "project manager": [
    "Project Manager",
    "Technical Project Manager",
    "Program Manager",
    "Senior Project Manager",
    "IT Project Manager",
  ],
  "devops engineer": [
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Cloud Engineer",
    "Infrastructure Engineer",
  ],
  default: [
    "Software Engineer",
    "Product Manager",
    "Data Analyst",
    "Business Analyst",
    "Operations Manager",
  ],
};

const SENIORITY_LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead", "Principal", "Staff"];

function generateDescription(title: string, company: string, location: string): string {
  const responsibilities = [
    "Design and implement scalable solutions",
    "Collaborate with cross-functional teams",
    "Write clean, maintainable code",
    "Participate in code reviews",
    "Mentor junior team members",
    "Drive technical architecture decisions",
    "Contribute to product roadmap",
    "Optimize system performance",
  ];
  
  const requirements = [
    "3+ years of relevant experience",
    "Strong communication skills",
    "Experience with modern frameworks",
    "Problem-solving mindset",
    "Bachelor's degree in related field",
    "Experience with agile methodologies",
    "Track record of delivering projects",
  ];
  
  const benefits = [
    "Competitive salary and equity",
    "Comprehensive health benefits",
    "Flexible work arrangements",
    "Professional development budget",
    "401(k) matching",
    "Generous PTO policy",
  ];
  
  const shuffledResp = responsibilities.sort(() => Math.random() - 0.5).slice(0, 4);
  const shuffledReqs = requirements.sort(() => Math.random() - 0.5).slice(0, 4);
  const shuffledBenefits = benefits.sort(() => Math.random() - 0.5).slice(0, 3);
  
  return `
## About ${company}

We're looking for a ${title} to join our team in ${location}. This is an exciting opportunity to make a significant impact at a growing company.

## Responsibilities

${shuffledResp.map(r => `- ${r}`).join("\n")}

## Requirements

${shuffledReqs.map(r => `- ${r}`).join("\n")}

## Benefits

${shuffledBenefits.map(b => `- ${b}`).join("\n")}

## How to Apply

Click the Apply button to submit your application. We review all applications and will reach out if there's a good fit.
  `.trim();
}

function generateSalary(): { min: number; max: number } {
  const baseMin = Math.floor(Math.random() * 80000) + 70000;
  const range = Math.floor(Math.random() * 50000) + 20000;
  return { min: baseMin, max: baseMin + range };
}

function matchesTitleSearch(jobTitle: string, searchTitles: string[]): boolean {
  const normalizedJobTitle = jobTitle.toLowerCase();
  return searchTitles.some(searchTitle => {
    const normalized = searchTitle.toLowerCase();
    return normalizedJobTitle.includes(normalized) || 
           normalized.split(" ").some(word => normalizedJobTitle.includes(word));
  });
}

function matchesLocationSearch(jobLocation: string, searchLocations: string[]): boolean {
  if (searchLocations.length === 0) return true;
  const normalizedJobLocation = jobLocation.toLowerCase();
  return searchLocations.some(searchLoc => {
    const normalized = searchLoc.toLowerCase();
    return normalizedJobLocation.includes(normalized) || 
           normalized === "remote" && normalizedJobLocation.includes("remote");
  });
}

export class MockProvider implements BaseJobProvider {
  name = "MockProvider";
  sourceId?: string;
  
  initialize(sourceId: string): void {
    this.sourceId = sourceId;
  }
  
  async search(params: JobSearchParams): Promise<JobProviderResult> {
    const limit = params.limit || 20;
    const jobs: FetchedJob[] = [];
    
    const titleKey = params.titles[0]?.toLowerCase() || "default";
    const titleVariations = TITLE_VARIATIONS[titleKey] || TITLE_VARIATIONS.default;
    
    for (let i = 0; i < limit * 2 && jobs.length < limit; i++) {
      const company = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
      const location = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
      const titleVariation = titleVariations[Math.floor(Math.random() * titleVariations.length)];
      const seniority = SENIORITY_LEVELS[Math.floor(Math.random() * SENIORITY_LEVELS.length)];
      const salary = generateSalary();
      
      const locationString = location.city === "Remote" 
        ? "Remote, US" 
        : `${location.city}, ${location.state}`;
      
      if (!matchesTitleSearch(titleVariation, params.titles)) continue;
      if (!matchesLocationSearch(locationString, params.locations)) continue;
      if (params.remoteStatus && params.remoteStatus !== "any" && location.remote !== params.remoteStatus) continue;
      
      const postedDaysAgo = Math.floor(Math.random() * 14);
      const postedAt = new Date();
      postedAt.setDate(postedAt.getDate() - postedDaysAgo);
      
      jobs.push({
        externalId: `mock-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        title: titleVariation,
        company: company.name,
        locationRaw: locationString,
        normalizedLocation: locationString,
        remoteStatus: location.remote,
        employmentType: "Full-time",
        seniority,
        industries: [company.industry],
        salaryMin: salary.min,
        salaryMax: salary.max,
        salaryCurrency: "USD",
        jobUrl: `https://example.com/jobs/${company.name.toLowerCase().replace(/\s+/g, "-")}/${titleVariation.toLowerCase().replace(/\s+/g, "-")}`,
        applyUrl: `https://example.com/apply/${Math.random().toString(36).substr(2, 9)}`,
        companyUrl: `https://example.com/companies/${company.name.toLowerCase().replace(/\s+/g, "-")}`,
        logoUrl: company.logoUrl || undefined,
        descriptionRaw: generateDescription(titleVariation, company.name, locationString),
        postedAt,
        countryCode: location.country,
        city: location.city,
      });
    }
    
    return {
      jobs,
      hasMore: jobs.length === limit,
      total: jobs.length,
    };
  }
  
  toScoutJob(job: FetchedJob): InsertScoutJob {
    return {
      externalId: job.externalId,
      sourceId: this.sourceId || null,
      title: job.title,
      company: job.company,
      locationRaw: job.locationRaw || null,
      normalizedLocation: job.normalizedLocation || null,
      remoteStatus: job.remoteStatus || null,
      employmentType: job.employmentType || null,
      seniority: job.seniority || null,
      industries: job.industries || null,
      salaryMin: job.salaryMin || null,
      salaryMax: job.salaryMax || null,
      salaryCurrency: job.salaryCurrency || null,
      jobUrl: job.jobUrl,
      applyUrl: job.applyUrl || null,
      companyUrl: job.companyUrl || null,
      logoUrl: job.logoUrl || null,
      descriptionRaw: job.descriptionRaw,
      descriptionClean: job.descriptionClean || null,
      postedAt: job.postedAt || null,
      isActive: true,
      isRepost: false,
      ghostScore: null,
      filteredReason: null,
      countryCode: job.countryCode || null,
      city: job.city || null,
    };
  }
}
