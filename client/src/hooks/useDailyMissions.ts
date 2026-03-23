import { useState, useEffect } from "react";
import { useDashboardStats } from "./useDashboardStats";

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  cta: string;
  ctaLink: string;
  completed: boolean;
}

export function useDailyMissions() {
  const stats = useDashboardStats();
  
  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    const saved = localStorage.getItem("jobsherpa-daily-missions-completed");
    const data = saved ? JSON.parse(saved) : { date: "", missions: [] };
    const today = new Date().toDateString();
    return data.date === today ? data.missions : [];
  });

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(
      "jobsherpa-daily-missions-completed",
      JSON.stringify({ date: today, missions: completedMissions })
    );
  }, [completedMissions]);

  // TODO: Move mission generation logic to backend
  const generateMissions = (): Mission[] => {
    const missions: Mission[] = [];

    // Mission 1: Apply to a matched role
    if (stats.totalApplications < 5) {
      missions.push({
        id: "apply-match",
        title: "Apply to 1 matched role above 70%",
        description: "Find a role that matches your skills and apply with a tailored resume.",
        icon: "target",
        xp: 20,
        cta: "View top matches",
        ctaLink: "/jobs",
        completed: completedMissions.includes("apply-match"),
      });
    }

    // Mission 2: Tailor a resume
    if (stats.totalResumes > 0) {
      missions.push({
        id: "tailor-resume",
        title: "Tailor 1 resume for a target role",
        description: "Customize your resume to match a specific job description.",
        icon: "sparkles",
        xp: 25,
        cta: "Open Resume Center",
        ctaLink: "/tailor",
        completed: completedMissions.includes("tailor-resume"),
      });
    }

    // Mission 3: Follow up with recruiter
    if (stats.underReviewCount > 0) {
      missions.push({
        id: "follow-up",
        title: "Follow up with 1 recruiter",
        description: "Check in on an application that's been under review.",
        icon: "mail",
        xp: 15,
        cta: "View applications",
        ctaLink: "/tracker",
        completed: completedMissions.includes("follow-up"),
      });
    }

    // Mission 4: Upload base resume (if none exists)
    if (stats.totalResumes === 0) {
      missions.push({
        id: "upload-resume",
        title: "Upload your base resume",
        description: "Get started by adding your first resume to the knowledge engine.",
        icon: "document",
        xp: 30,
        cta: "Upload Resume",
        ctaLink: "/knowledge",
        completed: completedMissions.includes("upload-resume"),
      });
    }

    // Mission 5: Review Apply Agent submissions
    missions.push({
      id: "review-agent",
      title: "Review Apply Agent submissions",
      description: "Check if the Apply Agent needs your approval on any applications.",
      icon: "robot",
      xp: 10,
      cta: "Open Apply Agent",
      ctaLink: "/apply",
      completed: completedMissions.includes("review-agent"),
    });

    return missions.slice(0, 3);
  };

  const toggleMission = (missionId: string) => {
    setCompletedMissions((prev) =>
      prev.includes(missionId)
        ? prev.filter((id) => id !== missionId)
        : [...prev, missionId]
    );
  };

  return {
    missions: generateMissions(),
    toggleMission,
    isLoading: stats.isLoading,
  };
}
