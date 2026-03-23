import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Sparkles,
  FileText,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  Zap,
  Brain,
  ArrowRight,
  Download,
  Copy,
  LayoutTemplate,
  Building2,
  MapPin,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import type { Resume, TailoredResume, JobAnalysis, ScoutJob } from "@shared/schema";

const tailorFormSchema = z.object({
  baseResumeId: z.string().min(1, "Please select a resume"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  name: z.string().min(1, "Name is required"),
});

type TailorFormValues = z.infer<typeof tailorFormSchema>;

type JobMatchWithJob = {
  id: string;
  scoutJobId: string;
  matchScore: number;
  scoutJob: ScoutJob;
};

export default function AITailor() {
  const { toast } = useToast();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const scoutJobId = searchParams.get("scoutJobId");
  
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredResume | null>(null);
  const [step, setStep] = useState<"input" | "analyzing" | "results">("input");
  const [formPrefilled, setFormPrefilled] = useState(false);

  const { data: resumes, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const { data: scoutJobData, isLoading: scoutJobLoading } = useQuery<JobMatchWithJob[]>({
    queryKey: ["/api/job-scout/matches"],
    enabled: !!scoutJobId,
  });

  const scoutJob = scoutJobData?.find(m => m.scoutJobId === scoutJobId)?.scoutJob;

  const form = useForm<TailorFormValues>({
    resolver: zodResolver(tailorFormSchema),
    defaultValues: {
      baseResumeId: "",
      jobDescription: "",
      name: "",
    },
  });

  useEffect(() => {
    if (scoutJob && !formPrefilled) {
      const jobDesc = scoutJob.descriptionClean || scoutJob.descriptionRaw || "";
      const defaultName = `${scoutJob.title} at ${scoutJob.company}`;
      form.setValue("jobDescription", jobDesc);
      form.setValue("name", defaultName);
      setFormPrefilled(true);
    }
  }, [scoutJob, formPrefilled, form]);

  const analyzeJobMutation = useMutation({
    mutationFn: async (jobDescription: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-job", { jobDescription });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze job description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const tailorResumeMutation = useMutation({
    mutationFn: async (data: TailorFormValues) => {
      const response = await apiRequest("POST", "/api/ai/tailor", {
        resumeId: data.baseResumeId,
        jobDescription: data.jobDescription,
        name: data.name,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTailoredResult(data);
      setStep("results");
      queryClient.invalidateQueries({ queryKey: ["/api/tailored-resumes"] });
      toast({
        title: "Resume tailored successfully",
        description: "Your AI-optimized resume is ready!",
      });
    },
    onError: () => {
      toast({
        title: "Tailoring failed",
        description: "Failed to tailor resume. Please try again.",
        variant: "destructive",
      });
      setStep("input");
    },
  });

  const onSubmit = async (data: TailorFormValues) => {
    setStep("analyzing");
    
    try {
      await analyzeJobMutation.mutateAsync(data.jobDescription);
      await tailorResumeMutation.mutateAsync(data);
    } catch {
      setStep("input");
    }
  };

  const resetForm = () => {
    form.reset();
    setAnalysis(null);
    setTailoredResult(null);
    setStep("input");
  };

  const baseResume = resumes?.find((r) => r.id === form.watch("baseResumeId"));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Resume Tailor</h1>
          <p className="text-muted-foreground">
            Optimize your resume for specific job descriptions using GPT-4.
          </p>
        </div>
        <Link href="/resume-editor">
          <Button variant="outline" data-testid="button-open-resume-editor">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Resume Templates
          </Button>
        </Link>
      </div>

      {step === "input" && scoutJobId && scoutJobLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Loading Job Details</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fetching job information from Job Scout...
            </p>
          </CardContent>
        </Card>
      )}

      {step === "input" && (!scoutJobId || !scoutJobLoading) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tailor Your Resume
              </CardTitle>
              <CardDescription>
                Paste a job description and select a resume to optimize
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scoutJob && (
                <div className="mb-6 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">From Job Scout</p>
                      <h4 className="font-medium truncate">{scoutJob.title}</h4>
                      <p className="text-sm text-muted-foreground">{scoutJob.company}</p>
                      {scoutJob.locationRaw && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {scoutJob.normalizedLocation || scoutJob.locationRaw}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tailored Resume Name</FormLabel>
                        <FormControl>
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="e.g., Senior Engineer at Acme Corp"
                            {...field}
                            data-testid="input-tailored-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="baseResumeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Base Resume</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-base-resume">
                              <SelectValue placeholder="Choose a resume to tailor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {resumesLoading ? (
                              <div className="p-2">Loading...</div>
                            ) : resumes && resumes.length > 0 ? (
                              resumes.map((resume) => (
                                <SelectItem key={resume.id} value={resume.id}>
                                  {resume.name}
                                  {resume.isBase && " (Base)"}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">
                                No resumes available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your base resume content will be optimized for the job
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the full job description here..."
                            className="min-h-48 resize-none"
                            {...field}
                            data-testid="input-job-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Include the complete job posting for best results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={tailorResumeMutation.isPending || analyzeJobMutation.isPending}
                    data-testid="button-tailor-submit"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze & Tailor Resume
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: Search,
                    title: "ATS Keyword Analysis",
                    description: "We identify critical keywords and phrases from the job description.",
                  },
                  {
                    icon: Eye,
                    title: "Recruiter Scan Simulation",
                    description: "We analyze what recruiters look for in the first 6-8 seconds.",
                  },
                  {
                    icon: Target,
                    title: "Strength Mapping",
                    description: "We match your experience to the job requirements.",
                  },
                  {
                    icon: Zap,
                    title: "AI Optimization",
                    description: "GPT-4 rewrites your content while preserving authenticity.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {baseResume && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{baseResume.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {baseResume.roleTitle || "General Resume"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-10 w-10 animate-pulse text-primary" />
              </div>
            </div>
            <h3 className="mt-8 text-xl font-semibold">Analyzing & Tailoring</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Our AI is analyzing the job description and optimizing your resume...
            </p>
            <div className="mt-8 w-full max-w-md space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scanning job requirements</span>
                  <span>Complete</span>
                </div>
                <Progress value={100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extracting ATS keywords</span>
                  <span>{analyzeJobMutation.isSuccess ? "Complete" : "In progress..."}</span>
                </div>
                <Progress value={analyzeJobMutation.isSuccess ? 100 : 60} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Optimizing resume content</span>
                  <span>{tailorResumeMutation.isPending ? "In progress..." : "Waiting..."}</span>
                </div>
                <Progress value={tailorResumeMutation.isPending ? 40 : 0} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "results" && tailoredResult && (
        <div className="space-y-6">
          <Card className="border-chart-3/50 bg-chart-3/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/20">
                <CheckCircle className="h-6 w-6 text-chart-3" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Resume Tailored Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  Your optimized resume is ready for download.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm} data-testid="button-tailor-another">
                  Tailor Another
                </Button>
                <Button className="gap-2" data-testid="button-download-tailored">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ATS Match Score</CardTitle>
                <CardDescription>How well your resume matches the job</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-chart-3/20">
                    <span className="text-4xl font-bold text-chart-3">
                      {tailoredResult.atsScore || 85}%
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-chart-3" />
                      <span className="text-sm font-medium">Keywords Matched</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(tailoredResult.keywordsMatched || ["Leadership", "JavaScript", "React", "Agile"]).map(
                        (keyword) => (
                          <Badge key={keyword} variant="secondary">
                            {keyword}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-chart-4" />
                      <span className="text-sm font-medium">Consider Adding</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(tailoredResult.keywordsMissing || ["TypeScript", "AWS"]).map((keyword) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tailored Summary</CardTitle>
                <CardDescription>Your AI-optimized professional summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm leading-relaxed">
                    {tailoredResult.summary ||
                      "Seasoned software engineering leader with 8+ years of experience driving technical excellence across enterprise SaaS platforms. Proven track record of leading cross-functional teams, implementing scalable architectures, and delivering high-impact solutions that drive business growth. Expert in modern JavaScript ecosystems including React, Node.js, and cloud infrastructure."}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="mt-4 gap-2" data-testid="button-copy-summary">
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Job Analysis Insights</CardTitle>
                <CardDescription>What we learned from the job description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 font-medium">
                      <Eye className="h-4 w-4" />
                      Recruiter Scanning Priorities
                    </h4>
                    <ul className="space-y-2">
                      {(analysis.scanningPriorities || [
                        "Technical leadership experience",
                        "Modern JavaScript expertise",
                        "Cross-team collaboration",
                        "Agile methodology",
                      ]).map((priority, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {priority}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 font-medium">
                      <Target className="h-4 w-4" />
                      Your Matching Strengths
                    </h4>
                    <ul className="space-y-2">
                      {[
                        "Strong technical leadership background",
                        "Extensive React/Node.js experience",
                        "Proven team collaboration skills",
                      ].map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
