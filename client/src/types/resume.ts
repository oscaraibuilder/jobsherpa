export interface ResumeContactInfo {
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
}

export interface ResumeExperience {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  details?: string[];
}

export interface ResumeSkillGroup {
  label: string;
  items: string[];
}

export interface ResumeHighlightSection {
  title: string;
  bullets: string[];
}

export interface ResumeProjectOrCourse {
  title: string;
  subtitle?: string;
  description?: string;
}

export type ResumeTemplateKey =
  | "classic-sidebar"
  | "modern-tech"
  | "corporate-finance"
  | "creative-portfolio"
  | "clinical-academic";

export interface ResumeData {
  contact: ResumeContactInfo;
  summary?: string;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  skillGroups: ResumeSkillGroup[];
  highlights: ResumeHighlightSection[];
  coursesOrCerts?: ResumeProjectOrCourse[];
  extraSections?: ResumeHighlightSection[];
  targetRoleTitle?: string;
  templateKey: ResumeTemplateKey;
}

export interface ResumeTemplateInfo {
  key: ResumeTemplateKey;
  name: string;
  description: string;
  category: string;
}

export const RESUME_TEMPLATES: ResumeTemplateInfo[] = [
  {
    key: "classic-sidebar",
    name: "Classic Sidebar",
    description: "Traditional layout with a colored sidebar for contact and skills. Great for creative and product roles.",
    category: "Creative",
  },
  {
    key: "modern-tech",
    name: "Modern Tech",
    description: "Clean, modern design with emphasis on achievements and technical skills. Perfect for tech and engineering roles.",
    category: "Technology",
  },
  {
    key: "corporate-finance",
    name: "Corporate Finance",
    description: "Professional, structured layout ideal for finance, consulting, and business roles.",
    category: "Business",
  },
  {
    key: "creative-portfolio",
    name: "Creative Portfolio",
    description: "Bold, visual design with project highlights. Perfect for marketing, design, and creative roles.",
    category: "Creative & Marketing",
  },
  {
    key: "clinical-academic",
    name: "Clinical Academic",
    description: "Detailed format for clinical, research, and academic positions. Emphasizes credentials and publications.",
    category: "Healthcare & Research",
  },
];

export function getDefaultResumeData(templateKey: ResumeTemplateKey): ResumeData {
  return {
    contact: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
    },
    summary: "",
    experiences: [],
    education: [],
    skillGroups: [],
    highlights: [],
    coursesOrCerts: [],
    extraSections: [],
    targetRoleTitle: "",
    templateKey,
  };
}
