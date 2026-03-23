import type { KnowledgeEngineState, SkillCategory } from "@/types/knowledgeEngine";
import type { ResumeData, ResumeTemplateKey, ResumeExperience, ResumeSkillGroup, ResumeHighlightSection } from "@/types/resume";

export function buildResumeDataFromKnowledgeEngine(
  state: KnowledgeEngineState,
  templateKey: ResumeTemplateKey
): ResumeData {
  const experiences: ResumeExperience[] = state.workHistory.map((role) => ({
    id: role.id,
    jobTitle: role.title,
    company: role.company,
    location: role.location,
    startDate: role.startDate,
    endDate: role.endDate || "Present",
    bullets: role.achievements.map((a) => a.text),
  }));

  const skillsByCategory = groupSkillsByCategory(state.skills);
  const skillGroups: ResumeSkillGroup[] = [];

  const categoryOrder: SkillCategory[] = ["Technical", "Tools", "Domain", "Soft"];
  for (const category of categoryOrder) {
    const items = skillsByCategory[category];
    if (items && items.length > 0) {
      skillGroups.push({
        label: category === "Soft" ? "Soft Skills" : category,
        items,
      });
    }
  }

  const highlights: ResumeHighlightSection[] = [];

  const topAchievements = state.workHistory
    .flatMap((role) => role.achievements)
    .filter((a) => a.impact || a.metrics)
    .slice(0, 4)
    .map((a) => a.text);

  if (topAchievements.length > 0) {
    highlights.push({
      title: "Key Achievements",
      bullets: topAchievements,
    });
  }

  const targetRoleTitle = state.goals.targetTitles.length > 0
    ? state.goals.targetTitles[0]
    : undefined;

  return {
    contact: {
      fullName: state.identity.fullName || "",
      headline: state.identity.headline || "",
      email: state.linkedInProfile?.email || "",
      location: state.identity.location || "",
      linkedInUrl: state.linkedInProfile?.profileUrl,
    },
    summary: buildSummary(state),
    experiences,
    education: [],
    skillGroups,
    highlights,
    coursesOrCerts: [],
    extraSections: [],
    targetRoleTitle,
    templateKey,
  };
}

function groupSkillsByCategory(
  skills: KnowledgeEngineState["skills"]
): Record<SkillCategory, string[]> {
  const result: Record<SkillCategory, string[]> = {
    Technical: [],
    Tools: [],
    Domain: [],
    Soft: [],
  };

  for (const skill of skills) {
    if (result[skill.category]) {
      result[skill.category].push(skill.name);
    }
  }

  return result;
}

function buildSummary(state: KnowledgeEngineState): string {
  const { identity, goals, workHistory } = state;

  if (!identity.fullName) {
    return "";
  }

  const yearsExp = identity.yearsExperience || "";
  const targetRole = goals.targetTitles.length > 0 ? goals.targetTitles[0] : "";
  const industries = goals.targetIndustries.join(", ");
  const recentRole = workHistory.length > 0 ? workHistory[0] : null;

  let summary = "";

  if (yearsExp && targetRole) {
    summary = `${identity.headline || "Professional"} with ${yearsExp} of experience`;
    if (recentRole) {
      summary += ` in ${recentRole.title} roles`;
    }
    summary += ". ";
  } else if (identity.headline) {
    summary = `${identity.headline}. `;
  }

  if (industries) {
    summary += `Focused on ${industries}. `;
  }

  if (targetRole && !summary.includes(targetRole)) {
    summary += `Seeking ${targetRole} opportunities.`;
  }

  return summary.trim();
}

export function isKnowledgeEngineSufficient(state: KnowledgeEngineState): boolean {
  return !!(
    state.identity.fullName &&
    (state.workHistory.length > 0 || state.skills.length > 0)
  );
}
