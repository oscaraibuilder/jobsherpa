import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Download, Sparkles, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { type ResumeData, type ResumeTemplateKey, type ResumeExperience, type ResumeEducation, type ResumeSkillGroup, RESUME_TEMPLATES, getDefaultResumeData } from "@/types/resume";
import { buildResumeDataFromKnowledgeEngine, isKnowledgeEngineSufficient } from "@/utils/knowledgeToResume";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { renderFullResumeHtml } from "@/utils/templateRenderer";

function getTemplateFromUrl(): ResumeTemplateKey {
  const params = new URLSearchParams(window.location.search);
  const template = params.get("template");
  const validKeys = RESUME_TEMPLATES.map(t => t.key);
  if (template && validKeys.includes(template as ResumeTemplateKey)) {
    return template as ResumeTemplateKey;
  }
  return "classic-sidebar";
}

function generateId(): string {
  return crypto.randomUUID();
}

export default function ResumeEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { state: knowledgeState } = useKnowledgeEngine();
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateKey>(getTemplateFromUrl);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  const hasSufficientData = isKnowledgeEngineSufficient(knowledgeState);

  const initialData: ResumeData = hasSufficientData
    ? buildResumeDataFromKnowledgeEngine(knowledgeState, selectedTemplate)
    : {
        ...getDefaultResumeData(selectedTemplate),
        contact: {
          fullName: "Your Name",
          headline: "Your Professional Headline",
          email: "email@example.com",
          phone: "(555) 123-4567",
          location: "City, State",
        },
        summary: "Add your professional summary here. Describe your experience, skills, and what you bring to the table.",
        experiences: [
          {
            id: "sample-1",
            jobTitle: "Job Title",
            company: "Company Name",
            location: "City, State",
            startDate: "Jan 2020",
            endDate: "Present",
            bullets: [
              "Achievement or responsibility description",
              "Another accomplishment with metrics if possible",
            ],
          },
        ],
        education: [
          {
            id: "edu-1",
            degree: "Degree Name",
            institution: "University Name",
            endDate: "2020",
          },
        ],
        skillGroups: [
          { label: "Technical", items: ["Skill 1", "Skill 2", "Skill 3"] },
          { label: "Domain", items: ["Domain Skill 1", "Domain Skill 2"] },
        ],
        highlights: [
          {
            title: "Key Achievements",
            bullets: ["Notable achievement 1", "Notable achievement 2"],
          },
        ],
      };

  const [resumeData, setResumeData] = useState<ResumeData>(initialData);

  const updatePreview = useCallback(async () => {
    setIsLoadingPreview(true);
    try {
      const html = await renderFullResumeHtml(selectedTemplate, resumeData);
      setPreviewHtml(html);
    } catch (error) {
      console.error("Failed to render preview:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [selectedTemplate, resumeData]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);


  const rewriteSectionMutation = useMutation({
    mutationFn: async (params: { sectionType: string; content: string; targetRole?: string }) => {
      const response = await apiRequest("POST", "/api/ai/rewrite-section", params);
      return response.json();
    },
  });

  const handleContactChange = (field: keyof typeof resumeData.contact, value: string) => {
    setResumeData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleSummaryChange = (value: string) => {
    setResumeData(prev => ({ ...prev, summary: value }));
  };

  const handleRewriteSummary = async () => {
    if (!resumeData.summary) return;
    try {
      const result = await rewriteSectionMutation.mutateAsync({
        sectionType: "summary",
        content: resumeData.summary,
        targetRole: resumeData.targetRoleTitle,
      });
      setResumeData(prev => ({ ...prev, summary: result.rewritten }));
      toast({ title: "Summary rewritten", description: "Your summary has been improved with AI." });
    } catch {
      toast({ title: "Error", description: "Failed to rewrite summary.", variant: "destructive" });
    }
  };

  const handleExperienceChange = (id: string, field: keyof ResumeExperience, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleAddExperience = () => {
    const newExp: ResumeExperience = {
      id: generateId(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const handleBulletChange = (expId: string, bulletIndex: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIndex] = value;
        return { ...exp, bullets: newBullets };
      })
    }));
  };

  const handleAddBullet = (expId: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ""] } : exp
      )
    }));
  };

  const handleRemoveBullet = (expId: string, bulletIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id !== expId) return exp;
        const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
        return { ...exp, bullets: newBullets.length > 0 ? newBullets : [""] };
      })
    }));
  };

  const handleRewriteBullet = async (expId: string, bulletIndex: number) => {
    const exp = resumeData.experiences.find(e => e.id === expId);
    if (!exp || !exp.bullets[bulletIndex]) return;

    try {
      const result = await rewriteSectionMutation.mutateAsync({
        sectionType: "bullet",
        content: exp.bullets[bulletIndex],
        targetRole: resumeData.targetRoleTitle,
      });
      handleBulletChange(expId, bulletIndex, result.rewritten);
      toast({ title: "Bullet rewritten", description: "Your achievement has been improved with AI." });
    } catch {
      toast({ title: "Error", description: "Failed to rewrite bullet.", variant: "destructive" });
    }
  };

  const handleEducationChange = (id: string, field: keyof ResumeEducation, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleAddEducation = () => {
    const newEdu: ResumeEducation = {
      id: generateId(),
      degree: "",
      institution: "",
      endDate: "",
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const handleSkillGroupChange = (index: number, field: keyof ResumeSkillGroup, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      skillGroups: prev.skillGroups.map((group, i) =>
        i === index ? { ...group, [field]: value } : group
      )
    }));
  };

  const handleAddSkillGroup = () => {
    setResumeData(prev => ({
      ...prev,
      skillGroups: [...prev.skillGroups, { label: "New Category", items: [] }]
    }));
  };

  const handleRemoveSkillGroup = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skillGroups: prev.skillGroups.filter((_, i) => i !== index)
    }));
  };

  const handleTemplateChange = (templateKey: ResumeTemplateKey) => {
    setSelectedTemplate(templateKey);
    setResumeData(prev => ({ ...prev, templateKey }));
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateKey: selectedTemplate,
          resumeData: resumeData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${resumeData.contact.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Your resume has been downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between gap-4 p-4 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/resume-templates")}
            data-testid="button-back-to-templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg" data-testid="text-page-title">Resume Editor</h1>
            <p className="text-sm text-muted-foreground">
              Edit your content and preview in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTemplate} onValueChange={(v) => handleTemplateChange(v as ResumeTemplateKey)}>
            <SelectTrigger className="w-[180px]" data-testid="select-template">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {RESUME_TEMPLATES.map(t => (
                <SelectItem key={t.key} value={t.key} data-testid={`option-template-${t.key}`}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            data-testid="button-download-pdf"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[400px] border-r bg-background flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {!hasSufficientData && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p className="text-amber-800 dark:text-amber-200 text-xs">
                    Showing sample data. Complete your Knowledge Engine profile or edit directly below.
                  </p>
                </div>
              )}

              <Accordion type="multiple" defaultValue={["contact", "summary", "experience"]} className="space-y-2">
                <AccordionItem value="contact" className="border rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium" data-testid="accordion-contact">
                    Contact Information
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        value={resumeData.contact.fullName}
                        onChange={(e) => handleContactChange("fullName", e.target.value)}
                        placeholder="John Doe"
                        data-testid="input-fullname"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Headline</Label>
                      <Input
                        value={resumeData.contact.headline || ""}
                        onChange={(e) => handleContactChange("headline", e.target.value)}
                        placeholder="Senior Software Engineer"
                        data-testid="input-headline"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={resumeData.contact.email || ""}
                          onChange={(e) => handleContactChange("email", e.target.value)}
                          placeholder="email@example.com"
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Phone</Label>
                        <Input
                          value={resumeData.contact.phone || ""}
                          onChange={(e) => handleContactChange("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={resumeData.contact.location || ""}
                        onChange={(e) => handleContactChange("location", e.target.value)}
                        placeholder="City, State"
                        data-testid="input-location"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="summary" className="border rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium" data-testid="accordion-summary">
                    Professional Summary
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4">
                    <Textarea
                      value={resumeData.summary || ""}
                      onChange={(e) => handleSummaryChange(e.target.value)}
                      placeholder="Write a compelling summary of your professional experience..."
                      className="min-h-[100px] text-sm"
                      data-testid="textarea-summary"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRewriteSummary}
                      disabled={rewriteSectionMutation.isPending || !resumeData.summary}
                      data-testid="button-rewrite-summary"
                    >
                      {rewriteSectionMutation.isPending ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1.5" />
                      )}
                      Rewrite with AI
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="experience" className="border rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium" data-testid="accordion-experience">
                    Work Experience
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {resumeData.experiences.map((exp, expIndex) => (
                      <Card key={exp.id} className="relative">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GripVertical className="w-3 h-3" />
                              <span className="text-xs font-medium">Position {expIndex + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveExperience(exp.id)}
                              data-testid={`button-remove-exp-${exp.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Job Title</Label>
                              <Input
                                value={exp.jobTitle}
                                onChange={(e) => handleExperienceChange(exp.id, "jobTitle", e.target.value)}
                                placeholder="Software Engineer"
                                className="h-8 text-sm"
                                data-testid={`input-jobtitle-${exp.id}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Company</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                                placeholder="Company Name"
                                className="h-8 text-sm"
                                data-testid={`input-company-${exp.id}`}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Start Date</Label>
                              <Input
                                value={exp.startDate || ""}
                                onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                                placeholder="Jan 2020"
                                className="h-8 text-sm"
                                data-testid={`input-startdate-${exp.id}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Date</Label>
                              <Input
                                value={exp.endDate || ""}
                                onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                                placeholder="Present"
                                className="h-8 text-sm"
                                data-testid={`input-enddate-${exp.id}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Location</Label>
                              <Input
                                value={exp.location || ""}
                                onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                                placeholder="City, ST"
                                className="h-8 text-sm"
                                data-testid={`input-explocation-${exp.id}`}
                              />
                            </div>
                          </div>
                          <Separator className="my-2" />
                          <div className="space-y-2">
                            <Label className="text-xs">Achievements / Responsibilities</Label>
                            {exp.bullets.map((bullet, bulletIndex) => (
                              <div key={bulletIndex} className="flex items-start gap-1">
                                <Textarea
                                  value={bullet}
                                  onChange={(e) => handleBulletChange(exp.id, bulletIndex, e.target.value)}
                                  placeholder="Describe an achievement or responsibility..."
                                  className="min-h-[60px] text-sm flex-1"
                                  data-testid={`textarea-bullet-${exp.id}-${bulletIndex}`}
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleRewriteBullet(exp.id, bulletIndex)}
                                    disabled={rewriteSectionMutation.isPending || !bullet}
                                    data-testid={`button-rewrite-bullet-${exp.id}-${bulletIndex}`}
                                  >
                                    {rewriteSectionMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleRemoveBullet(exp.id, bulletIndex)}
                                    data-testid={`button-remove-bullet-${exp.id}-${bulletIndex}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBullet(exp.id)}
                              className="w-full"
                              data-testid={`button-add-bullet-${exp.id}`}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Bullet
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddExperience}
                      className="w-full"
                      data-testid="button-add-experience"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Experience
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="education" className="border rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium" data-testid="accordion-education">
                    Education
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {resumeData.education.map((edu, eduIndex) => (
                      <Card key={edu.id} className="relative">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GripVertical className="w-3 h-3" />
                              <span className="text-xs font-medium">Education {eduIndex + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveEducation(edu.id)}
                              data-testid={`button-remove-edu-${edu.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                              className="h-8 text-sm"
                              data-testid={`input-degree-${edu.id}`}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Institution</Label>
                              <Input
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                                placeholder="University Name"
                                className="h-8 text-sm"
                                data-testid={`input-institution-${edu.id}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Graduation Year</Label>
                              <Input
                                value={edu.endDate || ""}
                                onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                                placeholder="2020"
                                className="h-8 text-sm"
                                data-testid={`input-gradyear-${edu.id}`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddEducation}
                      className="w-full"
                      data-testid="button-add-education"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Education
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills" className="border rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium" data-testid="accordion-skills">
                    Skills
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {resumeData.skillGroups.map((group, groupIndex) => (
                      <Card key={groupIndex} className="relative">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <div className="flex items-center justify-between gap-2">
                            <Input
                              value={group.label}
                              onChange={(e) => handleSkillGroupChange(groupIndex, "label", e.target.value)}
                              placeholder="Category Name"
                              className="h-7 text-xs font-medium w-32"
                              data-testid={`input-skillgroup-label-${groupIndex}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveSkillGroup(groupIndex)}
                              data-testid={`button-remove-skillgroup-${groupIndex}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map((skill, skillIndex) => (
                              <Badge
                                key={skillIndex}
                                variant="secondary"
                                className="text-xs cursor-pointer"
                                onClick={() => {
                                  const newItems = group.items.filter((_, i) => i !== skillIndex);
                                  handleSkillGroupChange(groupIndex, "items", newItems);
                                }}
                                data-testid={`badge-skill-${groupIndex}-${skillIndex}`}
                              >
                                {skill}
                                <Trash2 className="w-2.5 h-2.5 ml-1 opacity-60" />
                              </Badge>
                            ))}
                            <Input
                              placeholder="Add skill..."
                              className="h-6 w-24 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                  handleSkillGroupChange(groupIndex, "items", [...group.items, e.currentTarget.value.trim()]);
                                  e.currentTarget.value = "";
                                }
                              }}
                              data-testid={`input-add-skill-${groupIndex}`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSkillGroup}
                      className="w-full"
                      data-testid="button-add-skillgroup"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Skill Category
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 bg-muted/50 overflow-auto p-6">
          <div className="flex justify-center">
            <div
              className="bg-white shadow-xl rounded-sm overflow-hidden"
              style={{ width: "816px", height: "1056px" }}
              data-testid="resume-preview-container"
            >
              {isLoadingPreview ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <iframe
                  title="Resume Preview"
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  data-testid="iframe-resume-preview"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
