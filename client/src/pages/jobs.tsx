import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Search,
  Sparkles,
  Target,
  Loader2,
  Play,
  Filter,
  X,
} from "lucide-react";
import type { MockJobMatch, MockSearchResponse } from "@shared/schema";
import { JobCard } from "@/components/job-card";
import { JobFiltersPanel, type JobFilters } from "@/components/job-filters-panel";
import { JobDetailDrawer } from "@/components/job-detail-drawer";
import { SaveNotesModal } from "@/components/save-notes-modal";
import { TailorResumeModal } from "@/components/tailor-resume-modal";

interface KnowledgeProfile {
  careerGoals?: {
    targetTitles?: string[];
    targetLocations?: string[];
    desiredLevel?: string;
    targetIndustries?: string[];
  };
  preferences?: {
    salaryRange?: { min?: number; max?: number };
    workArrangement?: string;
    companySize?: string;
  };
}

interface SavedJob {
  id: string;
  notes: string;
}

export default function Jobs() {
  const { toast } = useToast();
  
  const [mockJobs, setMockJobs] = useState<MockJobMatch[]>([]);
  const [searchStats, setSearchStats] = useState<{ totalJobs: number; newMatches: number; avgScore: number } | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    titles: [],
    locations: [],
    level: "",
    workArrangement: [],
    industries: [],
    minSalary: null,
    companySize: "",
  });
  
  const [selectedJob, setSelectedJob] = useState<MockJobMatch | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveModalJob, setSaveModalJob] = useState<MockJobMatch | null>(null);
  const [tailorModalJob, setTailorModalJob] = useState<MockJobMatch | null>(null);
  
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [hiddenJobIds, setHiddenJobIds] = useState<Set<string>>(new Set());
  const [showHiddenJobs, setShowHiddenJobs] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  const { data: knowledgeProfile } = useQuery<{ data: KnowledgeProfile }>({
    queryKey: ["/api/knowledge-profile"],
  });

  useEffect(() => {
    if (knowledgeProfile?.data) {
      const profile = knowledgeProfile.data;
      const newFilters: Partial<JobFilters> = {};
      
      if (profile.careerGoals?.targetTitles) {
        newFilters.titles = profile.careerGoals.targetTitles;
      }
      if (profile.careerGoals?.targetLocations) {
        newFilters.locations = profile.careerGoals.targetLocations;
      }
      if (profile.careerGoals?.desiredLevel) {
        newFilters.level = profile.careerGoals.desiredLevel.toLowerCase().replace(" ", "-");
      }
      if (profile.careerGoals?.targetIndustries) {
        newFilters.industries = profile.careerGoals.targetIndustries;
      }
      if (profile.preferences?.workArrangement) {
        newFilters.workArrangement = [profile.preferences.workArrangement.toLowerCase()];
      }
      if (profile.preferences?.salaryRange?.min) {
        newFilters.minSalary = profile.preferences.salaryRange.min;
      }
      if (profile.preferences?.companySize) {
        newFilters.companySize = profile.preferences.companySize;
      }
      
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
  }, [knowledgeProfile]);

  const runScoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/scout/mock-search");
      return response.json() as Promise<MockSearchResponse>;
    },
    onSuccess: (data) => {
      setMockJobs(data.jobs);
      setSearchStats({
        totalJobs: data.totalJobs,
        newMatches: data.newMatches,
        avgScore: data.avgScore,
      });
      if (hasLoadedInitially) {
        toast({
          title: "Scout Complete",
          description: `Found ${data.totalJobs} jobs with ${data.newMatches} new matches.`,
        });
      }
      setHasLoadedInitially(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Scout Failed",
        description: error.message || "Failed to run job scout. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!hasLoadedInitially && !runScoutMutation.isPending) {
      runScoutMutation.mutate();
    }
  }, []);

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      if (!showHiddenJobs && hiddenJobIds.has(job.id)) return false;
      
      if (filters.titles.length > 0) {
        const titleMatch = filters.titles.some(title => 
          job.title.toLowerCase().includes(title.toLowerCase())
        );
        if (!titleMatch) return false;
      }
      
      if (filters.locations.length > 0) {
        const locationMatch = filters.locations.some(loc => 
          job.location.toLowerCase().includes(loc.toLowerCase()) ||
          (job.isRemote && loc.toLowerCase().includes("remote"))
        );
        if (!locationMatch) return false;
      }
      
      if (filters.level) {
        const levelMap: Record<string, string[]> = {
          "ic": ["IC"],
          "senior-ic": ["Senior IC"],
          "manager": ["Manager"],
          "director": ["Director"],
          "vp": ["VP"],
          "c-suite": ["C-Suite"],
        };
        const validLevels = levelMap[filters.level] || [];
        if (job.level && !validLevels.includes(job.level)) return false;
      }
      
      if (filters.workArrangement.length > 0) {
        const isRemoteFilter = filters.workArrangement.includes("remote");
        if (isRemoteFilter && !job.isRemote) return false;
      }
      
      if (filters.minSalary && job.salaryMax && job.salaryMax < filters.minSalary) {
        return false;
      }
      
      return true;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [mockJobs, filters, hiddenJobIds, showHiddenJobs]);

  const handleViewDetails = (job: MockJobMatch) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const handleTailorResume = (job: MockJobMatch) => {
    setTailorModalJob(job);
  };

  const handleSaveWithNotes = (job: MockJobMatch) => {
    setSaveModalJob(job);
  };

  const handleToggleHide = (job: MockJobMatch) => {
    const isCurrentlyHidden = hiddenJobIds.has(job.id);
    setHiddenJobIds(prev => {
      const next = new Set(prev);
      if (next.has(job.id)) {
        next.delete(job.id);
      } else {
        next.add(job.id);
      }
      return next;
    });
    toast({
      title: isCurrentlyHidden ? "Job Restored" : "Job Hidden",
      description: isCurrentlyHidden 
        ? `${job.title} at ${job.company} has been restored.`
        : `${job.title} at ${job.company} has been hidden from results.`,
    });
  };

  const handleSaveJob = (jobId: string, notes: string) => {
    setSavedJobs(prev => {
      const existing = prev.find(s => s.id === jobId);
      if (existing) {
        return prev.map(s => s.id === jobId ? { ...s, notes } : s);
      }
      return [...prev, { id: jobId, notes }];
    });
    toast({
      title: "Job Saved",
      description: "Job has been saved with your notes.",
    });
  };

  const isJobSaved = (jobId: string) => savedJobs.some(s => s.id === jobId);
  const getJobNotes = (jobId: string) => savedJobs.find(s => s.id === jobId)?.notes || "";

  const profileSummaryPills = useMemo(() => {
    const pills: string[] = [];
    if (filters.titles.length > 0) {
      pills.push(`Titles: ${filters.titles.slice(0, 2).join(", ")}${filters.titles.length > 2 ? ` +${filters.titles.length - 2}` : ""}`);
    }
    if (filters.locations.length > 0) {
      pills.push(`Locations: ${filters.locations.slice(0, 2).join(", ")}${filters.locations.length > 2 ? ` +${filters.locations.length - 2}` : ""}`);
    }
    if (filters.level) {
      pills.push(`Level: ${filters.level.replace("-", " ")}`);
    }
    if (filters.workArrangement.length > 0) {
      pills.push(`Work: ${filters.workArrangement.join(", ")}`);
    }
    if (filters.minSalary) {
      pills.push(`Min Salary: $${(filters.minSalary / 1000).toFixed(0)}k`);
    }
    return pills;
  }, [filters]);

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {showFilters && (
        <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r bg-background p-4 overflow-auto">
          <div className="flex items-center justify-between gap-2 mb-4 lg:hidden">
            <h2 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(false)}
              data-testid="button-hide-filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <JobFiltersPanel
            initialFilters={filters}
            onFiltersChange={setFilters}
            onRunScout={() => runScoutMutation.mutate()}
            isLoading={runScoutMutation.isPending}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="border-b bg-background p-4 lg:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Search className="h-6 w-6" />
                Job Scout
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered job matches based on your Knowledge Engine profile
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hiddenJobIds.size > 0 && (
                <Button
                  variant={showHiddenJobs ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowHiddenJobs(!showHiddenJobs)}
                  data-testid="button-toggle-hidden"
                >
                  {showHiddenJobs ? "Hide Hidden Jobs" : `Show ${hiddenJobIds.size} Hidden`}
                </Button>
              )}
              {!showFilters && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className="gap-2"
                  data-testid="button-show-filters"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              )}
              <Button
                onClick={() => runScoutMutation.mutate()}
                disabled={runScoutMutation.isPending}
                className="gap-2"
                data-testid="button-run-scout"
              >
                {runScoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run Scout
              </Button>
            </div>
          </div>

          {profileSummaryPills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profileSummaryPills.map((pill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {pill}
                </Badge>
              ))}
            </div>
          )}

          {searchStats && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Scout complete.</span>{" "}
                Found <span className="font-semibold">{searchStats.totalJobs}</span> jobs,{" "}
                <span className="font-semibold">{searchStats.newMatches}</span> new matches.{" "}
                Average match score: <span className="font-semibold">{searchStats.avgScore}%</span>
              </p>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 lg:p-6">
            {runScoutMutation.isPending ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Running Scout...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredJobs.length} of {mockJobs.length} jobs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={isJobSaved(job.id)}
                      isHidden={hiddenJobIds.has(job.id)}
                      onViewDetails={handleViewDetails}
                      onTailorResume={handleTailorResume}
                      onSaveWithNotes={handleSaveWithNotes}
                      onToggleHide={handleToggleHide}
                    />
                  ))}
                </div>
              </div>
            ) : mockJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">No matches yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Job Scout finds and matches jobs to your skills and experience. 
                  Click "Run Scout" to find jobs that match your profile, or set up your 
                  Knowledge Engine first for better results.
                </p>
                <div className="mt-6 flex flex-col gap-3 items-center">
                  <Button
                    onClick={() => runScoutMutation.mutate()}
                    disabled={runScoutMutation.isPending}
                    className="gap-2"
                    data-testid="button-run-scout-empty"
                  >
                    {runScoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Run Scout
                  </Button>
                  <Link href="/knowledge-engine">
                    <Button variant="ghost" className="gap-2 text-sm" data-testid="link-knowledge-engine">
                      <Sparkles className="h-4 w-4" />
                      Set up Knowledge Engine
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">No strong matches</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  No jobs match your current filters. Try broadening your titles, 
                  locations, or salary range.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setShowFilters(true)}
                  data-testid="button-adjust-filters"
                >
                  Adjust Filters
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <JobDetailDrawer
        job={selectedJob}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onTailorResume={handleTailorResume}
        onSaveWithNotes={handleSaveWithNotes}
        isSaved={selectedJob ? isJobSaved(selectedJob.id) : false}
      />

      <SaveNotesModal
        job={saveModalJob}
        isOpen={!!saveModalJob}
        onClose={() => setSaveModalJob(null)}
        onSave={handleSaveJob}
        existingNotes={saveModalJob ? getJobNotes(saveModalJob.id) : ""}
      />

      <TailorResumeModal
        job={tailorModalJob}
        isOpen={!!tailorModalJob}
        onClose={() => setTailorModalJob(null)}
      />
    </div>
  );
}
