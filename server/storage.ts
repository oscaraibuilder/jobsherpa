import {
  users,
  resumes,
  experiences,
  skills,
  resumeSkills,
  jobs,
  tailoredResumes,
  applications,
  jobAnalyses,
  knowledgeProfiles,
  jobSources,
  scoutJobs,
  jobMatchSettings,
  jobMatches,
  applyAgentSettings,
  jobApplications,
  applicationEvents,
  type User,
  type UpsertUser,
  type Resume,
  type InsertResume,
  type Experience,
  type InsertExperience,
  type Skill,
  type InsertSkill,
  type Job,
  type InsertJob,
  type TailoredResume,
  type InsertTailoredResume,
  type Application,
  type InsertApplication,
  type JobAnalysis,
  type InsertJobAnalysis,
  type KnowledgeProfile,
  type InsertKnowledgeProfile,
  type JobSource,
  type InsertJobSource,
  type ScoutJob,
  type InsertScoutJob,
  type JobMatchSettings,
  type InsertJobMatchSettings,
  type JobMatch,
  type InsertJobMatch,
  type ApplyAgentSettings,
  type InsertApplyAgentSettings,
  type JobApplication,
  type InsertJobApplication,
  type ApplicationEvent,
  type InsertApplicationEvent,
  betaWaitlist,
  type BetaWaitlist,
  type InsertBetaWaitlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  ensureAnonymousUser(userId: string): Promise<User>;
  
  getResumes(userId: string): Promise<Resume[]>;
  getResume(id: string): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: string, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: string): Promise<boolean>;
  
  getExperiences(resumeId: string): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: string, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: string): Promise<boolean>;
  
  getSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  deleteSkill(id: string): Promise<boolean>;
  
  getJobs(userId: string): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  
  getTailoredResumes(userId: string): Promise<TailoredResume[]>;
  getTailoredResume(id: string): Promise<TailoredResume | undefined>;
  createTailoredResume(tailoredResume: InsertTailoredResume): Promise<TailoredResume>;
  updateTailoredResume(id: string, tailoredResume: Partial<InsertTailoredResume>): Promise<TailoredResume | undefined>;
  deleteTailoredResume(id: string): Promise<boolean>;
  
  getApplications(userId: string): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<boolean>;
  
  getJobAnalyses(userId: string): Promise<JobAnalysis[]>;
  createJobAnalysis(jobAnalysis: InsertJobAnalysis): Promise<JobAnalysis>;
  
  getKnowledgeProfile(userId: string): Promise<KnowledgeProfile | undefined>;
  saveKnowledgeProfile(userId: string, data: unknown): Promise<KnowledgeProfile>;
  
  // Job Scout - Job Sources
  getJobSources(): Promise<JobSource[]>;
  getJobSource(id: string): Promise<JobSource | undefined>;
  createJobSource(source: InsertJobSource): Promise<JobSource>;
  updateJobSource(id: string, source: Partial<InsertJobSource>): Promise<JobSource | undefined>;
  
  // Job Scout - Scout Jobs
  getScoutJobs(filters?: { sourceId?: string; isActive?: boolean }): Promise<ScoutJob[]>;
  getScoutJob(id: string): Promise<ScoutJob | undefined>;
  getScoutJobByExternalId(externalId: string, sourceId: string): Promise<ScoutJob | undefined>;
  createScoutJob(job: InsertScoutJob): Promise<ScoutJob>;
  createScoutJobsBatch(jobs: InsertScoutJob[]): Promise<ScoutJob[]>;
  updateScoutJob(id: string, job: Partial<InsertScoutJob>): Promise<ScoutJob | undefined>;
  
  // Job Scout - Match Settings
  getJobMatchSettings(userId: string): Promise<JobMatchSettings | undefined>;
  saveJobMatchSettings(userId: string, settings: Partial<InsertJobMatchSettings>): Promise<JobMatchSettings>;
  
  // Job Scout - Job Matches
  getJobMatches(userId: string, filters?: { status?: string; minScore?: number }): Promise<(JobMatch & { scoutJob: ScoutJob })[]>;
  getJobMatch(id: string): Promise<(JobMatch & { scoutJob: ScoutJob }) | undefined>;
  createJobMatch(match: InsertJobMatch): Promise<JobMatch>;
  createJobMatchesBatch(matches: InsertJobMatch[]): Promise<JobMatch[]>;
  updateJobMatch(id: string, match: Partial<InsertJobMatch>): Promise<JobMatch | undefined>;
  deleteJobMatch(id: string): Promise<boolean>;
  
  // Apply Agent Settings
  getApplyAgentSettings(userId: string): Promise<ApplyAgentSettings | undefined>;
  upsertApplyAgentSettings(userId: string, settings: Partial<InsertApplyAgentSettings>): Promise<ApplyAgentSettings>;

  // Job Application Tracker
  getJobApplications(userId: string): Promise<JobApplication[]>;
  getJobApplication(id: string): Promise<JobApplication | undefined>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication | undefined>;
  deleteJobApplication(id: string): Promise<boolean>;

  // Application Events
  getApplicationEvents(applicationId: string): Promise<ApplicationEvent[]>;
  createApplicationEvent(event: InsertApplicationEvent): Promise<ApplicationEvent>;
  
  // Beta Waitlist
  createBetaWaitlistEntry(entry: InsertBetaWaitlist): Promise<BetaWaitlist>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const normalizedUsername = username.toLowerCase().trim();
    const [user] = await db.select().from(users).where(eq(users.username, normalizedUsername));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    return user;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const normalized = usernameOrEmail.toLowerCase().trim();
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, normalized), eq(users.email, normalized)));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async ensureAnonymousUser(userId: string): Promise<User> {
    const existing = await this.getUser(userId);
    if (existing) return existing;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        username: userId,
        email: `${userId}@anonymous.local`,
        passwordHash: "anonymous-no-login",
      })
      .onConflictDoNothing()
      .returning();
    
    if (!user) {
      const existingAfterInsert = await this.getUser(userId);
      if (existingAfterInsert) return existingAfterInsert;
      throw new Error(`Failed to ensure anonymous user ${userId}`);
    }
    return user;
  }

  async getResumes(userId: string): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
  }

  async getResume(id: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async updateResume(id: string, resume: Partial<InsertResume>): Promise<Resume | undefined> {
    const [updated] = await db
      .update(resumes)
      .set({ ...resume, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }

  async deleteResume(id: string): Promise<boolean> {
    const result = await db.delete(resumes).where(eq(resumes.id, id));
    return true;
  }

  async getExperiences(resumeId: string): Promise<Experience[]> {
    return await db
      .select()
      .from(experiences)
      .where(eq(experiences.resumeId, resumeId))
      .orderBy(experiences.order);
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [newExperience] = await db.insert(experiences).values(experience).returning();
    return newExperience;
  }

  async updateExperience(id: string, experience: Partial<InsertExperience>): Promise<Experience | undefined> {
    const [updated] = await db
      .update(experiences)
      .set(experience)
      .where(eq(experiences.id, id))
      .returning();
    return updated;
  }

  async deleteExperience(id: string): Promise<boolean> {
    await db.delete(experiences).where(eq(experiences.id, id));
    return true;
  }

  async getSkills(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async deleteSkill(id: string): Promise<boolean> {
    await db.delete(skills).where(eq(skills.id, id));
    return true;
  }

  async getJobs(userId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined> {
    const [updated] = await db
      .update(jobs)
      .set(job)
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: string): Promise<boolean> {
    await db.delete(jobs).where(eq(jobs.id, id));
    return true;
  }

  async getTailoredResumes(userId: string): Promise<TailoredResume[]> {
    return await db
      .select()
      .from(tailoredResumes)
      .where(eq(tailoredResumes.userId, userId))
      .orderBy(desc(tailoredResumes.createdAt));
  }

  async getTailoredResume(id: string): Promise<TailoredResume | undefined> {
    const [tailoredResume] = await db
      .select()
      .from(tailoredResumes)
      .where(eq(tailoredResumes.id, id));
    return tailoredResume;
  }

  async createTailoredResume(tailoredResume: InsertTailoredResume): Promise<TailoredResume> {
    const [newTailoredResume] = await db
      .insert(tailoredResumes)
      .values(tailoredResume)
      .returning();
    return newTailoredResume;
  }

  async updateTailoredResume(id: string, tailoredResume: Partial<InsertTailoredResume>): Promise<TailoredResume | undefined> {
    const [updated] = await db
      .update(tailoredResumes)
      .set(tailoredResume)
      .where(eq(tailoredResumes.id, id))
      .returning();
    return updated;
  }

  async deleteTailoredResume(id: string): Promise<boolean> {
    await db.delete(tailoredResumes).where(eq(tailoredResumes.id, id));
    return true;
  }

  async getApplications(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedDate));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set(application)
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async deleteApplication(id: string): Promise<boolean> {
    await db.delete(applications).where(eq(applications.id, id));
    return true;
  }

  async getJobAnalyses(userId: string): Promise<JobAnalysis[]> {
    return await db
      .select()
      .from(jobAnalyses)
      .where(eq(jobAnalyses.userId, userId))
      .orderBy(desc(jobAnalyses.createdAt));
  }

  async createJobAnalysis(jobAnalysis: InsertJobAnalysis): Promise<JobAnalysis> {
    const [newJobAnalysis] = await db
      .insert(jobAnalyses)
      .values(jobAnalysis)
      .returning();
    return newJobAnalysis;
  }

  async getKnowledgeProfile(userId: string): Promise<KnowledgeProfile | undefined> {
    const [profile] = await db
      .select()
      .from(knowledgeProfiles)
      .where(eq(knowledgeProfiles.userId, userId));
    return profile;
  }

  async saveKnowledgeProfile(userId: string, data: unknown): Promise<KnowledgeProfile> {
    const [profile] = await db
      .insert(knowledgeProfiles)
      .values({ userId, data })
      .onConflictDoUpdate({
        target: knowledgeProfiles.userId,
        set: {
          data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // Job Scout - Job Sources
  async getJobSources(): Promise<JobSource[]> {
    return await db.select().from(jobSources);
  }

  async getJobSource(id: string): Promise<JobSource | undefined> {
    const [source] = await db.select().from(jobSources).where(eq(jobSources.id, id));
    return source;
  }

  async createJobSource(source: InsertJobSource): Promise<JobSource> {
    const [newSource] = await db.insert(jobSources).values(source).returning();
    return newSource;
  }

  async updateJobSource(id: string, source: Partial<InsertJobSource>): Promise<JobSource | undefined> {
    const [updated] = await db
      .update(jobSources)
      .set(source)
      .where(eq(jobSources.id, id))
      .returning();
    return updated;
  }

  // Job Scout - Scout Jobs
  async getScoutJobs(filters?: { sourceId?: string; isActive?: boolean }): Promise<ScoutJob[]> {
    let query = db.select().from(scoutJobs);
    
    const conditions = [];
    if (filters?.sourceId) {
      conditions.push(eq(scoutJobs.sourceId, filters.sourceId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(scoutJobs.isActive, filters.isActive));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(scoutJobs.scrapedAt));
    }
    return await query.orderBy(desc(scoutJobs.scrapedAt));
  }

  async getScoutJob(id: string): Promise<ScoutJob | undefined> {
    const [job] = await db.select().from(scoutJobs).where(eq(scoutJobs.id, id));
    return job;
  }

  async getScoutJobByExternalId(externalId: string, sourceId: string): Promise<ScoutJob | undefined> {
    const [job] = await db
      .select()
      .from(scoutJobs)
      .where(and(eq(scoutJobs.externalId, externalId), eq(scoutJobs.sourceId, sourceId)));
    return job;
  }

  async createScoutJob(job: InsertScoutJob): Promise<ScoutJob> {
    const [newJob] = await db.insert(scoutJobs).values(job).returning();
    return newJob;
  }

  async createScoutJobsBatch(jobs: InsertScoutJob[]): Promise<ScoutJob[]> {
    if (jobs.length === 0) return [];
    return await db.insert(scoutJobs).values(jobs).returning();
  }

  async updateScoutJob(id: string, job: Partial<InsertScoutJob>): Promise<ScoutJob | undefined> {
    const [updated] = await db
      .update(scoutJobs)
      .set(job)
      .where(eq(scoutJobs.id, id))
      .returning();
    return updated;
  }

  // Job Scout - Match Settings
  async getJobMatchSettings(userId: string): Promise<JobMatchSettings | undefined> {
    const [settings] = await db
      .select()
      .from(jobMatchSettings)
      .where(eq(jobMatchSettings.userId, userId));
    return settings;
  }

  async saveJobMatchSettings(userId: string, settings: Partial<InsertJobMatchSettings>): Promise<JobMatchSettings> {
    const [savedSettings] = await db
      .insert(jobMatchSettings)
      .values({ userId, ...settings })
      .onConflictDoUpdate({
        target: jobMatchSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return savedSettings;
  }

  // Job Scout - Job Matches
  async getJobMatches(userId: string, filters?: { status?: string; minScore?: number }): Promise<(JobMatch & { scoutJob: ScoutJob })[]> {
    const conditions = [eq(jobMatches.userId, userId)];
    
    if (filters?.status) {
      conditions.push(eq(jobMatches.status, filters.status));
    }
    
    const matches = await db
      .select()
      .from(jobMatches)
      .innerJoin(scoutJobs, eq(jobMatches.scoutJobId, scoutJobs.id))
      .where(and(...conditions))
      .orderBy(desc(jobMatches.matchScore));
    
    return matches
      .filter(row => !filters?.minScore || row.job_matches.matchScore >= filters.minScore)
      .map(row => ({
        ...row.job_matches,
        scoutJob: row.scout_jobs,
      }));
  }

  async getJobMatch(id: string): Promise<(JobMatch & { scoutJob: ScoutJob }) | undefined> {
    const [result] = await db
      .select()
      .from(jobMatches)
      .innerJoin(scoutJobs, eq(jobMatches.scoutJobId, scoutJobs.id))
      .where(eq(jobMatches.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.job_matches,
      scoutJob: result.scout_jobs,
    };
  }

  async createJobMatch(match: InsertJobMatch): Promise<JobMatch> {
    const [newMatch] = await db.insert(jobMatches).values(match).returning();
    return newMatch;
  }

  async createJobMatchesBatch(matches: InsertJobMatch[]): Promise<JobMatch[]> {
    if (matches.length === 0) return [];
    return await db.insert(jobMatches).values(matches).returning();
  }

  async updateJobMatch(id: string, match: Partial<InsertJobMatch>): Promise<JobMatch | undefined> {
    const [updated] = await db
      .update(jobMatches)
      .set({ ...match, updatedAt: new Date() })
      .where(eq(jobMatches.id, id))
      .returning();
    return updated;
  }

  async deleteJobMatch(id: string): Promise<boolean> {
    await db.delete(jobMatches).where(eq(jobMatches.id, id));
    return true;
  }

  // Apply Agent Settings
  async getApplyAgentSettings(userId: string): Promise<ApplyAgentSettings | undefined> {
    const [settings] = await db
      .select()
      .from(applyAgentSettings)
      .where(eq(applyAgentSettings.userId, userId));
    return settings;
  }

  async upsertApplyAgentSettings(userId: string, settings: Partial<InsertApplyAgentSettings>): Promise<ApplyAgentSettings> {
    const [result] = await db
      .insert(applyAgentSettings)
      .values({ userId, ...settings })
      .onConflictDoUpdate({
        target: applyAgentSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Job Application Tracker
  async getJobApplications(userId: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.updatedAt));
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    const [app] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return app;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApp] = await db.insert(jobApplications).values(application).returning();
    return newApp;
  }

  async updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const [updated] = await db
      .update(jobApplications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(jobApplications.id, id))
      .returning();
    return updated;
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
    return true;
  }

  // Application Events
  async getApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
    return await db
      .select()
      .from(applicationEvents)
      .where(eq(applicationEvents.applicationId, applicationId))
      .orderBy(desc(applicationEvents.createdAt));
  }

  async createApplicationEvent(event: InsertApplicationEvent): Promise<ApplicationEvent> {
    const [newEvent] = await db.insert(applicationEvents).values(event).returning();
    return newEvent;
  }

  // Beta Waitlist
  async createBetaWaitlistEntry(entry: InsertBetaWaitlist): Promise<BetaWaitlist> {
    const [newEntry] = await db.insert(betaWaitlist).values(entry).returning();
    return newEntry;
  }
}

export const storage = new DatabaseStorage();
