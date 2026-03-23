import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { KnowledgeEngineState, LinkedInImportPayload, WorkRole, SkillItem, SkillCategory, ParsedResumePayload, EducationEntry } from "@/types/knowledgeEngine";
import { defaultKnowledgeState } from "@/types/knowledgeEngine";

interface LinkedInUser {
  name?: string;
  fullName?: string;
  email?: string;
  picture?: string;
  avatarUrl?: string;
  locale?: { country?: string; language?: string };
}

interface KnowledgeEngineContextValue {
  state: KnowledgeEngineState;
  isLoading: boolean;
  isInitialized: boolean;
  updateState: (partial: Partial<KnowledgeEngineState>) => void;
  applyLinkedInImport: (payload: LinkedInImportPayload) => void;
  applyParsedResume: (payload: ParsedResumePayload) => void;
  setLinkedInUser: (user: LinkedInUser) => void;
  disconnectLinkedIn: () => Promise<void>;
  refreshLinkedIn: () => Promise<void>;
}

const KnowledgeEngineContext = createContext<KnowledgeEngineContextValue | null>(null);

export function KnowledgeEngineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<KnowledgeEngineState>(defaultKnowledgeState);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<KnowledgeEngineState>(defaultKnowledgeState);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isInitializedRef.current = isInitialized;
  }, [isInitialized]);

  const saveKnowledgeStateToServer = useCallback(async () => {
    if (!isInitializedRef.current) {
      return;
    }
    try {
      await fetch("/api/knowledge-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateRef.current }),
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to save knowledge state:", error);
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveKnowledgeStateToServer();
    }, 500);
  }, [saveKnowledgeStateToServer]);

  const loadKnowledgeStateFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/knowledge-engine", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        }
      }
    } catch (error) {
      console.error("Failed to load knowledge state:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadKnowledgeStateFromServer();
  }, [loadKnowledgeStateFromServer]);

  const updateState = useCallback((partial: Partial<KnowledgeEngineState>) => {
    if (!isInitializedRef.current) {
      console.warn("updateState called before initialization, ignoring");
      return;
    }
    setState(prev => ({ ...prev, ...partial }));
    scheduleSave();
  }, [scheduleSave]);

  const applyLinkedInImport = useCallback((payload: LinkedInImportPayload) => {
    if (!isInitializedRef.current) {
      console.warn("applyLinkedInImport called before initialization, ignoring");
      return;
    }
    setState(prev => {
      const newIdentity = {
        fullName: payload.profile.fullName || prev.identity.fullName,
        headline: payload.profile.headline || prev.identity.headline,
        location: payload.profile.location || prev.identity.location,
        yearsExperience: payload.profile.yearsExperience || prev.identity.yearsExperience || "15+ years",
        workAuthorization: prev.identity.workAuthorization,
      };

      const newWorkRoles: WorkRole[] = payload.positions.map((p, index) => {
        const existingRole = prev.workHistory.find(
          r => r.title === p.title && r.company === p.company && r.startDate === p.startDate
        );
        return {
          id: existingRole?.id || `li-${index}`,
          title: p.title,
          company: p.company,
          location: p.location ?? "",
          startDate: p.startDate ?? "",
          endDate: p.endDate ?? "",
          summary: p.description ?? "",
          achievements: existingRole?.achievements || [],
        };
      });

      const existingRoles = prev.workHistory.filter(existingRole => {
        return !newWorkRoles.some(
          newRole => newRole.title === existingRole.title && 
                     newRole.company === existingRole.company && 
                     newRole.startDate === existingRole.startDate
        );
      });

      const mergedWorkHistory = [...newWorkRoles, ...existingRoles];

      const newSkills: SkillItem[] = payload.skills.map((skillName, index) => ({
        id: `li-skill-${index}`,
        name: skillName,
        category: "Domain" as SkillCategory,
      }));

      const existingSkillNames = new Set(prev.skills.map(s => s.name.toLowerCase()));
      const uniqueNewSkills = newSkills.filter(s => !existingSkillNames.has(s.name.toLowerCase()));
      const mergedSkills = [...prev.skills, ...uniqueNewSkills];

      const newLinkedInProfile = {
        name: payload.profile.fullName,
        headline: payload.profile.headline,
        location: payload.profile.location,
        profileUrl: prev.linkedInProfile?.profileUrl || "https://linkedin.com/in/profile",
        lastSynced: "Just now",
        picture: prev.linkedInProfile?.picture,
        email: prev.linkedInProfile?.email,
        locale: prev.linkedInProfile?.locale,
      };

      return {
        ...prev,
        identity: newIdentity,
        workHistory: mergedWorkHistory,
        skills: mergedSkills,
        linkedInProfile: newLinkedInProfile,
      };
    });
    scheduleSave();
  }, [scheduleSave]);

  const applyParsedResume = useCallback((payload: ParsedResumePayload) => {
    if (!isInitializedRef.current) {
      console.warn("applyParsedResume called before initialization, ignoring");
      return;
    }
    setState(prev => {
      const parsedEducation: EducationEntry[] = (payload.profile.education || []).map((edu, index) => ({
        id: `parsed-edu-${index}-${Date.now()}`,
        schoolName: edu.schoolName || "",
        degree: edu.degree || "",
        startYear: edu.startYear ?? "",
        endYear: edu.endYear ?? "",
      }));

      const existingEducation = prev.identity.education || [];
      const getEducationKey = (e: { schoolName: string; degree: string }) => 
        `${e.schoolName.toLowerCase().trim()}|${e.degree.toLowerCase().trim()}`;
      
      const parsedEducationMap = new Map(parsedEducation.map(e => [getEducationKey(e), e]));
      
      const updatedExistingEducation = existingEducation.map(existing => {
        const key = getEducationKey(existing);
        const parsed = parsedEducationMap.get(key);
        if (parsed) {
          parsedEducationMap.delete(key);
          return {
            ...existing,
            schoolName: parsed.schoolName || existing.schoolName,
            degree: parsed.degree || existing.degree,
            startYear: parsed.startYear || existing.startYear,
            endYear: parsed.endYear || existing.endYear,
          };
        }
        return existing;
      });
      
      const newEducationEntries = Array.from(parsedEducationMap.values());
      const mergedEducation = [...updatedExistingEducation, ...newEducationEntries];

      const newIdentity = {
        fullName: payload.profile.fullName || prev.identity.fullName,
        headline: payload.profile.headline || prev.identity.headline,
        location: payload.profile.location || prev.identity.location,
        yearsExperience: prev.identity.yearsExperience,
        education: mergedEducation.length > 0 ? mergedEducation : prev.identity.education,
        workAuthorization: payload.profile.workAuthorization || prev.identity.workAuthorization,
      };

      const newWorkRoles: WorkRole[] = payload.experiences.map((exp, index) => {
        const existingRole = prev.workHistory.find(
          r => r.title === exp.jobTitle && r.company === exp.company
        );
        return {
          id: existingRole?.id || `parsed-${index}`,
          title: exp.jobTitle,
          company: exp.company,
          location: exp.location ?? "",
          startDate: exp.startDate ?? "",
          endDate: exp.endDate ?? "",
          summary: exp.summary ?? "",
          achievements: exp.achievements?.map((text, i) => ({
            id: `parsed-ach-${index}-${i}`,
            text,
          })) || existingRole?.achievements || [],
        };
      });

      const existingRoles = prev.workHistory.filter(existingRole => {
        return !newWorkRoles.some(
          newRole => newRole.title === existingRole.title && 
                     newRole.company === existingRole.company
        );
      });

      const mergedWorkHistory = [...newWorkRoles, ...existingRoles];

      const allSkills = [
        ...payload.skills.technical.map(name => ({ name, category: "Technical" as SkillCategory })),
        ...payload.skills.tools.map(name => ({ name, category: "Tools" as SkillCategory })),
        ...payload.skills.domain.map(name => ({ name, category: "Domain" as SkillCategory })),
        ...payload.skills.soft.map(name => ({ name, category: "Soft" as SkillCategory })),
      ];

      const newSkills: SkillItem[] = allSkills.map((skill, index) => ({
        id: `parsed-skill-${index}`,
        name: skill.name,
        category: skill.category,
      }));

      const existingSkillNames = new Set(prev.skills.map(s => s.name.toLowerCase()));
      const uniqueNewSkills = newSkills.filter(s => !existingSkillNames.has(s.name.toLowerCase()));
      const mergedSkills = [...prev.skills, ...uniqueNewSkills];

      return {
        ...prev,
        identity: newIdentity,
        workHistory: mergedWorkHistory,
        skills: mergedSkills,
      };
    });
    scheduleSave();
  }, [scheduleSave]);

  const setLinkedInUser = useCallback((user: LinkedInUser, updateLastSynced?: string) => {
    if (!isInitializedRef.current) {
      console.warn("setLinkedInUser called before initialization, ignoring");
      return;
    }
    setState(prev => {
      const existingProfile = prev.linkedInProfile;
      const isNewConnection = !existingProfile;
      
      const userName = user.fullName || user.name || "";
      const userPicture = user.avatarUrl || user.picture || "";
      
      return {
        ...prev,
        identity: {
          ...prev.identity,
          fullName: userName || prev.identity.fullName,
        },
        linkedInProfile: {
          name: userName,
          headline: existingProfile?.headline || (isNewConnection ? prev.identity.headline : "") || "LinkedIn User",
          location: existingProfile?.location || (isNewConnection ? prev.identity.location : "") || "",
          profileUrl: existingProfile?.profileUrl || "",
          lastSynced: updateLastSynced || "Just now",
          picture: userPicture,
          email: user.email ?? existingProfile?.email,
          locale: user.locale ?? existingProfile?.locale,
        },
      };
    });
    scheduleSave();
  }, [scheduleSave]);

  const disconnectLinkedIn = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (!res.ok) {
        console.error("Failed to disconnect LinkedIn: server returned", res.status);
      }
    } catch (error) {
      console.error("Failed to disconnect LinkedIn:", error);
    } finally {
      updateState({ linkedInProfile: null });
    }
  }, [updateState]);

  const refreshLinkedIn = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        console.error("Failed to refresh LinkedIn: server returned", res.status);
        return;
      }
      const data = await res.json();
      if (data.user) {
        setLinkedInUser(data.user, "a few seconds ago");
      }
    } catch (error) {
      console.error("Failed to refresh LinkedIn:", error);
    }
  }, [setLinkedInUser]);

  return (
    <KnowledgeEngineContext.Provider
      value={{
        state,
        isLoading,
        isInitialized,
        updateState,
        applyLinkedInImport,
        applyParsedResume,
        setLinkedInUser,
        disconnectLinkedIn,
        refreshLinkedIn,
      }}
    >
      {children}
    </KnowledgeEngineContext.Provider>
  );
}

export function useKnowledgeEngine() {
  const context = useContext(KnowledgeEngineContext);
  if (!context) {
    throw new Error("useKnowledgeEngine must be used within a KnowledgeEngineProvider");
  }
  return context;
}
