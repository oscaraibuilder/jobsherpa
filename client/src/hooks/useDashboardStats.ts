import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { Resume, Application, TailoredResume, Job } from "@shared/schema";

export interface DashboardStats {
  applicationsThisWeek: number;
  recruiterRepliesThisWeek: number;
  interviewsThisWeek: number;
  profileCompletionPercent: number;
  momentumScore: number;
  totalApplications: number;
  totalResumes: number;
  totalInterviews: number;
  totalOffers: number;
  underReviewCount: number;
  newResponsesThisWeek: number;
  journeySteps: {
    id: string;
    title: string;
    description: string;
    icon: string;
    status: "locked" | "current" | "completed";
  }[];
  completedJourneySteps: number;
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuth();

  const { data: resumes, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: tailoredResumes, isLoading: tailoredLoading } = useQuery<TailoredResume[]>({
    queryKey: ["/api/tailored-resumes"],
  });

  const { data: trackerApps } = useQuery<any[]>({
    queryKey: ["/api/tracker/applications"],
  });

  const isLoading = resumesLoading || applicationsLoading || tailoredLoading;

  // Calculate stats from available data
  const totalResumes = resumes?.length || 0;
  const totalApplications = (applications?.length || 0) + (trackerApps?.length || 0);
  
  const interviewApplications = [
    ...(applications?.filter(a => a.status === "interviewing") || []),
    ...(trackerApps?.filter((a: any) => a.stage === "Interviewing") || []),
  ];
  const totalInterviews = interviewApplications.length;

  const offerApplications = [
    ...(applications?.filter(a => a.status === "offered" || a.status === "accepted") || []),
    ...(trackerApps?.filter((a: any) => a.stage === "Offer" || a.stage === "Hired") || []),
  ];
  const totalOffers = offerApplications.length;

  const underReviewApps = [
    ...(applications?.filter(a => a.status === "reviewing" || a.status === "applied") || []),
    ...(trackerApps?.filter((a: any) => a.stage === "Applied" || a.stage === "Under Review") || []),
  ];
  const underReviewCount = underReviewApps.length;

  // TODO: Calculate actual weekly stats from timestamps
  const applicationsThisWeek = Math.min(totalApplications, 4);
  const recruiterRepliesThisWeek = Math.min(underReviewCount, 2);
  const interviewsThisWeek = Math.min(totalInterviews, 1);
  const newResponsesThisWeek = recruiterRepliesThisWeek;

  // Profile completion
  const hasBaseResume = totalResumes > 0;
  const hasInboxConnected = false; // TODO: Check settings for email integration
  const hasApplyAgentConfigured = false; // TODO: Check apply agent settings
  const hasFirstApplication = totalApplications > 0;
  const hasInterview = totalInterviews > 0;
  const hasOffer = totalOffers > 0;

  const profileChecks = [hasBaseResume, true, true]; // base checks
  const profileCompletionPercent = Math.round(
    (profileChecks.filter(Boolean).length / profileChecks.length) * 100
  );

  // Momentum Score calculation
  const momentumScore = Math.min(
    100,
    Math.round(
      applicationsThisWeek * 10 +
      recruiterRepliesThisWeek * 15 +
      interviewsThisWeek * 20 +
      profileCompletionPercent * 0.3
    )
  );

  // Journey Steps
  const journeySteps = [
    {
      id: "basecamp",
      title: "Basecamp",
      description: "Upload base resume",
      icon: "document",
      status: hasBaseResume ? "completed" : "current",
    },
    {
      id: "camp1",
      title: "Camp I",
      description: "Connect inbox",
      icon: "mail",
      status: hasBaseResume ? (hasInboxConnected ? "completed" : "current") : "locked",
    },
    {
      id: "camp2",
      title: "Camp II",
      description: "Configure Apply Agent",
      icon: "robot",
      status: hasInboxConnected ? (hasApplyAgentConfigured ? "completed" : "current") : "locked",
    },
    {
      id: "camp3",
      title: "Camp III",
      description: "Track first application",
      icon: "checklist",
      status: hasApplyAgentConfigured ? (hasFirstApplication ? "completed" : "current") : "locked",
    },
    {
      id: "summit-push",
      title: "Summit Push",
      description: "First interview",
      icon: "video",
      status: hasFirstApplication ? (hasInterview ? "completed" : "current") : "locked",
    },
    {
      id: "summit",
      title: "Summit",
      description: "First offer recorded",
      icon: "trophy",
      status: hasInterview ? (hasOffer ? "completed" : "current") : "locked",
    },
  ] as DashboardStats["journeySteps"];

  const completedJourneySteps = journeySteps.filter(s => s.status === "completed").length;

  return {
    applicationsThisWeek,
    recruiterRepliesThisWeek,
    interviewsThisWeek,
    profileCompletionPercent,
    momentumScore,
    totalApplications,
    totalResumes,
    totalInterviews,
    totalOffers,
    underReviewCount,
    newResponsesThisWeek,
    journeySteps,
    completedJourneySteps,
    isLoading,
  };
}
