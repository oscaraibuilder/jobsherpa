import OpenAI from "openai";
import type { ScoutJob, InsertJobMatch } from "@shared/schema";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

interface KnowledgeProfile {
  identity: {
    fullName: string;
    headline: string;
    location: string;
    yearsExperience?: string;
  };
  workHistory: Array<{
    title: string;
    company: string;
    achievements: Array<{ text: string; impact?: string; metrics?: string }>;
  }>;
  skills: Array<{
    name: string;
    category: string;
    level?: string;
  }>;
  goals: {
    targetTitles: string[];
    targetIndustries: string[];
    targetLocations: string[];
  };
  preferences: {
    salaryRange?: string;
    remotePreference?: string;
    companySizePreference?: string;
    nonNegotiables: string[];
  };
}

interface MatchResult {
  score: number;
  reasonShort: string;
  reasonJson: {
    titleMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    preferencesMatch: number;
    keyStrengths: string[];
    gaps: string[];
    recommendation: string;
  };
}

function extractProfileSummary(profile: KnowledgeProfile): string {
  const skills = profile.skills.map(s => s.name).join(", ");
  const titles = profile.goals.targetTitles.join(", ");
  const locations = profile.goals.targetLocations.join(", ");
  const recentRoles = profile.workHistory.slice(0, 3).map(w => `${w.title} at ${w.company}`).join("; ");
  
  return `
Candidate Profile:
- Current/Recent: ${profile.identity.headline}
- Target Titles: ${titles || "Not specified"}
- Target Locations: ${locations || "Open to all"}
- Years Experience: ${profile.identity.yearsExperience || "Not specified"}
- Key Skills: ${skills || "Not specified"}
- Recent Roles: ${recentRoles || "Not specified"}
- Remote Preference: ${profile.preferences.remotePreference || "Open"}
- Salary Range: ${profile.preferences.salaryRange || "Not specified"}
- Non-negotiables: ${profile.preferences.nonNegotiables.join(", ") || "None specified"}
  `.trim();
}

function extractJobSummary(job: ScoutJob): string {
  const salary = job.salaryMin && job.salaryMax 
    ? `${job.salaryCurrency || "USD"} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
    : "Not specified";
    
  return `
Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.normalizedLocation || job.locationRaw || "Not specified"}
- Remote Status: ${job.remoteStatus || "Not specified"}
- Seniority: ${job.seniority || "Not specified"}
- Employment Type: ${job.employmentType || "Full-time"}
- Salary Range: ${salary}
- Industries: ${job.industries?.join(", ") || "Not specified"}

Job Description:
${job.descriptionClean || job.descriptionRaw}
  `.trim();
}

export async function scoreJobMatch(
  job: ScoutJob,
  profile: KnowledgeProfile
): Promise<MatchResult> {
  const profileSummary = extractProfileSummary(profile);
  const jobSummary = extractJobSummary(job);
  
  const prompt = `You are a job matching expert. Analyze how well this candidate matches this job opportunity.

${profileSummary}

${jobSummary}

Provide a match analysis in the following JSON format:
{
  "score": <number 0-100>,
  "titleMatch": <number 0-100 - how well the job title aligns with target titles>,
  "skillsMatch": <number 0-100 - how well candidate skills match job requirements>,
  "experienceMatch": <number 0-100 - how appropriate the experience level is>,
  "locationMatch": <number 0-100 - location/remote compatibility>,
  "preferencesMatch": <number 0-100 - salary, company type, non-negotiables>,
  "keyStrengths": [<array of 2-3 key strengths for this role>],
  "gaps": [<array of 0-2 potential gaps or areas to address>],
  "recommendation": "<one sentence recommendation>"
}

Score Guidelines:
- 85-100: Excellent match - strong alignment across all areas
- 70-84: Good match - solid fit with minor gaps
- 50-69: Moderate match - some alignment but notable gaps
- 30-49: Weak match - limited alignment
- 0-29: Poor match - significant misalignment

