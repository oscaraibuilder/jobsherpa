import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
  Mail,
  AlertTriangle,
  Bot,
  Zap,
  User,
} from "lucide-react";
import type { ApplicationStage, AgentMode } from "@shared/schema";
import type { TrackerApplication } from "@/data/demoApplications";

interface ApplicationCardProps {
  application: TrackerApplication | {
    id: string;
    jobTitle: string;
    company: string;
    location?: string | null;
    stage: ApplicationStage;
    agentMode?: AgentMode | null;
    salaryRange?: string | null;
    jobUrl?: string | null;
    notes?: string | null;
    appliedAt?: Date | null;
    matchScore?: number;
    workType?: string;
    level?: string;
    automationBadges?: {
      resumeTailored?: boolean;
      coverLetterGenerated?: boolean;
      formAutoFilled?: boolean;
      needsHumanReview?: boolean;
    };
    nextStepText?: string;
    lastUpdateText?: string;
    jobDescriptionSnippet?: string;
    isDemo?: boolean;
  };
  onOpenDetails: () => void;
}

const stageLabels: Record<ApplicationStage, string> = {
  TO_APPLY: "To Apply",
  APPLYING: "Applying",
  APPLICATION_SUBMITTED: "Submitted",
  APPLICATION_CONFIRMED: "Confirmed",
  UNDER_REVIEW: "Under Review",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW_STAGE_1: "Interview",
  INTERVIEW_STAGE_2: "Interview",
  INTERVIEW_FINAL: "Final Round",
  OFFER: "Offer",
  OFFER_NEGOTIATION: "Negotiating",
  REJECTED: "Closed",
  AGENT_FAILED: "Agent Failed",
  NEEDS_HUMAN_REVIEW: "Needs Review",
};

type StageVariant = "default" | "secondary" | "destructive" | "outline";

const stageVariants: Record<ApplicationStage, StageVariant> = {
  TO_APPLY: "secondary",
  APPLYING: "outline",
  APPLICATION_SUBMITTED: "outline",
  APPLICATION_CONFIRMED: "outline",
  UNDER_REVIEW: "secondary",
  RECRUITER_SCREEN: "secondary",
  INTERVIEW_STAGE_1: "default",
  INTERVIEW_STAGE_2: "default",
  INTERVIEW_FINAL: "default",
  OFFER: "default",
  OFFER_NEGOTIATION: "default",
  REJECTED: "destructive",
  AGENT_FAILED: "destructive",
  NEEDS_HUMAN_REVIEW: "secondary",
};

const agentLabels: Record<AgentMode, string> = {
  EASY_APPLY: "Easy Apply",
  HARD_WORKING: "Hardworking Agent",
  MANUAL: "Manual",
};

const AgentIcon = ({ mode }: { mode: AgentMode | null | undefined }) => {
  if (!mode) return <User className="h-3 w-3" />;
  switch (mode) {
    case "EASY_APPLY":
      return <Zap className="h-3 w-3" />;
    case "HARD_WORKING":
      return <Bot className="h-3 w-3" />;
    case "MANUAL":
      return <User className="h-3 w-3" />;
  }
};

export function ApplicationCard({ application, onOpenDetails }: ApplicationCardProps) {
  const app = application;
  const badges = app.automationBadges || {};

  return (
    <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer" onClick={onOpenDetails}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate" data-testid={`text-job-title-${app.id}`}>
              {app.jobTitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{app.company}</span>
              {app.location && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{app.location}</span>
                </>
              )}
            </div>
          </div>
          <Badge
            variant={stageVariants[app.stage]}
            className="flex-shrink-0"
            data-testid={`badge-stage-${app.id}`}
          >
            {stageLabels[app.stage]}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {app.workType && (
            <Badge variant="outline" className="text-xs font-normal">
              {app.workType}
            </Badge>
          )}
          {app.level && (
            <Badge variant="outline" className="text-xs font-normal">
              {app.level}
            </Badge>
          )}
          {app.salaryRange && (
            <Badge variant="outline" className="text-xs font-normal">
              {app.salaryRange}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <AgentIcon mode={app.agentMode} />
            <span>
              {app.agentMode ? `Agent: ${agentLabels[app.agentMode]}` : "No agent"}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {badges.resumeTailored && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                Resume tailored
              </Badge>
            )}
            {badges.coverLetterGenerated && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <FileText className="h-3 w-3 text-green-600 dark:text-green-400" />
                Cover letter
              </Badge>
            )}
            {badges.formAutoFilled && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <Mail className="h-3 w-3 text-green-600 dark:text-green-400" />
                Form auto-filled
              </Badge>
            )}
            {badges.needsHumanReview && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                Needs review
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {app.lastUpdateText && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {app.lastUpdateText}
              </span>
            )}
            {app.nextStepText && (
              <span className="truncate">
                Next: {app.nextStepText}
              </span>
            )}
          </div>
          {app.matchScore !== undefined && (
            <Badge variant="outline" className="text-xs font-medium">
              {app.matchScore}% Match
            </Badge>
          )}
        </div>

        {app.jobDescriptionSnippet && (
          <p className="text-xs text-muted-foreground line-clamp-2 border-t pt-2">
            {app.jobDescriptionSnippet}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {app.jobUrl && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid={`button-view-posting-${app.id}`}
            >
              <a href={app.jobUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View posting
              </a>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            data-testid={`button-open-details-${app.id}`}
          >
            Open details
          </Button>
        </div>
      </div>
    </Card>
  );
}
