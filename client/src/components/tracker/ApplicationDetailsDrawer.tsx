import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileText,
  Mail,
  AlertTriangle,
  Bot,
  Zap,
  User,
  Calendar,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import type { ApplicationStage, AgentMode } from "@shared/schema";
import type { TrackerApplication, DemoTimelineEvent } from "@/data/demoApplications";

interface ApplicationDetailsDrawerProps {
  application: TrackerApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdateStage?: (id: string, stage: ApplicationStage) => void;
}

const stageLabels: Record<ApplicationStage, string> = {
  TO_APPLY: "To Apply",
  APPLYING: "Applying (in progress)",
  APPLICATION_SUBMITTED: "Submitted",
  APPLICATION_CONFIRMED: "Application Confirmed",
  UNDER_REVIEW: "Under Review",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW_STAGE_1: "Interview",
  INTERVIEW_STAGE_2: "Interview",
  INTERVIEW_FINAL: "Final Round",
  OFFER: "Offer",
  OFFER_NEGOTIATION: "Negotiating",
  REJECTED: "Closed – Rejected",
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
  EASY_APPLY: "Easy Apply Agent",
  HARD_WORKING: "Hardworking Agent",
  MANUAL: "Manual + Agent Assist",
};

const AgentIcon = ({ mode }: { mode: AgentMode | null | undefined }) => {
  if (!mode) return <User className="h-4 w-4" />;
  switch (mode) {
    case "EASY_APPLY":
      return <Zap className="h-4 w-4" />;
    case "HARD_WORKING":
      return <Bot className="h-4 w-4" />;
    case "MANUAL":
      return <User className="h-4 w-4" />;
  }
};

const TimelineEventIcon = ({ eventType }: { eventType: string }) => {
  switch (eventType) {
    case "APPLIED":
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "APPLICATION_CONFIRMED":
      return <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "INTERVIEW_SCHEDULED":
    case "INTERVIEW_COMPLETED":
      return <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case "OFFER_RECEIVED":
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "REJECTED":
      return <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export function ApplicationDetailsDrawer({
  application,
  open,
  onOpenChange,
  onDelete,
}: ApplicationDetailsDrawerProps) {
  if (!application) return null;

  const app = application;
  const badges = app.automationBadges || {};
  const timeline = app.timeline || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-xl" data-testid="text-detail-title">
                {app.jobTitle}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                <span>{app.company}</span>
                {app.location && (
                  <>
                    <span>·</span>
                    <MapPin className="h-4 w-4" />
                    <span>{app.location}</span>
                  </>
                )}
              </SheetDescription>
            </div>
            <Badge variant={stageVariants[app.stage]} data-testid="badge-detail-stage">
              {stageLabels[app.stage]}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {app.nextStepText && (
              <Card className="p-4 bg-accent/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Next Action</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {app.nextStepText}
                    </p>
                    {app.nextAction === "PREP_INTERVIEW" && (
                      <Button size="sm" className="mt-3" data-testid="button-add-prep-notes">
                        Add prep notes
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Job Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {app.workType && (
                  <div>
                    <span className="text-muted-foreground">Work Type</span>
                    <p className="font-medium">{app.workType}</p>
                  </div>
                )}
                {app.level && (
                  <div>
                    <span className="text-muted-foreground">Level</span>
                    <p className="font-medium">{app.level}</p>
                  </div>
                )}
                {app.salaryRange && (
                  <div>
                    <span className="text-muted-foreground">Salary</span>
                    <p className="font-medium">{app.salaryRange}</p>
                  </div>
                )}
                {app.matchScore !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Match Score</span>
                    <p className="font-medium">{app.matchScore}%</p>
                  </div>
                )}
              </div>
              {app.jobUrl && (
                <Button variant="outline" size="sm" asChild data-testid="button-view-job-posting">
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    View Job Posting
                  </a>
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Agent & Automation</h4>
              <div className="flex items-center gap-2 text-sm">
                <AgentIcon mode={app.agentMode} />
                <span className="font-medium">
                  {app.agentMode ? agentLabels[app.agentMode] : "No agent assigned"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.resumeTailored && (
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    Resume tailored
                  </Badge>
                )}
                {badges.coverLetterGenerated && (
                  <Badge variant="secondary" className="gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    Cover letter generated
                  </Badge>
                )}
                {badges.formAutoFilled && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    Form auto-filled
                  </Badge>
                )}
                {badges.needsHumanReview && (
                  <Badge variant="secondary" className="gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Needs human review
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Timeline</h4>
              <div className="space-y-0">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 bg-muted rounded-full">
                        <TimelineEventIcon eventType={event.eventType} />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {app.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Notes</h4>
                  <p className="text-sm text-muted-foreground">{app.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-0 border-t flex items-center justify-between gap-3">
          {!app.isDemo && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(app.id)}
              className="text-destructive"
              data-testid="button-delete-application"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-drawer">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
