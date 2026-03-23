import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import {
  insertResumeSchema,
  insertExperienceSchema,
  insertSkillSchema,
  insertJobSchema,
  insertTailoredResumeSchema,
  insertApplicationSchema,
  insertJobAnalysisSchema,
  insertJobApplicationSchema,
  insertApplicationEventSchema,
  insertBetaWaitlistSchema,
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import multer from "multer";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import * as fs from "fs";
import * as path from "path";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import { PDFParse } from "pdf-parse";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const DEFAULT_USER_ID = "anonymous-user";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize session endpoint - ensures main window has a session before popup opens
  app.post("/api/auth/init-session", (req: Request, res: Response) => {
    // Touch the session to ensure it's created
    req.session.initialized = true;
    req.session.save((err) => {
      if (err) {
        console.error("Session init error:", err);
        return res.status(500).json({ error: "Failed to initialize session" });
      }
      console.log("SESSION INIT - Created session:", req.sessionID);
      res.json({ sessionId: req.sessionID });
    });
  });

  app.get("/api/auth/linkedin", (req: Request, res: Response) => {
    const state = crypto.randomUUID();
    req.session.linkedinState = state;

    // Generate the redirect URI based on the current request origin
    // In production, use the env var; in development, use the dynamic URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const currentOriginCallback = `${protocol}://${host}/api/auth/linkedin/callback`;
    
    // Use env var for production (.replit.app domain), otherwise use dynamic URL
    let redirectUri: string;
    const isProdDomain = host && (host.includes('.replit.app') || host.includes('jobsherpa'));
    if (process.env.LINKEDIN_REDIRECT_URI && isProdDomain) {
      redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    } else {
      redirectUri = currentOriginCallback;
    }
    
    req.session.linkedinRedirectUri = redirectUri;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      state,
    });

    res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
  });

  app.get("/api/auth/linkedin/callback", async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;

      const sendErrorPage = (message: string) => {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head><title>LinkedIn Error</title></head>
            <body>
              <script>window.close();</script>
              <p>${message}. You can close this window.</p>
            </body>
          </html>
        `);
      };

      if (!code || typeof code !== "string") {
        return sendErrorPage("Missing authorization code");
      }

      if (!state || state !== req.session.linkedinState) {
        return sendErrorPage("Invalid state parameter");
      }

      const redirectUri = req.session.linkedinRedirectUri;
      delete req.session.linkedinState;
      delete req.session.linkedinRedirectUri;

      if (!redirectUri) {
        return sendErrorPage("Missing redirect URI in session");
      }

      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("LinkedIn token exchange failed:", errorText);
        return sendErrorPage("Token exchange failed");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error("LinkedIn userinfo failed:", errorText);
        return sendErrorPage("Failed to fetch user info");
      }

      const userInfo = await userInfoResponse.json();

      req.session.linkedInUser = {
        id: userInfo.sub,
        fullName: userInfo.name,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
        email: userInfo.email,
        avatarUrl: userInfo.picture,
        locale: userInfo.locale,
      };

      console.log("LINKEDIN CALLBACK - About to save session:", {
        sessionId: req.sessionID,
        linkedInUserId: req.session.linkedInUser?.id,
        cookie: req.headers.cookie,
      });

      // Explicitly save session before sending response to ensure it persists
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        console.log("LINKEDIN CALLBACK - Session saved, sessionId:", req.sessionID);
        res.send(`
          <!DOCTYPE html>
          <html>
            <head><title>LinkedIn Connected</title></head>
            <body>
              <script>
                window.close();
              </script>
              <p>LinkedIn connected successfully. You can close this window.</p>
            </body>
          </html>
        `);
      });
    } catch (error) {
      console.error("LinkedIn callback error:", error);
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>LinkedIn Error</title></head>
          <body>
            <script>
              window.close();
            </script>
            <p>An error occurred. You can close this window.</p>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    console.log("AUTH/ME - Session check:", {
      sessionId: req.sessionID,
      hasLinkedInUser: !!req.session?.linkedInUser,
      linkedInUserId: req.session?.linkedInUser?.id,
      cookie: req.headers.cookie,
    });
    const user = req.session?.linkedInUser;
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, user });
  });

  // User endpoint for client auth hook
  app.get("/api/auth/user", (req: Request, res: Response) => {
    const linkedInUser = req.session?.linkedInUser;
    if (!linkedInUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Return user in format expected by client
    res.json({
      id: linkedInUser.id,
      username: linkedInUser.email || linkedInUser.id,
      email: linkedInUser.email || "",
      firstName: linkedInUser.givenName || null,
      lastName: linkedInUser.familyName || null,
      profileImageUrl: linkedInUser.avatarUrl || null,
    });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(204).end();
    });
  });

  // Debug endpoint to inspect session (for debugging only)
  app.get("/api/debug/session", (req: Request, res: Response) => {
    console.log("DEBUG SESSION:", {
      hasSession: !!req.session,
      sessionId: req.sessionID,
      linkedInUser: req.session?.linkedInUser,
      cookie: req.headers.cookie,
    });
    res.json({
      hasSession: !!req.session,
      sessionId: req.sessionID,
      hasLinkedInUser: !!req.session?.linkedInUser,
      linkedInUser: req.session?.linkedInUser || null,
    });
  });

  // Knowledge Engine routes
  app.get("/api/knowledge-engine", async (req: Request, res: Response) => {
    try {
      const user = req.session?.linkedInUser;
      if (!user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const profile = await storage.getKnowledgeProfile(user.id);
      res.json({ state: profile?.data || null });
    } catch (error) {
      console.error("Error fetching knowledge profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/knowledge-engine", async (req: Request, res: Response) => {
    try {
      const user = req.session?.linkedInUser;
      if (!user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { state } = req.body;
      await storage.saveKnowledgeProfile(user.id, state);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving knowledge profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Apply Agent Settings routes
  app.get("/api/apply-agent/settings", async (req: Request, res: Response) => {
    try {
      const user = req.session?.linkedInUser;
      if (!user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const settings = await storage.getApplyAgentSettings(user.id);
      
      if (!settings) {
        // Return sensible defaults
        return res.json({
          userId: user.id,
          activeModes: [],
          fullName: user.fullName || null,
          email: user.email || null,
          phone: null,
          primaryLocation: null,
          workAuthorization: null,
          sponsorshipNeeded: null,
          currentCountry: null,
          defaultResumeId: null,
          minSalary: null,
          currency: "USD",
          relocationOpen: null,
          remoteOnly: null,
          notesForHiringManager: null,
          easyApplyEnabled: true,
          easyApplyMaxAppsPerDay: 10,
          easyApplyAutonomyLevel: 0,
          easyApplyAllowedSites: ["LinkedIn", "Greenhouse", "Lever"],
          hardAgentEnabled: false,
          hardAgentMaxAppsPerWeek: 5,
          hardAgentAutonomyLevel: 0,
          hardAgentAllowedPortals: [],
          portalAccounts: [],
          commonQuestions: [],
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching apply agent settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/apply-agent/settings", async (req: Request, res: Response) => {
    try {
      const user = req.session?.linkedInUser;
      if (!user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const settings = req.body;
      
      // Basic validation
      if (settings.easyApplyAutonomyLevel !== undefined && 
          (settings.easyApplyAutonomyLevel < 0 || settings.easyApplyAutonomyLevel > 2)) {
        return res.status(400).json({ error: "easyApplyAutonomyLevel must be 0, 1, or 2" });
      }
      if (settings.hardAgentAutonomyLevel !== undefined && 
          (settings.hardAgentAutonomyLevel < 0 || settings.hardAgentAutonomyLevel > 2)) {
        return res.status(400).json({ error: "hardAgentAutonomyLevel must be 0, 1, or 2" });
      }
      if (settings.easyApplyMaxAppsPerDay !== undefined && settings.easyApplyMaxAppsPerDay < 0) {
        return res.status(400).json({ error: "easyApplyMaxAppsPerDay must be >= 0" });
      }
      if (settings.hardAgentMaxAppsPerWeek !== undefined && settings.hardAgentMaxAppsPerWeek < 0) {
        return res.status(400).json({ error: "hardAgentMaxAppsPerWeek must be >= 0" });
      }

      const updated = await storage.upsertApplyAgentSettings(user.id, settings);
      res.json(updated);
    } catch (error) {
      console.error("Error updating apply agent settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload endpoint (authenticated)
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    // Debug logging for upload auth
    console.log("UPLOAD HIT", {
      path: req.path,
      method: req.method,
      hasSession: !!req.session,
      sessionId: req.sessionID,
      hasLinkedInUser: !!req.session?.linkedInUser,
      linkedInUserId: req.session?.linkedInUser?.id,
      cookie: req.headers.cookie,
    });

    try {
      // Allow uploads with just a session (no LinkedIn required)
      // Use linkedInUser.id if available, otherwise use sessionID
      const userId = req.session?.linkedInUser?.id || req.sessionID;
      if (!userId || !req.session) {
        console.log("UPLOAD AUTH FAILED - no session, sessionId:", req.sessionID);
        return res.status(401).json({ error: "Not authenticated" });
      }
      console.log("UPLOAD - authenticated user:", userId);

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const objectStorageService = new ObjectStorageService();
      const result = await objectStorageService.uploadFromBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Serve uploaded objects (with access control)
  app.get("/objects/:objectPath(*)", async (req: Request, res: Response) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const userId = req.session?.linkedInUser?.id;
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      const canAccess = await objectStorageService.canAccessObjectEntity({
        userId,
        objectFile,
      });
      
      if (!canAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Resume routes
  app.get("/api/resumes", async (_req: Request, res: Response) => {
    try {
      const resumes = await storage.getResumes(DEFAULT_USER_ID);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/resumes/:id", async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/resumes", async (req: Request, res: Response) => {
    try {
      const validated = insertResumeSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const resume = await storage.createResume(validated);
      res.status(201).json(resume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/resumes/:id", async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      const updated = await storage.updateResume(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/resumes/:id", async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      await storage.deleteResume(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Experience routes
  app.get("/api/resumes/:resumeId/experiences", async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResume(req.params.resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      const experiences = await storage.getExperiences(req.params.resumeId);
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/resumes/:resumeId/experiences", async (req: Request, res: Response) => {
    try {
      const resume = await storage.getResume(req.params.resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      const validated = insertExperienceSchema.parse({ ...req.body, resumeId: req.params.resumeId });
      const experience = await storage.createExperience(validated);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating experience:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/experiences/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateExperience(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Experience not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating experience:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/experiences/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteExperience(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting experience:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Skills routes
  app.get("/api/skills", async (_req: Request, res: Response) => {
    try {
      const skills = await storage.getSkills(DEFAULT_USER_ID);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/skills", async (req: Request, res: Response) => {
    try {
      const validated = insertSkillSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const skill = await storage.createSkill(validated);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteSkill(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (_req: Request, res: Response) => {
    try {
      const jobs = await storage.getJobs(DEFAULT_USER_ID);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/jobs", async (req: Request, res: Response) => {
    try {
      const validated = insertJobSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const job = await storage.createJob(validated);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      const updated = await storage.updateJob(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      await storage.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Tailored resume routes
  app.get("/api/tailored-resumes", async (_req: Request, res: Response) => {
    try {
      const tailoredResumes = await storage.getTailoredResumes(DEFAULT_USER_ID);
      res.json(tailoredResumes);
    } catch (error) {
      console.error("Error fetching tailored resumes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tailored-resumes/:id", async (req: Request, res: Response) => {
    try {
      const tailoredResume = await storage.getTailoredResume(req.params.id);
      if (!tailoredResume) {
        return res.status(404).json({ message: "Tailored resume not found" });
      }
      res.json(tailoredResume);
    } catch (error) {
      console.error("Error fetching tailored resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tailored-resumes", async (req: Request, res: Response) => {
    try {
      const validated = insertTailoredResumeSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const tailoredResume = await storage.createTailoredResume(validated);
      res.status(201).json(tailoredResume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating tailored resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/tailored-resumes/:id", async (req: Request, res: Response) => {
    try {
      const tailoredResume = await storage.getTailoredResume(req.params.id);
      if (!tailoredResume) {
        return res.status(404).json({ message: "Tailored resume not found" });
      }
      const updated = await storage.updateTailoredResume(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating tailored resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/tailored-resumes/:id", async (req: Request, res: Response) => {
    try {
      const tailoredResume = await storage.getTailoredResume(req.params.id);
      if (!tailoredResume) {
        return res.status(404).json({ message: "Tailored resume not found" });
      }
      await storage.deleteTailoredResume(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tailored resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Application routes
  app.get("/api/applications", async (_req: Request, res: Response) => {
    try {
      const applications = await storage.getApplications(DEFAULT_USER_ID);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/applications/:id", async (req: Request, res: Response) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/applications", async (req: Request, res: Response) => {
    try {
      const validated = insertApplicationSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const application = await storage.createApplication(validated);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/applications/:id", async (req: Request, res: Response) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const updated = await storage.updateApplication(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/applications/:id", async (req: Request, res: Response) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      await storage.deleteApplication(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Job analysis routes
  app.get("/api/job-analyses", async (_req: Request, res: Response) => {
    try {
      const analyses = await storage.getJobAnalyses(DEFAULT_USER_ID);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching job analyses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI routes
  app.post("/api/ai/analyze-job", async (req: Request, res: Response) => {
    try {
      const { jobDescription } = req.body;

      if (!jobDescription || typeof jobDescription !== "string") {
        return res.status(400).json({ message: "Job description is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert career coach and ATS (Applicant Tracking System) specialist. Analyze the provided job description and extract key insights to help job seekers optimize their resume.

Return a JSON object with the following structure:
{
  "scanningPriorities": ["array of the most important qualifications/requirements the recruiter will scan for first"],
  "strengthMapping": {
    "mustHave": ["essential requirements that are deal-breakers"],
    "niceToHave": ["preferred but not essential qualifications"],
    "softSkills": ["interpersonal and soft skills mentioned"]
  },
  "atsKeywords": {
    "technical": ["technical skills, tools, technologies"],
    "action": ["action verbs used in the description"],
    "industry": ["industry-specific terminology"]
  },
  "recruiterInsights": "A brief paragraph explaining what the recruiter is really looking for beyond the listed requirements, including company culture hints and unwritten expectations"
}`
          },
          {
            role: "user",
            content: `Analyze this job description:\n\n${jobDescription}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysisResult = JSON.parse(completion.choices[0].message.content || "{}");

      const jobAnalysis = await storage.createJobAnalysis({
        userId: DEFAULT_USER_ID,
        jobDescription,
        scanningPriorities: analysisResult.scanningPriorities || [],
        strengthMapping: analysisResult.strengthMapping || {},
        atsKeywords: analysisResult.atsKeywords || {},
        recruiterInsights: analysisResult.recruiterInsights || "",
      });

      res.status(201).json(jobAnalysis);
    } catch (error) {
      console.error("Error analyzing job:", error);
      res.status(500).json({ message: "Failed to analyze job description" });
    }
  });

  app.post("/api/ai/tailor", async (req: Request, res: Response) => {
    try {
      const { resumeId, jobDescription, jobId } = req.body;

      if (!resumeId || !jobDescription) {
        return res.status(400).json({ message: "Resume ID and job description are required" });
      }

      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const experiences = await storage.getExperiences(resumeId);

      const resumeContent = {
        summary: resume.summary,
        roleTitle: resume.roleTitle,
        experiences: experiences.map(exp => ({
          company: exp.company,
          title: exp.title,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isCurrent: exp.isCurrent,
          bullets: exp.bullets,
          achievements: exp.achievements,
        })),
        parsedContent: resume.parsedContent,
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert resume writer and ATS optimization specialist. Your task is to tailor a resume to match a specific job description while maintaining authenticity and truthfulness.

Given a resume and job description, you will:
1. Optimize the professional summary to align with the target role
2. Rewrite experience bullet points using keywords from the job description
3. Highlight relevant achievements and quantifiable results
4. Identify matching and missing keywords for ATS optimization
5. Provide an ATS compatibility score (0-100)

Return a JSON object with this structure:
{
  "tailoredSummary": "Optimized professional summary paragraph",
  "tailoredRoleTitle": "Suggested role title that matches the job",
  "tailoredExperiences": [
    {
      "company": "Company name",
      "title": "Job title",
      "bullets": ["Rewritten bullet point 1", "Rewritten bullet point 2"]
    }
  ],
  "atsScore": 85,
  "keywordsMatched": ["keyword1", "keyword2"],
  "keywordsMissing": ["missing1", "missing2"],
  "suggestions": "Additional tips for improving the resume"
}`
          },
          {
            role: "user",
            content: `Resume Content:\n${JSON.stringify(resumeContent, null, 2)}\n\nJob Description:\n${jobDescription}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const tailorResult = JSON.parse(completion.choices[0].message.content || "{}");

      const job = jobId ? await storage.getJob(jobId) : null;
      const tailoredName = job 
        ? `${resume.name} - ${job.company} ${job.title}`
        : `${resume.name} - Tailored`;

      const tailoredResume = await storage.createTailoredResume({
        baseResumeId: resumeId,
        jobId: jobId || null,
        userId: DEFAULT_USER_ID,
        name: tailoredName,
        roleTitle: tailorResult.tailoredRoleTitle || resume.roleTitle,
        summary: tailorResult.tailoredSummary || resume.summary,
        tailoredContent: {
          experiences: tailorResult.tailoredExperiences || [],
          suggestions: tailorResult.suggestions || "",
        },
        atsScore: tailorResult.atsScore || 0,
        keywordsMatched: tailorResult.keywordsMatched || [],
        keywordsMissing: tailorResult.keywordsMissing || [],
      });

      res.status(201).json({
        tailoredResume,
        analysis: {
          atsScore: tailorResult.atsScore,
          keywordsMatched: tailorResult.keywordsMatched,
          keywordsMissing: tailorResult.keywordsMissing,
          suggestions: tailorResult.suggestions,
        }
      });
    } catch (error) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({ message: "Failed to tailor resume" });
    }
  });

  // Resume parsing endpoint - extracts structured data from uploaded resume
  app.post("/api/resume/parse", async (req: Request, res: Response) => {
    try {
      // Allow parsing with just a session (no LinkedIn required)
      // Use linkedInUser.id if available, otherwise use sessionID
      const userId = req.session?.linkedInUser?.id || req.sessionID;
      if (!userId || !req.session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { documentUrl } = req.body;
      if (!documentUrl || typeof documentUrl !== "string") {
        return res.status(400).json({ error: "Document URL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Get file buffer with authorization check
      let fileData: { buffer: Buffer; contentType: string } | null;
      try {
        fileData = await objectStorageService.getAuthorizedFileBuffer(documentUrl, userId);
      } catch (error) {
        if (error instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "Document not found" });
        }
        throw error;
      }
      
      if (!fileData) {
        return res.status(403).json({ error: "Access denied to this document" });
      }

      // Extract text from the file
      let extractedText = "";
      if (fileData.contentType === "application/pdf" || documentUrl.toLowerCase().endsWith(".pdf")) {
        try {
          const parser = new PDFParse({ data: fileData.buffer });
          const textResult = await parser.getText();
          extractedText = textResult.text;
          await parser.destroy();
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          return res.status(400).json({ error: "Failed to parse PDF file" });
        }
      } else if (fileData.contentType === "text/plain" || documentUrl.toLowerCase().endsWith(".txt")) {
        extractedText = fileData.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or TXT file." });
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ error: "Could not extract text from the document" });
      }

      // Use OpenAI to parse the resume into structured data
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert resume parser. Your task is to extract structured information from a resume text.

Extract the following information and return it as a JSON object with this exact structure:
{
  "profile": {
    "fullName": "The person's full name",
    "headline": "Their professional headline or current job title",
    "location": "Their location (city, state/country)",
    "education": [
      {
        "schoolName": "Name of the school or university",
        "degree": "Degree obtained (e.g., Bachelor of Science in Computer Science)",
        "startYear": "Start year as 4-digit string (e.g., '2016')",
        "endYear": "End year as 4-digit string (e.g., '2020') or 'Present' if still attending"
      }
    ],
    "workAuthorization": null
  },
  "experiences": [
    {
      "jobTitle": "Job title",
      "company": "Company name",
      "location": "Job location (can be null)",
      "startDate": "Start date in format like 'Jan 2020' or '2020'",
      "endDate": "End date or 'Present' if current role",
      "summary": "Brief role summary or description",
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "skills": {
    "technical": ["Technical skill 1", "Technical skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "domain": ["Domain expertise 1", "Domain expertise 2"],
    "soft": ["Soft skill 1", "Soft skill 2"]
  }
}

Guidelines:
- Extract all work experiences in reverse chronological order (most recent first)
- For each experience, extract any bullet points or achievements as the achievements array
- Categorize skills into technical (programming languages, frameworks), tools (software, platforms), domain (industry knowledge), and soft skills
- If information is not present, use null for optional fields or empty arrays for lists
- Parse dates in a consistent format like "Jan 2020" or just "2020" if only year is available
- The summary should be a brief description of the role, not the bullet points
- For education entries, extract the school name, degree/major, and years attended
- If only graduation year is available, use it as the endYear and leave startYear empty or estimate based on typical program length
- Education entries should be in reverse chronological order (most recent first)
- Include all degrees found (undergraduate, graduate, certifications from educational institutions)`
          },
          {
            role: "user",
            content: `Parse this resume:\n\n${extractedText}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const parsedResult = JSON.parse(completion.choices[0].message.content || "{}");

      res.json(parsedResult);
    } catch (error) {
      console.error("Error parsing resume:", error);
      res.status(500).json({ error: "Failed to parse resume" });
    }
  });

  // AI rewrite section endpoint - rewrites individual resume sections
  app.post("/api/ai/rewrite-section", async (req: Request, res: Response) => {
    try {
      const { sectionType, content, targetRole, jobDescription } = req.body;

      if (!sectionType || !content) {
        return res.status(400).json({ error: "Section type and content are required" });
      }

      const validSectionTypes = ["summary", "bullet", "skills"];
      if (!validSectionTypes.includes(sectionType)) {
        return res.status(400).json({ error: "Invalid section type" });
      }

      let systemPrompt = "";
      let userPrompt = "";

      if (sectionType === "summary") {
        systemPrompt = `You are an expert resume writer. Rewrite the following professional summary to be more impactful, concise, and ATS-friendly. Focus on:
- Strong action-oriented language
- Quantifiable achievements when possible
- Industry-relevant keywords
- Clear value proposition

${targetRole ? `The candidate is targeting: ${targetRole}` : ""}
${jobDescription ? `Target job description context:\n${jobDescription.substring(0, 500)}` : ""}

Return ONLY the rewritten summary text, nothing else. Keep it to 2-4 sentences.`;
        userPrompt = `Rewrite this summary:\n\n${content}`;
      } else if (sectionType === "bullet") {
        systemPrompt = `You are an expert resume writer. Rewrite the following resume bullet point to be more impactful using the STAR method (Situation, Task, Action, Result). Focus on:
- Starting with a strong action verb
- Including quantifiable metrics when possible
- Highlighting impact and results
- Using industry-relevant keywords

${targetRole ? `The candidate is targeting: ${targetRole}` : ""}
${jobDescription ? `Target job description context:\n${jobDescription.substring(0, 500)}` : ""}

Return ONLY the rewritten bullet point text, nothing else. Keep it concise (1-2 lines max).`;
        userPrompt = `Rewrite this bullet point:\n\n${content}`;
      } else if (sectionType === "skills") {
        systemPrompt = `You are an expert resume writer. Suggest additional relevant skills based on the current skills list and context. Focus on:
- Technical skills that complement the existing ones
- Industry-standard tools and technologies
- Soft skills that are commonly valued
- Skills that would improve ATS matching

${targetRole ? `The candidate is targeting: ${targetRole}` : ""}
${jobDescription ? `Target job description context:\n${jobDescription.substring(0, 500)}` : ""}

Return a JSON object with this structure:
{
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "reasoning": "Brief explanation of why these skills were suggested"
}`;
        userPrompt = `Current skills:\n\n${content}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        ...(sectionType === "skills" ? { response_format: { type: "json_object" } } : {})
      });

      const result = completion.choices[0].message.content || "";

      if (sectionType === "skills") {
        const parsed = JSON.parse(result);
        res.json(parsed);
      } else {
        res.json({ rewritten: result.trim() });
      }
    } catch (error) {
      console.error("Error rewriting section:", error);
      res.status(500).json({ error: "Failed to rewrite section" });
    }
  });

  // PDF Generation endpoint
  const pdfGenerationSchema = z.object({
    templateKey: z.string(),
    resumeData: z.object({
      contact: z.object({
        fullName: z.string(),
        headline: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedInUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
      }),
      summary: z.string().optional(),
      experiences: z.array(z.object({
        id: z.string(),
        jobTitle: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        bullets: z.array(z.string()),
      })),
      education: z.array(z.object({
        id: z.string(),
        degree: z.string(),
        institution: z.string(),
        location: z.string().optional(),
        endDate: z.string().optional(),
      })),
      skillGroups: z.array(z.object({
        label: z.string(),
        items: z.array(z.string()),
      })),
      highlights: z.array(z.object({
        title: z.string(),
        bullets: z.array(z.string()),
      })).optional(),
      extraSections: z.array(z.object({
        title: z.string(),
        bullets: z.array(z.string()),
      })).optional(),
    }),
  });

  app.post("/api/resume/pdf", async (req: Request, res: Response) => {
    try {
      const validated = pdfGenerationSchema.parse(req.body);
      const { templateKey, resumeData } = validated;

      // Determine the templates directory path
      const templatesDir = path.join(process.cwd(), "client", "public", "templates");
      const templateDir = path.join(templatesDir, templateKey);

      // Check if template exists
      if (!fs.existsSync(templateDir)) {
        return res.status(404).json({ error: `Template not found: ${templateKey}` });
      }

      // Read template HTML and CSS
      const templateHtml = fs.readFileSync(path.join(templateDir, "template.html"), "utf-8");
      const templateCss = fs.readFileSync(path.join(templateDir, "style.css"), "utf-8");

      // Compile template with Handlebars
      const compiledTemplate = Handlebars.compile(templateHtml);
      const renderedContent = compiledTemplate(resumeData);

      // Build full HTML document
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${resumeData.contact.fullName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${templateCss}
  </style>
</head>
<body>
  ${renderedContent}
</body>
</html>
      `.trim();

      // Launch Puppeteer and generate PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      let pdfBuffer: Uint8Array;
      try {
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        // Generate PDF with letter size
        pdfBuffer = await page.pdf({
          format: 'Letter',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });
      } finally {
        await browser.close();
      }

      // Send PDF as response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="resume-${resumeData.contact.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // ============================================================
  // Job Scout API Endpoints
  // ============================================================

  const { MockProvider } = await import("./jobProviders");
  const { scoreJobsBatch } = await import("./matchingEngine");

  // Helper to get user ID from session (matches Knowledge Engine)
  const getSessionUserId = (req: Request): string | null => {
    return req.session?.linkedInUser?.id || null;
  };

  // Load manual jobs from JSON file
  // Try both paths - source directory and dist directory
  let manualJobsPath = path.join(process.cwd(), "server", "data", "manualJobs.json");
  if (!fs.existsSync(manualJobsPath)) {
    manualJobsPath = path.join(__dirname, "data", "manualJobs.json");
  }
  let manualJobs: import("@shared/schema").ManualJob[] = [];
  try {
    const manualJobsData = fs.readFileSync(manualJobsPath, "utf-8");
    manualJobs = JSON.parse(manualJobsData);
    console.log(`Loaded ${manualJobs.length} manual jobs from ${manualJobsPath}`);
  } catch (err) {
    console.error("Failed to load manual jobs:", err);
  }

  // In-memory cache for job matches (userId -> { jobId -> match })
  const jobMatchCache = new Map<string, Map<string, import("@shared/schema").GeneratedJobMatch>>();

  // Function to generate AI-powered job match
  async function generateJobMatch(
    userId: string,
    job: import("@shared/schema").ManualJob,
    profileData: any
  ): Promise<import("@shared/schema").GeneratedJobMatch> {
    // Check cache first
    const userCache = jobMatchCache.get(userId);
    if (userCache?.has(job.id)) {
      return userCache.get(job.id)!;
    }

    // Build candidate summary from Knowledge Engine profile
    const skills = [
      ...(profileData?.skills?.technical || []),
      ...(profileData?.skills?.tools || []),
      ...(profileData?.skills?.domain || []),
      ...(profileData?.skills?.leadership || []),
    ];
    const experiences = profileData?.experiences || [];
    const goals = profileData?.goals || {};
    const summary = profileData?.careerSnapshot?.summary || "";

    const candidateSummary = `
Career Summary: ${summary}

Skills: ${skills.join(", ")}

Work Experience:
${experiences.map((exp: any) => `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"}): ${exp.bullets?.join("; ") || ""}`).join("\n")}

Career Goals:
- Target Titles: ${goals.targetTitles?.join(", ") || "Not specified"}
- Target Locations: ${goals.targetLocations?.join(", ") || "Not specified"}
- Target Industries: ${goals.targetIndustries?.join(", ") || "Not specified"}
- Desired Level: ${goals.desiredLevel || "Not specified"}
    `.trim();

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a job-matching engine. Given a candidate profile and a job description, analyze the match and return a strict JSON object with these fields:
- overallScore: number (0-100) - overall match percentage
- resumeMatchScore: number (0-100) - how well the resume content matches the job
- jobTitleMatchLevel: "Low" | "Medium" | "High" - how well the candidate's experience aligns with the job title
- experienceMatchCount: number - how many of the candidate's experiences are relevant
- experienceTotalCount: number - total experiences the candidate has
- skillGapsCount: number - number of missing skills
- missingSkills: string[] - array of skills the job requires that the candidate lacks

Consider:
1. Executive roles require strategic thinking, P&L experience, and leadership
2. COO/Operating Partner roles need operational excellence and transformation experience
3. Match skills from both technical and leadership perspectives
4. Be realistic but fair in scoring

Return ONLY valid JSON, no additional text.`
          },
          {
            role: "user",
            content: `Candidate Profile:
${candidateSummary}

Job Posting:
Title: ${job.title}
Company: ${job.companyName}
Location: ${job.location}
Type: ${job.jobType}
Seniority: ${job.seniority}
${job.salaryMin ? `Salary: $${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString() || ""}` : ""}
${job.rateMin ? `Rate: $${job.rateMin} - $${job.rateMax} per ${job.rateUnit}` : ""}

Description:
${job.description}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      const match = JSON.parse(content || "{}") as import("@shared/schema").GeneratedJobMatch;

      // Cache the result
      if (!jobMatchCache.has(userId)) {
        jobMatchCache.set(userId, new Map());
      }
      jobMatchCache.get(userId)!.set(job.id, match);

      return match;
    } catch (error) {
      console.error("Error generating job match:", error);
      // Return a default match on error
      return {
        overallScore: 70,
        resumeMatchScore: 65,
        jobTitleMatchLevel: "Medium",
        experienceMatchCount: 3,
        experienceTotalCount: 5,
        skillGapsCount: 2,
        missingSkills: ["Specific industry experience"],
      };
    }
  }

  // Job Scout endpoint - uses real LinkedIn jobs with AI matching
  app.get("/api/scout/mock-search", async (req: Request, res: Response) => {
    try {
      // Allow unauthenticated access - use session ID or default
      const userId = getSessionUserId(req) || req.sessionID || "anonymous";

      // Get user's Knowledge Engine profile (optional for unauthenticated users)
      let profileData: any = null;
      try {
        const profile = await storage.getKnowledgeProfile(userId);
        profileData = profile?.data as any;
      } catch (e) {
        // Profile not found, continue with default matching
      }

      // Use default profile if none exists
      if (!profileData) {
        profileData = {
          goals: {
            targetTitles: ["Chief Operating Officer", "COO", "VP Operations"],
            targetLocations: ["United States"],
            targetIndustries: ["Finance", "Technology"],
          },
          experience: {
            summary: "Executive with operations and leadership experience",
          },
          skills: ["Operations", "Leadership", "Strategic Planning"],
        };
      }

      // Hardcoded match stats for demo jobs
      const hardcodedMatches: Record<string, { overallScore: number; resumeMatchScore: number; jobTitleMatchLevel: "Low" | "Medium" | "High"; experienceMatchCount: number; experienceTotalCount: number; }> = {
        "coo-hedgefund-chicago": {
          overallScore: 90,
          resumeMatchScore: 90,
          jobTitleMatchLevel: "High",
          experienceMatchCount: 6,
          experienceTotalCount: 7,
        },
        "operating-partner-megafund-us": {
          overallScore: 89,
          resumeMatchScore: 70,
          jobTitleMatchLevel: "Low",
          experienceMatchCount: 5,
          experienceTotalCount: 7,
        },
        "coo-home-decor-nj": {
          overallScore: 88,
          resumeMatchScore: 87,
          jobTitleMatchLevel: "Medium",
          experienceMatchCount: 4,
          experienceTotalCount: 7,
        },
      };

      // Generate matches for all manual jobs
      const jobs: import("@shared/schema").MockJobMatch[] = [];

      for (const manualJob of manualJobs) {
        // Always generate AI match for skill gaps and missing skills
        const aiMatch = await generateJobMatch(userId, manualJob, profileData);
        
        // Override specific values if hardcoded, but keep AI-generated skill gaps/missing skills
        const hardcoded = hardcodedMatches[manualJob.id];
        const match = hardcoded 
          ? { ...aiMatch, ...hardcoded }
          : aiMatch;

        const job: import("@shared/schema").MockJobMatch = {
          id: manualJob.id,
          title: manualJob.title,
          company: manualJob.companyName,
          location: manualJob.location,
          postedAgo: manualJob.postedAgo,
          isRemote: manualJob.isRemote,
          employmentType: manualJob.jobType === "FULL_TIME" ? "Full-time" : "Contract",
          salaryMin: manualJob.salaryMin || undefined,
          salaryMax: manualJob.salaryMax || undefined,
          currency: manualJob.salaryCurrency,
          level: "C-Suite",
          source: "LINKEDIN",
          url: manualJob.sourceUrl,
          descriptionSnippet: manualJob.description.slice(0, 200) + "...",
          descriptionFull: manualJob.description,
          skills: extractSkillsFromDescription(manualJob.description),
          matchScore: match.overallScore,
          resumeMatchScore: match.resumeMatchScore,
          titleMatchLevel: match.jobTitleMatchLevel,
          experienceMatched: `${match.experienceMatchCount}/${match.experienceTotalCount}`,
          skillGapsCount: match.skillGapsCount,
          missingSkills: match.missingSkills,
          industries: manualJob.seniority === "C_LEVEL" ? ["Executive", "Finance", "Operations"] : ["Technology"],
          companySize: "Growth Stage",
          benefits: manualJob.isHybrid ? ["Hybrid Work"] : manualJob.isOnsite ? ["On-site"] : ["Remote"],
        };
        jobs.push(job);
      }

      // Sort by match score descending
      jobs.sort((a, b) => b.matchScore - a.matchScore);

      const avgScore = jobs.length > 0 
        ? Math.round(jobs.reduce((sum, j) => sum + j.matchScore, 0) / jobs.length) 
        : 0;
      const newMatches = jobs.length;

      res.json({
        totalJobs: jobs.length,
        newMatches,
        avgScore,
        jobs,
      });
    } catch (error) {
      console.error("Error in job scout:", error);
      res.status(500).json({ error: "Failed to run job scout" });
    }
  });

  // Helper function to extract skills from job description
  function extractSkillsFromDescription(description: string): string[] {
    const skillKeywords = [
      "P&L", "Strategic Planning", "Operations", "Leadership", "Team Building",
      "Financial Management", "Budgeting", "Forecasting", "KPIs", "Metrics",
      "Transformation", "Scaling", "Change Management", "Cross-functional",
      "Supply Chain", "GTM", "Go-to-Market", "Revenue", "Growth",
      "Private Equity", "Venture Capital", "Fundraising", "Capital Raises",
      "SEC Compliance", "Risk Management", "Vendor Management", "CRM",
      "Data-driven", "Board Reporting", "Executive Presence", "M&A",
      "Portfolio Management", "Value Creation", "Commercial Strategy"
    ];
    
    const found: string[] = [];
    const lowerDesc = description.toLowerCase();
    
    for (const skill of skillKeywords) {
      if (lowerDesc.includes(skill.toLowerCase()) && !found.includes(skill)) {
        found.push(skill);
        if (found.length >= 8) break;
      }
    }
    
    return found.length > 0 ? found : ["Strategic Leadership", "Operations", "Executive Management"];
  }

  // Get job match settings for current user
  app.get("/api/job-scout/settings", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Job Scout" });
      }
      
      // Ensure the user exists in the database (required for foreign key constraint)
      await storage.ensureAnonymousUser(userId);
      
      let settings = await storage.getJobMatchSettings(userId);
      
      // If no settings exist, create defaults from Knowledge Engine profile
      if (!settings) {
        const profile = await storage.getKnowledgeProfile(userId);
        const profileData = profile?.data as any;
        
        settings = await storage.saveJobMatchSettings(userId, {
          targetTitles: profileData?.goals?.targetTitles || [],
          targetLocations: profileData?.goals?.targetLocations || [],
          targetIndustries: profileData?.goals?.targetIndustries || [],
          workArrangement: profileData?.preferences?.remotePreference?.toLowerCase() || null,
          autoRunEnabled: true,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching job match settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update job match settings
  app.patch("/api/job-scout/settings", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Job Scout" });
      }
      await storage.ensureAnonymousUser(userId);
      const settings = await storage.saveJobMatchSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating job match settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Run a job scout - fetches jobs and scores them
  app.post("/api/job-scout/run", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Job Scout" });
      }
      
      // Ensure the user exists in the database (required for foreign key constraint)
      await storage.ensureAnonymousUser(userId);
      
      // Get user's settings and profile
      let settings = await storage.getJobMatchSettings(userId);
      if (!settings) {
        settings = await storage.saveJobMatchSettings(userId, {
          targetTitles: [],
          targetLocations: [],
          autoRunEnabled: true,
        });
      }
      
      const profile = await storage.getKnowledgeProfile(userId);
      if (!profile?.data) {
        return res.status(400).json({ 
          error: "Please complete your Knowledge Engine profile first to enable job matching" 
        });
      }
      
      const profileData = profile.data as any;
      
      // Ensure we have a mock source
      let sources = await storage.getJobSources();
      let mockSource = sources.find(s => s.name === "MockProvider");
      if (!mockSource) {
        mockSource = await storage.createJobSource({
          name: "MockProvider",
          baseUrl: null,
          active: true,
        });
      }
      
      // Initialize the provider
      const provider = new MockProvider();
      provider.initialize(mockSource.id);
      
      // Build search params from settings and profile
      const searchParams = {
        titles: settings.targetTitles?.length ? settings.targetTitles : profileData.goals?.targetTitles || ["software engineer"],
        locations: settings.targetLocations?.length ? settings.targetLocations : profileData.goals?.targetLocations || [],
        remoteStatus: (settings.workArrangement as "remote" | "hybrid" | "onsite" | "any") || "any",
        industries: settings.targetIndustries || [],
        minSalary: settings.minSalary || undefined,
        maxSalary: settings.maxSalary || undefined,
        limit: 15,
      };
      
      // Fetch jobs from provider
      const result = await provider.search(searchParams);
      
      // Convert to scout jobs and save
      const scoutJobsToInsert = result.jobs.map(job => provider.toScoutJob(job));
      const savedJobs = await storage.createScoutJobsBatch(scoutJobsToInsert);
      
      // Score the jobs against the user's profile
      const matches = await scoreJobsBatch(savedJobs, profileData, userId);
      
      // Save the matches
      const savedMatches = await storage.createJobMatchesBatch(matches);
      
      // Update last run time
      await storage.saveJobMatchSettings(userId, { lastRunAt: new Date() });
      
      res.json({
        success: true,
        jobsFound: savedJobs.length,
        matchesCreated: savedMatches.length,
        averageScore: savedMatches.length > 0 
          ? Math.round(savedMatches.reduce((sum, m) => sum + m.matchScore, 0) / savedMatches.length)
          : 0,
      });
    } catch (error) {
      console.error("Error running job scout:", error);
      res.status(500).json({ error: "Failed to run job scout" });
    }
  });

  // Get job matches for current user
  app.get("/api/job-scout/matches", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Job Scout" });
      }
      await storage.ensureAnonymousUser(userId);
      const status = req.query.status as string | undefined;
      const minScore = req.query.minScore ? parseInt(req.query.minScore as string) : undefined;
      
      const matches = await storage.getJobMatches(userId, { status, minScore });
      res.json(matches);
    } catch (error) {
      console.error("Error fetching job matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Get a single job match
  app.get("/api/job-scout/matches/:id", async (req: Request, res: Response) => {
    try {
      const match = await storage.getJobMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      console.error("Error fetching job match:", error);
      res.status(500).json({ error: "Failed to fetch match" });
    }
  });

  // Update a job match (status, notes, etc.)
  app.patch("/api/job-scout/matches/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateJobMatch(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating job match:", error);
      res.status(500).json({ error: "Failed to update match" });
    }
  });

  // Delete/dismiss a job match
  app.delete("/api/job-scout/matches/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteJobMatch(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job match:", error);
      res.status(500).json({ error: "Failed to delete match" });
    }
  });

  // Get match statistics for dashboard
  app.get("/api/job-scout/stats", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Job Scout" });
      }
      await storage.ensureAnonymousUser(userId);
      const allMatches = await storage.getJobMatches(userId);
      
      const stats = {
        total: allMatches.length,
        new: allMatches.filter(m => m.status === "new").length,
        saved: allMatches.filter(m => m.status === "saved").length,
        applied: allMatches.filter(m => m.status === "applied").length,
        interviewing: allMatches.filter(m => m.status === "interviewing").length,
        avgScore: allMatches.length > 0 
          ? Math.round(allMatches.reduce((sum, m) => sum + m.matchScore, 0) / allMatches.length)
          : 0,
        highMatches: allMatches.filter(m => m.matchScore >= 75).length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching match stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ========== Job Application Tracker Routes ==========

  // Get all applications for current user
  app.get("/api/tracker/applications", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Tracker" });
      }
      await storage.ensureAnonymousUser(userId);
      const applications = await storage.getJobApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching tracker applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Create a new application
  app.post("/api/tracker/applications", async (req: Request, res: Response) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Please sign in to use Tracker" });
      }
      await storage.ensureAnonymousUser(userId);
      
      const validated = insertJobApplicationSchema.parse({ ...req.body, userId });
      const application = await storage.createJobApplication(validated);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating tracker application:", error);
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  // Get a single application
  app.get("/api/tracker/applications/:id", async (req: Request, res: Response) => {
    try {
      const application = await storage.getJobApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching tracker application:", error);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  // Update an application
  app.put("/api/tracker/applications/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getJobApplication(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Application not found" });
      }
      const updated = await storage.updateJobApplication(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating tracker application:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // Delete an application
  app.delete("/api/tracker/applications/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getJobApplication(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Application not found" });
      }
      await storage.deleteJobApplication(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tracker application:", error);
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Get events for an application
  app.get("/api/tracker/applications/:id/events", async (req: Request, res: Response) => {
    try {
      const application = await storage.getJobApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      const events = await storage.getApplicationEvents(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching application events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Create an event for an application
  app.post("/api/tracker/applications/:id/events", async (req: Request, res: Response) => {
    try {
      const application = await storage.getJobApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      const validated = insertApplicationEventSchema.parse({ 
        ...req.body, 
        applicationId: req.params.id 
      });
      const event = await storage.createApplicationEvent(validated);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating application event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Beta waitlist signup (public endpoint)
  app.post("/api/beta-waitlist", async (req: Request, res: Response) => {
    try {
      const validated = insertBetaWaitlistSchema.parse(req.body);
      await storage.createBetaWaitlistEntry(validated);
      res.status(201).json({ success: true, message: "Added to waitlist" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Please fill out all fields correctly" });
      }
      console.error("Error adding to waitlist:", error);
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  });

  return httpServer;
}
