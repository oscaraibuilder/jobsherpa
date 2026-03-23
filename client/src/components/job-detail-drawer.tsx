import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  DollarSign,
} from "lucide-react";
import type { MockJobMatch } from "@shared/schema";

interface JobDetailDrawerProps {
  job: MockJobMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onTailorResume: (job: MockJobMatch) => void;
  onSaveWithNotes: (job: MockJobMatch) => void;
  isSaved?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500 text-white";
  if (score >= 60) return "bg-amber-500 text-white";
  return "bg-muted text-muted-foreground";
}

function getTitleMatchColor(level: string) {
  if (level === "High") return "text-emerald-600 dark:text-emerald-400";
  if (level === "Medium") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onTailorResume,
  onSaveWithNotes,
  isSaved = false,
}: JobDetailDrawerProps) {
  if (!job) return null;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.currency || "USD";
    const min = job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k` : "";
    const max = job.salaryMax ? `${(job.salaryMax / 1000).toFixed(0)}k` : "";
    if (min && max) return `${currency} ${min} - ${max}`;
    if (min) return `${currency} ${min}+`;
    if (max) return `Up to ${currency} ${max}`;
    return null;
  };

  const generateWhyFit = () => {
    const reasons = [];
    
    if (job.titleMatchLevel === "High") {
      reasons.push("Matches your target job title family closely");
    } else if (job.titleMatchLevel === "Medium") {
      reasons.push("Related to your target job titles");
    }
    
    if (job.resumeMatchScore >= 80) {
      reasons.push("Your resume strongly aligns with this role's requirements");
    } else if (job.resumeMatchScore >= 60) {
      reasons.push("Good overlap between your experience and job requirements");
    }
    
    if (job.skillGapsCount <= 2) {
      reasons.push("You have most of the required skills for this position");
    }
    
    if (job.isRemote) {
      reasons.push("Offers remote work flexibility matching your preferences");
    }
    
    if (job.salaryMin && job.salaryMin >= 100000) {
      reasons.push("Compensation range aligns with your expectations");
    }
    
    return reasons.slice(0, 3);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold leading-tight">{job.title}</h2>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {job.postedAgo}
              </span>
              {formatSalary() && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {job.isRemote && <Badge variant="secondary">Remote</Badge>}
              <Badge variant="outline">{job.employmentType}</Badge>
              {job.level && <Badge variant="outline">{job.level}</Badge>}
            </div>

            <div className="flex items-center justify-center">
              <div
                className={`flex flex-col items-center justify-center h-24 w-24 rounded-full ${getScoreColor(job.matchScore)}`}
              >
                <span className="text-2xl font-bold">{job.matchScore}%</span>
                <span className="text-xs">Match</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Strengths</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Resume Match: {job.resumeMatchScore}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className={getTitleMatchColor(job.titleMatchLevel)}>
                      Title Match: {job.titleMatchLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Experiences: {job.experienceMatched}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Gaps</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Skill Gaps: {job.skillGapsCount}</span>
                  </div>
                  {job.missingSkills.length > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Missing: {job.missingSkills.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Why This is a Fit
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {generateWhyFit().map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Key Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={job.missingSkills.includes(skill) ? "outline" : "secondary"}
                    className={job.missingSkills.includes(skill) ? "border-amber-500 text-amber-600 dark:text-amber-400" : ""}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Full Description</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {job.descriptionFull}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="shrink-0 pt-4 border-t space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => onTailorResume(job)}
              className="flex-1"
              data-testid="button-drawer-tailor-resume"
            >
              Tailor Resume for This Job
            </Button>
            <Button
              variant="outline"
              onClick={() => onSaveWithNotes(job)}
              className="flex-1"
              data-testid="button-drawer-save-notes"
            >
              {isSaved ? "Edit Notes" : "Save + Add Notes"}
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full gap-2"
            onClick={() => window.open(job.url, "_blank")}
            data-testid="button-drawer-open-posting"
          >
            <ExternalLink className="h-4 w-4" />
            Open Job Posting
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