Be realistic and specific. Consider the candidate's experience level and career trajectory.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a job matching expert. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    
    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      score: Math.min(100, Math.max(0, parsed.score || 50)),
      reasonShort: parsed.recommendation || "Match analysis complete",
      reasonJson: {
        titleMatch: parsed.titleMatch || 50,
        skillsMatch: parsed.skillsMatch || 50,
        experienceMatch: parsed.experienceMatch || 50,
        locationMatch: parsed.locationMatch || 50,
        preferencesMatch: parsed.preferencesMatch || 50,
        keyStrengths: parsed.keyStrengths || [],
        gaps: parsed.gaps || [],
        recommendation: parsed.recommendation || "",
      },
    };
  } catch (error) {
    console.error("Error scoring job match:", error);
    return calculateFallbackScore(job, profile);
  }
}

function calculateFallbackScore(job: ScoutJob, profile: KnowledgeProfile): MatchResult {
  let score = 50;
  const keyStrengths: string[] = [];
  const gaps: string[] = [];
  
  const jobTitleLower = job.title.toLowerCase();
  const targetTitles = profile.goals.targetTitles.map(t => t.toLowerCase());
  const titleMatch = targetTitles.some(target => 
    jobTitleLower.includes(target) || target.includes(jobTitleLower.split(" ")[0])
  );
  if (titleMatch) {
    score += 15;
    keyStrengths.push("Title aligns with career goals");
  }
  
  const jobLocationLower = (job.normalizedLocation || job.locationRaw || "").toLowerCase();
  const targetLocations = profile.goals.targetLocations.map(l => l.toLowerCase());
  const locationMatch = targetLocations.length === 0 || 
    targetLocations.some(loc => jobLocationLower.includes(loc)) ||
    (profile.preferences.remotePreference === "Remote" && job.remoteStatus === "remote");
  if (locationMatch) {
    score += 10;
    keyStrengths.push("Location compatible");
  } else {
    gaps.push("Location may not match preferences");
  }
  
  if (job.remoteStatus === profile.preferences.remotePreference?.toLowerCase()) {
    score += 5;
  }
  
  const jobDescLower = job.descriptionRaw.toLowerCase();
  const skillMatches = profile.skills.filter(skill => 
    jobDescLower.includes(skill.name.toLowerCase())
  );
  if (skillMatches.length >= 3) {
    score += 15;
    keyStrengths.push(`${skillMatches.length} skills match job requirements`);
  } else if (skillMatches.length > 0) {
    score += 5;
  } else {
    gaps.push("Limited skill overlap detected");
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    reasonShort: titleMatch ? "Good title alignment with your goals" : "Potential opportunity to explore",
    reasonJson: {
      titleMatch: titleMatch ? 80 : 40,
      skillsMatch: Math.min(100, skillMatches.length * 20),
      experienceMatch: 60,
      locationMatch: locationMatch ? 80 : 40,
      preferencesMatch: 60,
      keyStrengths,
      gaps,
      recommendation: titleMatch ? "Worth applying - good alignment" : "Review carefully before applying",
    },
  };
}

export async function scoreJobsBatch(
  jobs: ScoutJob[],
  profile: KnowledgeProfile,
  userId: string
): Promise<InsertJobMatch[]> {
  const results: InsertJobMatch[] = [];
  
  for (const job of jobs) {
    try {
      const matchResult = await scoreJobMatch(job, profile);
      
      results.push({
        userId,
        scoutJobId: job.id,
        matchScore: matchResult.score,
        reasonShort: matchResult.reasonShort,
        reasonJson: matchResult.reasonJson,
        status: "new",
      });
    } catch (error) {
      console.error(`Error scoring job ${job.id}:`, error);
      results.push({
        userId,
        scoutJobId: job.id,
        matchScore: 50,
        reasonShort: "Unable to fully analyze - manual review recommended",
        reasonJson: null,
        status: "new",
      });
    }
  }
  
  return results;
}
