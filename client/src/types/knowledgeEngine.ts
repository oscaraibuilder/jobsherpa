export interface EducationEntry {
  id: string;
  schoolName: string;
  degree: string;
  startYear: string;
  endYear: string;
}

export interface IdentityProfile {
  fullName: string;
  headline: string;
  location: string;
  yearsExperience?: string;
  education?: EducationEntry[];
  workAuthorization?: string;
}

export interface WorkAchievement {
  id: string;
  text: string;
  impact?: string;
  metrics?: string;
}

export interface WorkRole {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  achievements: WorkAchievement[];
}

export type SkillCategory = "Technical" | "Tools" | "Domain" | "Soft";

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface CareerGoals {
  targetTitles: string[];
  targetIndustries: string[];
  targetLocations: string[];
  desiredLevel?: string;
  timeHorizon?: string;
}

export interface Preferences {
  salaryRange?: string;
  remotePreference?: "Remote" | "Hybrid" | "Onsite" | "Open";
  companySizePreference?: string;
  travelTolerance?: string;
  nonNegotiables: string[];
}

export type DocumentKind = "link" | "file";

export interface DocumentItem {
  id: string;
  kind: DocumentKind;
  label: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface DocumentLink {
  id: string;
  label: string;
  url?: string;
  fileName?: string;
}

export type BaseResumeSource = "linkedin" | "uploaded" | "scratch";

export interface BaseResumeInfo {
  source?: BaseResumeSource;
  resumeDocumentId?: string;
  resumeDocumentUrl?: string;
  resumeFileName?: string;
  notes?: string;
}

export interface CustomInstructions {
  tone?: string;
  region?: string;
  lengthPreference?: string;
  notes: string;
}

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  profileUrl?: string;
  lastSynced?: string;
  picture?: string;
  email?: string;
  locale?: { country?: string; language?: string };
}

export interface LinkedInPosition {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface LinkedInImportPayload {
  profile: {
    fullName: string;
    headline: string;
    location: string;
    summary?: string;
    yearsExperience?: string;
  };
  positions: LinkedInPosition[];
  skills: string[];
}

export interface KnowledgeEngineState {
  identity: IdentityProfile;
  workHistory: WorkRole[];
  skills: SkillItem[];
  goals: CareerGoals;
  preferences: Preferences;
  documents: DocumentItem[];
  instructions: CustomInstructions;
  linkedInProfile: LinkedInProfile | null;
  baseResume: BaseResumeInfo;
}

export type ModuleId =
  | "baseResume"
  | "identity"
  | "workHistory"
  | "skills"
  | "goals"
  | "preferences"
  | "documents"
  | "instructions";

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: string;
}

export const MODULES: ModuleConfig[] = [
  {
    id: "baseResume",
    title: "Base Resume",
    subtitle: "Your starting point for tailored resumes",
    icon: "FileUser",
  },
  {
    id: "identity",
    title: "Profile Snapshot",
    subtitle: "Name, headline, location, work authorization",
    icon: "User",
  },
  {
    id: "workHistory",
    title: "Work History & Achievements",
    subtitle: "Roles, companies, and quantifiable impact",
    icon: "Briefcase",
  },
  {
    id: "skills",
    title: "Skills & Tools",
    subtitle: "Technical, tools, domain, and soft skills",
    icon: "Wrench",
  },
  {
    id: "goals",
    title: "Career Goals",
    subtitle: "Target roles, industries, and time horizon",
    icon: "Target",
  },
  {
    id: "preferences",
    title: "Preferences & Constraints",
    subtitle: "Salary, location, non-negotiables",
    icon: "Settings",
  },
  {
    id: "documents",
    title: "Documents & Links",
    subtitle: "Portfolio, writing samples, and additional references",
    icon: "FileText",
  },
  {
    id: "instructions",
    title: "Custom Instructions",
    subtitle: "How you want JobSherpa to write for you",
    icon: "Pencil",
  },
];

export const defaultKnowledgeState: KnowledgeEngineState = {
  identity: {
    fullName: "",
    headline: "",
    location: "",
    education: [],
  },
  workHistory: [],
  skills: [],
  goals: {
    targetTitles: [],
    targetIndustries: [],
    targetLocations: [],
  },
  preferences: {
    nonNegotiables: [],
  },
  documents: [],
  instructions: {
    notes: "",
  },
  linkedInProfile: null,
  baseResume: {},
};

export interface ParsedEducation {
  schoolName: string;
  degree: string;
  startYear?: string | null;
  endYear?: string | null;
}

export interface ParsedProfileSnapshot {
  fullName?: string;
  headline?: string;
  location?: string;
  education?: ParsedEducation[];
  workAuthorization?: string | null;
}

export interface ParsedWorkExperience {
  jobTitle: string;
  company: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  summary?: string | null;
  achievements?: string[];
}

export interface ParsedSkills {
  technical: string[];
  tools: string[];
  domain: string[];
  soft: string[];
}

export interface ParsedResumePayload {
  profile: ParsedProfileSnapshot;
  experiences: ParsedWorkExperience[];
  skills: ParsedSkills;
}

export type ModuleStatus = "not_started" | "in_progress" | "complete";

export function getModuleStatus(state: KnowledgeEngineState, moduleId: ModuleId): ModuleStatus {
  switch (moduleId) {
    case "baseResume":
      if (state.baseResume?.source) return "complete";
      return "not_started";

    case "identity":
      if (state.identity.fullName && state.identity.headline) return "complete";
      if (state.identity.fullName || state.identity.headline || state.identity.location) return "in_progress";
      return "not_started";

    case "workHistory":
      if (state.workHistory.length > 0) {
        const hasEnoughAchievements = state.workHistory.some(role => role.achievements.length >= 2);
        return hasEnoughAchievements ? "complete" : "in_progress";
      }
      return "not_started";

    case "skills":
      if (state.skills.length >= 5) return "complete";
      if (state.skills.length > 0) return "in_progress";
      return "not_started";

    case "goals":
      if (state.goals.targetTitles.length > 0) return "complete";
      if (state.goals.targetIndustries.length > 0 || state.goals.targetLocations.length > 0) return "in_progress";
      return "not_started";

    case "preferences":
      if (state.preferences.salaryRange || state.preferences.remotePreference) return "complete";
      if (state.preferences.companySizePreference || state.preferences.nonNegotiables.length > 0) return "in_progress";
      return "not_started";

    case "documents":
      if (state.documents.length > 0) return "complete";
      return "not_started";

    case "instructions":
      if (state.instructions.notes) return "complete";
      if (state.instructions.tone || state.instructions.region || state.instructions.lengthPreference) return "in_progress";
      return "not_started";

    default:
      return "not_started";
  }
}

export function calculateProfileCompleteness(state: KnowledgeEngineState): { percentage: number; completed: number; total: number } {
  const moduleIds: ModuleId[] = ["baseResume", "identity", "workHistory", "skills", "goals", "preferences", "documents", "instructions"];
  let completed = 0;
  
  for (const moduleId of moduleIds) {
    if (getModuleStatus(state, moduleId) === "complete") {
      completed++;
    }
  }
  
  return {
    percentage: Math.round((completed / moduleIds.length) * 100),
    completed,
    total: moduleIds.length,
  };
}
