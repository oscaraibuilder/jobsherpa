import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Plus,
  Upload,
  Trash2,
  Edit,
  Star,
  Clock,
  CheckCircle,
  Download,
} from "lucide-react";
import type { Resume, Experience } from "@shared/schema";

const resumeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleTitle: z.string().optional(),
  summary: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export default function ResumeBuilder() {
  const { toast } = useToast();
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const { data: experiences } = useQuery<Experience[]>({
    queryKey: ["/api/resumes", selectedResume?.id, "experiences"],
    queryFn: async () => {
      const response = await fetch(`/api/resumes/${selectedResume?.id}/experiences`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch experiences");
      return response.json();
    },
    enabled: !!selectedResume,
  });

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      name: "",
      roleTitle: "",
      summary: "",
    },
  });

  const createResumeMutation = useMutation({
    mutationFn: async (data: ResumeFormValues) => {
      return apiRequest("POST", "/api/resumes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Resume created",
        description: "Your new resume has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      if (selectedResume) {
        setSelectedResume(null);
      }
      toast({
        title: "Resume deleted",
        description: "The resume has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const setBaseMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/resumes/${id}`, { isBase: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Base resume set",
        description: "This resume will be used as your default for tailoring.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set base resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResumeFormValues) => {
    createResumeMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">
            Manage your resumes and build your knowledge base.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-resume">
              <Plus className="h-4 w-4" />
              Create Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Resume</DialogTitle>
              <DialogDescription>
                Add a new resume to your collection. You can edit the details later.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer Resume"
                          {...field}
                          data-testid="input-resume-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Role</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Software Engineer"
                          {...field}
                          data-testid="input-role-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief overview of your experience and goals..."
                          className="min-h-24 resize-none"
                          {...field}
                          data-testid="input-summary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createResumeMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createResumeMutation.isPending ? "Creating..." : "Create Resume"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Resumes
              </CardTitle>
              <CardDescription>
                Select a resume to view and edit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : resumes && resumes.length > 0 ? (
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`group relative cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedResume?.id === resume.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover-elevate"
                      }`}
                      onClick={() => setSelectedResume(resume)}
                      data-testid={`resume-card-${resume.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{resume.name}</p>
                            {resume.isBase && (
                              <Badge variant="secondary" className="shrink-0">
                                <Star className="mr-1 h-3 w-3" />
                                Base
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {resume.roleTitle || "No target role set"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {resume.updatedAt
                            ? new Date(resume.updatedAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first resume to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedResume ? (
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{selectedResume.name}</CardTitle>
                  <CardDescription>
                    {selectedResume.roleTitle || "No target role specified"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!selectedResume.isBase && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBaseMutation.mutate(selectedResume.id)}
                      disabled={setBaseMutation.isPending}
                      data-testid="button-set-base"
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Set as Base
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-download-resume"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteResumeMutation.mutate(selectedResume.id)}
                    disabled={deleteResumeMutation.isPending}
                    data-testid="button-delete-resume"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary" data-testid="tab-summary">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="experience" data-testid="tab-experience">
                      Experience
                    </TabsTrigger>
                    <TabsTrigger value="skills" data-testid="tab-skills">
                      Skills
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="mt-6 space-y-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-6">
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                        Professional Summary
                      </h3>
                      <p className="text-sm leading-relaxed">
                        {selectedResume.summary ||
                          "No summary added yet. Click edit to add a professional summary."}
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2" data-testid="button-edit-summary">
                      <Edit className="h-4 w-4" />
                      Edit Summary
                    </Button>
                  </TabsContent>
                  <TabsContent value="experience" className="mt-6 space-y-4">
                    {experiences && experiences.length > 0 ? (
                      <div className="space-y-4">
                        {experiences.map((exp) => (
                          <div
                            key={exp.id}
                            className="rounded-lg border border-border p-4"
                            data-testid={`experience-item-${exp.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{exp.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {exp.company}
                                  {exp.location && ` • ${exp.location}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                                {exp.bullets.map((bullet, idx) => (
                                  <li key={idx}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                          No experience entries yet.
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="gap-2" data-testid="button-add-experience">
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </TabsContent>
                  <TabsContent value="skills" className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL"].map(
                        (skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                    <Button variant="outline" className="gap-2" data-testid="button-manage-skills">
                      <Edit className="h-4 w-4" />
                      Manage Skills
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Select a Resume</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  Choose a resume from the list to view and edit its content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
