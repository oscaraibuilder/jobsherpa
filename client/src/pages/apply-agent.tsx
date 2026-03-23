import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { ApplyAgentSettings, Resume, CommonQuestion, PortalAccount } from "@shared/schema";
import { 
  Bot, 
  Zap, 
  Briefcase, 
  User, 
  Settings, 
  HelpCircle, 
  Plus, 
  Trash2,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

const EASY_APPLY_SITES = ["LinkedIn", "Greenhouse", "Lever", "Workday", "Indeed", "Glassdoor"];

const AUTONOMY_LABELS = [
  { level: 0, label: "Review All", description: "Review every application before submission" },
  { level: 1, label: "Auto-fill Only", description: "Auto-fill forms but wait for your approval" },
  { level: 2, label: "Fully Autonomous", description: "Apply automatically when confidence is high" },
];

const WORK_AUTH_OPTIONS = [
  "US Citizen",
  "Green Card Holder",
  "H1B Visa",
  "OPT/CPT",
  "TN Visa",
  "Other Work Visa",
  "Require Sponsorship",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR"];

const QUESTION_CATEGORIES = [
  { value: "WORK_AUTH", label: "Work Authorization" },
  { value: "RELOCATION", label: "Relocation" },
  { value: "SALARY", label: "Salary" },
  { value: "DEMOGRAPHIC", label: "Demographic" },
  { value: "OTHER", label: "Other" },
];

const DEFAULT_QUESTIONS: Omit<CommonQuestion, "id">[] = [
  { label: "Are you authorized to work in the US?", value: "", category: "WORK_AUTH", applyAutomatically: true },
  { label: "Do you require visa sponsorship?", value: "", category: "WORK_AUTH", applyAutomatically: true },
  { label: "Are you willing to relocate?", value: "", category: "RELOCATION", applyAutomatically: true },
  { label: "What is your expected salary?", value: "", category: "SALARY", applyAutomatically: false },
];

export default function ApplyAgent() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<ApplyAgentSettings>>({
    activeModes: [],
    fullName: "",
    email: "",
    phone: "",
    primaryLocation: "",
    workAuthorization: "",
    sponsorshipNeeded: false,
    currentCountry: "",
    defaultResumeId: "",
    minSalary: undefined,
    currency: "USD",
    relocationOpen: false,
    remoteOnly: false,
    notesForHiringManager: "",
    easyApplyEnabled: false,
    easyApplyMaxAppsPerDay: 10,
    easyApplyAutonomyLevel: 0,
    easyApplyAllowedSites: ["LinkedIn", "Greenhouse", "Lever"],
    hardAgentEnabled: false,
    hardAgentMaxAppsPerWeek: 5,
    hardAgentAutonomyLevel: 0,
    hardAgentAllowedPortals: [],
    portalAccounts: [],
    commonQuestions: [],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<ApplyAgentSettings>({
    queryKey: ["/api/apply-agent/settings"],
    enabled: !!user,
  });

  const { data: resumes } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        portalAccounts: (settings.portalAccounts as PortalAccount[]) || [],
        commonQuestions: (settings.commonQuestions as CommonQuestion[]) || [],
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ApplyAgentSettings>) => {
      const response = await apiRequest("PUT", "/api/apply-agent/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apply-agent/settings"] });
      toast({
        title: "Settings saved",
        description: "Your Apply Agent settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const updateField = <K extends keyof ApplyAgentSettings>(field: K, value: ApplyAgentSettings[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEasyApplySite = (site: string) => {
    const current = formData.easyApplyAllowedSites || [];
    const updated = current.includes(site)
      ? current.filter(s => s !== site)
      : [...current, site];
    updateField("easyApplyAllowedSites", updated);
  };

  const addCommonQuestion = () => {
    const newQuestion: CommonQuestion = {
      id: crypto.randomUUID(),
      label: "",
      value: "",
      category: "OTHER",
      applyAutomatically: false,
    };
    const current = (formData.commonQuestions as CommonQuestion[]) || [];
    updateField("commonQuestions", [...current, newQuestion] as any);
  };

  const updateCommonQuestion = (id: string, field: keyof CommonQuestion, value: any) => {
    const current = (formData.commonQuestions as CommonQuestion[]) || [];
    const updated = current.map(q => q.id === id ? { ...q, [field]: value } : q);
    updateField("commonQuestions", updated as any);
  };

  const removeCommonQuestion = (id: string) => {
    const current = (formData.commonQuestions as CommonQuestion[]) || [];
    updateField("commonQuestions", current.filter(q => q.id !== id) as any);
  };

  const seedDefaultQuestions = () => {
    const existing = (formData.commonQuestions as CommonQuestion[]) || [];
    const newQuestions: CommonQuestion[] = DEFAULT_QUESTIONS.map(q => ({
      ...q,
      id: crypto.randomUUID(),
    }));
    updateField("commonQuestions", [...existing, ...newQuestions] as any);
  };

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
          <div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  const questions = (formData.commonQuestions as CommonQuestion[]) || [];
  const easyApplyEnabled = formData.easyApplyEnabled || false;
  const hardAgentEnabled = formData.hardAgentEnabled || false;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
              Apply Agent
            </h1>
            <Badge variant="secondary" data-testid="badge-beta">Beta</Badge>
          </div>
          <p className="text-muted-foreground">
            Automate your job applications with AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`overflow-visible ${easyApplyEnabled ? 'ring-2 ring-primary' : ''}`}
              data-testid="card-easy-apply"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Easy Apply Agent</CardTitle>
                      <CardDescription className="text-sm">Quick 1-click applications</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={easyApplyEnabled}
                    onCheckedChange={(checked) => updateField("easyApplyEnabled", checked)}
                    data-testid="switch-easy-apply"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {AUTONOMY_LABELS[formData.easyApplyAutonomyLevel || 0].label}
                  </Badge>
                  {(formData.easyApplyAllowedSites || []).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {(formData.easyApplyAllowedSites || []).length} sites
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`overflow-visible ${hardAgentEnabled ? 'ring-2 ring-primary' : ''}`}
              data-testid="card-hard-working"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 shrink-0">
                      <Briefcase className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Hard-Working Agent</CardTitle>
                      <CardDescription className="text-sm">Full portal applications</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={hardAgentEnabled}
                    onCheckedChange={(checked) => updateField("hardAgentEnabled", checked)}
                    data-testid="switch-hard-working"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {AUTONOMY_LABELS[formData.hardAgentAutonomyLevel || 0].label}
                  </Badge>
                  {((formData.portalAccounts as PortalAccount[]) || []).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {((formData.portalAccounts as PortalAccount[]) || []).length} portals
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Accordion type="multiple" defaultValue={["profile", "preferences"]} className="space-y-4">
            <AccordionItem value="profile" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4" data-testid="accordion-profile">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Global Applicant Profile</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName || ""}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-full-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@example.com"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryLocation">Primary Location</Label>
                    <Input
                      id="primaryLocation"
                      value={formData.primaryLocation || ""}
                      onChange={(e) => updateField("primaryLocation", e.target.value)}
                      placeholder="San Francisco, CA"
                      data-testid="input-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workAuth">Work Authorization</Label>
                    <Select
                      value={formData.workAuthorization || ""}
                      onValueChange={(value) => updateField("workAuthorization", value)}
                    >
                      <SelectTrigger id="workAuth" data-testid="select-work-auth">
                        <SelectValue placeholder="Select authorization" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_AUTH_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentCountry">Current Country</Label>
                    <Input
                      id="currentCountry"
                      value={formData.currentCountry || ""}
                      onChange={(e) => updateField("currentCountry", e.target.value)}
                      placeholder="United States"
                      data-testid="input-country"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                      id="sponsorship"
                      checked={formData.sponsorshipNeeded || false}
                      onCheckedChange={(checked) => updateField("sponsorshipNeeded", !!checked)}
                      data-testid="checkbox-sponsorship"
                    />
                    <Label htmlFor="sponsorship" className="font-normal">
                      I require visa sponsorship
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="preferences" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4" data-testid="accordion-preferences">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Application Preferences</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultResume">Default Resume</Label>
                    <Select
                      value={formData.defaultResumeId || ""}
                      onValueChange={(value) => updateField("defaultResumeId", value)}
                    >
                      <SelectTrigger id="defaultResume" data-testid="select-resume">
                        <SelectValue placeholder="Select a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {(resumes || []).map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="minSalary">Minimum Salary</Label>
                      <Input
                        id="minSalary"
                        type="number"
                        value={formData.minSalary || ""}
                        onChange={(e) => updateField("minSalary", e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="80000"
                        data-testid="input-salary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency || "USD"}
                        onValueChange={(value) => updateField("currency", value)}
                      >
                        <SelectTrigger id="currency" data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="remoteOnly"
                      checked={formData.remoteOnly || false}
                      onCheckedChange={(checked) => updateField("remoteOnly", !!checked)}
                      data-testid="checkbox-remote"
                    />
                    <Label htmlFor="remoteOnly" className="font-normal">
                      Remote positions only
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="relocation"
                      checked={formData.relocationOpen || false}
                      onCheckedChange={(checked) => updateField("relocationOpen", !!checked)}
                      data-testid="checkbox-relocation"
                    />
                    <Label htmlFor="relocation" className="font-normal">
                      Open to relocation
                    </Label>
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label htmlFor="notes">Notes for Hiring Manager</Label>
                    <Textarea
                      id="notes"
                      value={formData.notesForHiringManager || ""}
                      onChange={(e) => updateField("notesForHiringManager", e.target.value)}
                      placeholder="Any additional information you'd like to include in your applications..."
                      className="min-h-[80px]"
                      data-testid="textarea-notes"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="easyApply" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4" data-testid="accordion-easy-apply">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Easy Apply Agent Settings</span>
                  {easyApplyEnabled && (
                    <Badge variant="secondary" className="text-xs ml-2">Enabled</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-sm">Enable Easy Apply Agent</p>
                      <p className="text-sm text-muted-foreground">Apply to jobs with 1-click applications</p>
                    </div>
                    <Switch
                      checked={easyApplyEnabled}
                      onCheckedChange={(checked) => updateField("easyApplyEnabled", checked)}
                      data-testid="switch-easy-apply-section"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <Label>Autonomy Level</Label>
                      <span className="text-sm font-medium">
                        {AUTONOMY_LABELS[formData.easyApplyAutonomyLevel || 0].label}
                      </span>
                    </div>
                    <Slider
                      value={[formData.easyApplyAutonomyLevel || 0]}
                      onValueChange={([value]) => updateField("easyApplyAutonomyLevel", value as 0 | 1 | 2)}
                      min={0}
                      max={2}
                      step={1}
                      className="w-full"
                      data-testid="slider-easy-autonomy"
                    />
                    <p className="text-sm text-muted-foreground">
                      {AUTONOMY_LABELS[formData.easyApplyAutonomyLevel || 0].description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAppsDay">Max Applications Per Day</Label>
                    <Input
                      id="maxAppsDay"
                      type="number"
                      value={formData.easyApplyMaxAppsPerDay || 10}
                      onChange={(e) => updateField("easyApplyMaxAppsPerDay", parseInt(e.target.value) || 0)}
                      min={0}
                      max={100}
                      data-testid="input-max-apps-day"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Allowed Sites</Label>
                    <div className="flex flex-wrap gap-2">
                      {EASY_APPLY_SITES.map((site) => {
                        const isSelected = (formData.easyApplyAllowedSites || []).includes(site);
                        return (
                          <Badge
                            key={site}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer toggle-elevate ${isSelected ? 'toggle-elevated' : ''}`}
                            onClick={() => toggleEasyApplySite(site)}
                            data-testid={`badge-site-${site.toLowerCase()}`}
                          >
                            {site}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hardWorking" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4" data-testid="accordion-hard-working">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  <span>Hard-Working Agent Settings</span>
                  {hardAgentEnabled && (
                    <Badge variant="secondary" className="text-xs ml-2">Enabled</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-sm">Enable Hard-Working Agent</p>
                      <p className="text-sm text-muted-foreground">Complete full application forms on job portals</p>
                    </div>
                    <Switch
                      checked={hardAgentEnabled}
                      onCheckedChange={(checked) => updateField("hardAgentEnabled", checked)}
                      data-testid="switch-hard-working-section"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <Label>Autonomy Level</Label>
                      <span className="text-sm font-medium">
                        {AUTONOMY_LABELS[formData.hardAgentAutonomyLevel || 0].label}
                      </span>
                    </div>
                    <Slider
                      value={[formData.hardAgentAutonomyLevel || 0]}
                      onValueChange={([value]) => updateField("hardAgentAutonomyLevel", value as 0 | 1 | 2)}
                      min={0}
                      max={2}
                      step={1}
                      className="w-full"
                      data-testid="slider-hard-autonomy"
                    />
                    <p className="text-sm text-muted-foreground">
                      {AUTONOMY_LABELS[formData.hardAgentAutonomyLevel || 0].description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAppsWeek">Max Applications Per Week</Label>
                    <Input
                      id="maxAppsWeek"
                      type="number"
                      value={formData.hardAgentMaxAppsPerWeek || 5}
                      onChange={(e) => updateField("hardAgentMaxAppsPerWeek", parseInt(e.target.value) || 0)}
                      min={0}
                      max={50}
                      data-testid="input-max-apps-week"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Portal Accounts</Label>
                    <p className="text-sm text-muted-foreground">
                      Add login credentials for job portals (stored securely).
                    </p>
                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        <div className="text-center text-sm text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Portal account management coming soon.</p>
                          <p className="text-xs mt-1">You'll be able to add credentials for Workday, Taleo, and other ATS portals.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="questions" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4" data-testid="accordion-questions">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Common Form Questions</span>
                  {questions.length > 0 && (
                    <Badge variant="secondary" className="text-xs ml-2">{questions.length}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pre-fill common application questions. The agent will use these answers automatically.
                  </p>

                  {questions.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground mb-3">No questions configured yet.</p>
                        <Button variant="outline" size="sm" onClick={seedDefaultQuestions} data-testid="button-seed-questions">
                          Add Default Questions
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q) => (
                        <div key={q.id} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <Input
                              value={q.label}
                              onChange={(e) => updateCommonQuestion(q.id, "label", e.target.value)}
                              placeholder="Question"
                              className="flex-1"
                              data-testid={`input-question-label-${q.id}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCommonQuestion(q.id)}
                              data-testid={`button-remove-question-${q.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={q.value}
                            onChange={(e) => updateCommonQuestion(q.id, "value", e.target.value)}
                            placeholder="Your answer"
                            data-testid={`input-question-value-${q.id}`}
                          />
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <Select
                              value={q.category}
                              onValueChange={(value) => updateCommonQuestion(q.id, "category", value)}
                            >
                              <SelectTrigger className="w-40" data-testid={`select-question-category-${q.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {QUESTION_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`auto-${q.id}`}
                                checked={q.applyAutomatically}
                                onCheckedChange={(checked) => updateCommonQuestion(q.id, "applyAutomatically", !!checked)}
                                data-testid={`checkbox-auto-${q.id}`}
                              />
                              <Label htmlFor={`auto-${q.id}`} className="text-sm font-normal">
                                Apply automatically
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={addCommonQuestion} data-testid="button-add-question">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-6 px-6 -mb-6">
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-save"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4 overflow-visible" data-testid="card-ai-preview">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">How Apply Agent will behave</CardTitle>
                  <CardDescription className="text-sm">Based on your settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                {!easyApplyEnabled && !hardAgentEnabled ? (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>No agents enabled. Enable at least one agent to start automating applications.</span>
                  </div>
                ) : (
                  <>
                    {easyApplyEnabled && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                        <span>
                          Easy Apply: Up to {formData.easyApplyMaxAppsPerDay || 10} apps/day on{" "}
                          {(formData.easyApplyAllowedSites || []).slice(0, 3).join(", ")}
                          {(formData.easyApplyAllowedSites || []).length > 3 && ` +${(formData.easyApplyAllowedSites || []).length - 3} more`}
                        </span>
                      </div>
                    )}
                    {hardAgentEnabled && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
                        <span>
                          Hard-Working: Up to {formData.hardAgentMaxAppsPerWeek || 5} full applications/week
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>
                        Autonomy: {easyApplyEnabled 
                          ? AUTONOMY_LABELS[formData.easyApplyAutonomyLevel || 0].label 
                          : AUTONOMY_LABELS[formData.hardAgentAutonomyLevel || 0].label}
                      </span>
                    </div>
                    {formData.fullName && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>Applying as: {formData.fullName}</span>
                      </div>
                    )}
                    {formData.minSalary && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>Min salary: {formData.currency || "USD"} {formData.minSalary.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.remoteOnly && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>Remote positions only</span>
                      </div>
                    )}
                    {questions.length > 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{questions.filter(q => q.applyAutomatically).length} auto-answered questions</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {(easyApplyEnabled || hardAgentEnabled) && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-3">Example matched job:</p>
                    <Card className="border-dashed">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">Senior Product Manager</p>
                            <p className="text-xs text-muted-foreground">Acme Corp - San Francisco, CA</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">95% Match</Badge>
                              {easyApplyEnabled && (
                                <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Easy Apply
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Bot className="h-4 w-4" />
                      <span>Agent will {AUTONOMY_LABELS[formData.easyApplyAutonomyLevel || 0].description.toLowerCase()}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
