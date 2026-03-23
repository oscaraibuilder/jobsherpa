import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import {
  Plus,
  Briefcase,
  Building2,
  MapPin,
  Bot,
  Zap,
  User,
  ExternalLink,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import type {
  JobApplication,
  InsertJobApplication,
  ApplicationStage,
  ApplicationSource,
  AgentMode,
} from "@shared/schema";
import {
  applicationStageValues,
  applicationSourceValues,
  agentModeValues,
} from "@shared/schema";
import { demoApplications, type DemoApplication, type TrackerApplication } from "@/data/demoApplications";
import { ApplicationCard } from "@/components/tracker/ApplicationCard";
import { ApplicationDetailsDrawer } from "@/components/tracker/ApplicationDetailsDrawer";
import { TrackerFilters } from "@/components/tracker/TrackerFilters";

const stageLabels: Record<ApplicationStage, string> = {
  TO_APPLY: "To Apply",
  APPLYING: "Applying",
  APPLICATION_SUBMITTED: "Submitted",
  APPLICATION_CONFIRMED: "Confirmed",
  UNDER_REVIEW: "Under Review",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW_STAGE_1: "Interview 1",
  INTERVIEW_STAGE_2: "Interview 2",
  INTERVIEW_FINAL: "Final Round",
  OFFER: "Offer",
  OFFER_NEGOTIATION: "Negotiating",
  REJECTED: "Rejected",
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

const sourceLabels: Record<ApplicationSource, string> = {
  LINKEDIN: "LinkedIn",
  COMPANY: "Company Site",
  INDEED: "Indeed",
  REFERRAL: "Referral",
  OTHER: "Other",
};

const agentLabels: Record<AgentMode, string> = {
  EASY_APPLY: "Easy Apply",
  HARD_WORKING: "Hardworking Agent",
  MANUAL: "Manual",
};

const AgentIcon = ({ mode }: { mode: AgentMode | null | undefined }) => {
  if (!mode) return <User className="h-3.5 w-3.5" />;
  switch (mode) {
    case "EASY_APPLY":
      return <Zap className="h-3.5 w-3.5" />;
    case "HARD_WORKING":
      return <Bot className="h-3.5 w-3.5" />;
    case "MANUAL":
      return <User className="h-3.5 w-3.5" />;
  }
};

const createApplicationSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  source: z.enum(applicationSourceValues).optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
});

type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

type ViewMode = "card" | "table";

export default function Tracker() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<ApplicationStage | "ALL">("ALL");
  const [agentFilter, setAgentFilter] = useState<AgentMode | "ALL">("ALL");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<TrackerApplication | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const { data: realApplications, isLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/tracker/applications"],
  });

  const isUsingDemoData = !realApplications || realApplications.length === 0;
  
  const applications: TrackerApplication[] = useMemo(() => {
    if (isUsingDemoData) {
      return demoApplications;
    }
    return realApplications.map((app): TrackerApplication => ({
      ...app,
      isDemo: false,
      matchScore: undefined,
      workType: "Full-time",
      level: undefined,
      automationBadges: {
        resumeTailored: app.agentMode !== null,
        coverLetterGenerated: app.agentMode === "HARD_WORKING",
        formAutoFilled: app.agentMode === "HARD_WORKING",
        needsHumanReview: app.stage === "NEEDS_HUMAN_REVIEW",
      },
      nextStepText: app.nextAction ? 
        (app.nextAction === "WAIT_FOR_REPLY" ? "Awaiting reply" :
         app.nextAction === "PREP_INTERVIEW" ? "Prepare for interview" :
         app.nextAction === "SEND_FOLLOWUP" ? "Send follow-up" :
         app.nextAction === "FIX_AGENT_ERROR" ? "Fix agent error" :
         "Complete info") : undefined,
      lastUpdateText: app.updatedAt ? 
        `${Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago` : undefined,
      jobDescriptionSnippet: app.notes?.slice(0, 150),
      timeline: [],
    }));
  }, [realApplications, isUsingDemoData]);

  const form = useForm<CreateApplicationFormData>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      location: "",
      source: undefined,
      jobUrl: "",
      salaryRange: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateApplicationFormData) => {
      const payload: Partial<InsertJobApplication> = {
        jobTitle: data.jobTitle,
        company: data.company,
        location: data.location || undefined,
        source: data.source || undefined,
        jobUrl: data.jobUrl || undefined,
        salaryRange: data.salaryRange || undefined,
        notes: data.notes || undefined,
        stage: "TO_APPLY",
      };
      return apiRequest("POST", "/api/tracker/applications", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/applications"] });
      setAddDialogOpen(false);
      form.reset();
      toast({
        title: "Application added",
        description: "Your job application has been added to the tracker.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tracker/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/applications"] });
      setDetailSheetOpen(false);
      setSelectedApplication(null);
      toast({
        title: "Application deleted",
        description: "The application has been removed from your tracker.",
      });
    },
  });

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      search === "" ||
      app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "ALL" || app.stage === stageFilter;
    const matchesAgent = agentFilter === "ALL" || app.agentMode === agentFilter;
    return matchesSearch && matchesStage && matchesAgent;
  });

  const stageCounts = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleCardClick = (app: TrackerApplication) => {
    setSelectedApplication(app);
    setDetailSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const onSubmit = (data: CreateApplicationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
            Tracker
          </h1>
          <p className="text-muted-foreground">
            Track all your job applications in one place
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-application">
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Track a new job application by entering the details below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Software Engineer"
                          data-testid="input-job-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Google"
                          data-testid="input-company"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., San Francisco, CA"
                            data-testid="input-location"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-source">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {applicationSourceValues.map((source) => (
                              <SelectItem key={source} value={source}>
                                {sourceLabels[source]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="jobUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          data-testid="input-job-url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., $150k - $180k"
                          data-testid="input-salary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any notes about this application..."
                          className="resize-none"
                          data-testid="input-notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? "Adding..." : "Add Application"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isUsingDemoData && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 px-4 py-2 rounded-md">
          <Info className="h-4 w-4" />
          <span>Showing demo data. Add your own applications to see them here.</span>
        </div>
      )}

      <TrackerFilters
        search={search}
        onSearchChange={setSearch}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        agentFilter={agentFilter}
        onAgentFilterChange={setAgentFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stageCounts={stageCounts}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No applications found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || stageFilter !== "ALL" || agentFilter !== "ALL"
                ? "No applications match your filters"
                : "Start tracking your job search by adding your first application"}
            </p>
            {!search && stageFilter === "ALL" && agentFilter === "ALL" && (
              <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Application
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onOpenDetails={() => handleCardClick(app)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Position</TableHead>
                  <TableHead className="w-[180px]">Company</TableHead>
                  <TableHead className="w-[120px]">Stage</TableHead>
                  <TableHead className="w-[120px]">Agent</TableHead>
                  <TableHead className="w-[120px]">Match</TableHead>
                  <TableHead className="w-[150px]">Next Step</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => handleCardClick(app)}
                    data-testid={`row-application-${app.id}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{app.jobTitle}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{app.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stageVariants[app.stage]}>
                        {stageLabels[app.stage]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <AgentIcon mode={app.agentMode} />
                        <span>{app.agentMode ? agentLabels[app.agentMode] : "None"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.matchScore !== undefined ? (
                        <Badge variant="outline">{app.matchScore}%</Badge>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.nextStepText ? (
                        <span className="text-sm text-muted-foreground truncate block max-w-[140px]">
                          {app.nextStepText}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ApplicationDetailsDrawer
        application={selectedApplication}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}
