import { Building2, MapPin, Clock, CheckCircle, AlertTriangle, Eye, EyeOff, Bookmark, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MockJobMatch } from "@shared/schema";

interface JobCardProps {
  job: MockJobMatch;
  isSaved?: boolean;
  isHidden?: boolean;
  onViewDetails: (job: MockJobMatch) => void;
  onTailorResume: (job: MockJobMatch) => void;
  onSaveWithNotes: (job: MockJobMatch) => void;
  onToggleHide: (job: MockJobMatch) => void;
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

export function JobCard({
  job,
  isSaved = false,
  isHidden = false,
  onViewDetails,
  onTailorResume,
  onSaveWithNotes,
  onToggleHide,
}: JobCardProps) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return "Salary Not Listed";
    const currency = job.currency || "USD";
    const min = job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k` : "";
    const max = job.salaryMax ? `${(job.salaryMax / 1000).toFixed(0)}k` : "";
    if (min && max) return `${currency} ${min} - ${max}`;
    if (min) return `${currency} ${min}+`;
    if (max) return `Up to ${currency} ${max}`;
    return "Salary Not Listed";
  };

  const displayMissingSkills = () => {
    if (!job.missingSkills || job.missingSkills.length === 0) return "None";
    return job.missingSkills[0] + (job.missingSkills.length > 1 ? ` +${job.missingSkills.length - 1}` : "");
  };

  return (
    <Card className={`relative group overflow-visible h-full flex flex-col ${isHidden ? "opacity-60" : ""}`} data-testid={`job-card-${job.id}`}>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-end gap-1 mb-2 h-6">
          {isSaved && (
            <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500 mr-auto" />
          )}
          {isHidden && (
            <Badge variant="secondary" className="text-xs mr-auto">Hidden</Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide(job);
                }}
                data-testid={`button-hide-job-${job.id}`}
              >
                {isHidden ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isHidden ? "Restore" : "Hide"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide(job);
                }}
                data-testid={`button-ignore-job-${job.id}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ignore</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">{job.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{job.company}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{job.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {job.postedAgo}
              </span>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-sm ${getScoreColor(job.matchScore)}`}
              >
                {job.matchScore}%
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Overall match score based on your Knowledge Engine profile</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3 min-h-[28px]">
          {job.isRemote && (
            <Badge variant="secondary" className="text-xs">
              Remote
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {job.employmentType}
          </Badge>
          {job.level && (
            <Badge variant="outline" className="text-xs">
              {job.level}
            </Badge>
          )}
        </div>

        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {formatSalary()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm mt-4 h-[72px]">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              Resume: <span className="font-medium text-emerald-600 dark:text-emerald-400">{job.resumeMatchScore}%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">
              Gaps: <span className="font-medium text-amber-600 dark:text-amber-400">{job.skillGapsCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              Title: <span className={`font-medium ${getTitleMatchColor(job.titleMatchLevel)}`}>{job.titleMatchLevel}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate text-muted-foreground">
              Missing: <span className="font-medium">{displayMissingSkills()}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              Exp: <span className="font-medium">{job.experienceMatched}</span>
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-3 h-10">{job.descriptionSnippet}</p>

        <button
          onClick={() => onViewDetails(job)}
          className="text-sm text-primary hover:underline mt-2 text-left"
          data-testid={`link-view-details-${job.id}`}
        >
          View full job description
        </button>

        <div className="flex flex-col gap-2 mt-auto pt-3">
          <Button
            onClick={() => onTailorResume(job)}
            className="w-full"
            data-testid={`button-tailor-resume-${job.id}`}
          >
            Tailor & Apply
          </Button>
          <Button
            variant="outline"
            onClick={() => onSaveWithNotes(job)}
            className="w-full"
            data-testid={`button-save-notes-${job.id}`}
          >
            {isSaved ? "Edit Notes" : "Save for Later"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
