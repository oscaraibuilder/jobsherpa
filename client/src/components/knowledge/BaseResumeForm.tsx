import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { useToast } from "@/hooks/use-toast";
import { Linkedin, Upload, FileText, Loader2, ExternalLink, CheckCircle2, X, Sparkles } from "lucide-react";
import type { BaseResumeSource, ParsedResumePayload } from "@/types/knowledgeEngine";

const formSchema = z.object({
  source: z.enum(["linkedin", "uploaded", "scratch"]),
});

type FormValues = z.infer<typeof formSchema>;

interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
}

interface BaseResumeFormProps {
  onClose: () => void;
  onOpenIdentity?: () => void;
}

export function BaseResumeForm({ onClose, onOpenIdentity }: BaseResumeFormProps) {
  const { state, updateState, applyParsedResume } = useKnowledgeEngine();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(
    state.baseResume.resumeDocumentId ? {
      id: state.baseResume.resumeDocumentId,
      url: state.baseResume.resumeDocumentUrl || "",
      fileName: state.baseResume.resumeFileName || "Resume",
    } : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: state.baseResume.source || "scratch",
    },
  });

  const selectedSource = form.watch("source");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("UPLOAD FAILED", res.status, text);
        throw new Error(`Upload failed: ${res.status} - ${text}`);
      }

      const data = await res.json();
      
      setUploadedFile({
        id: data.id,
        url: data.url,
        fileName: file.name,
      });
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded. Now parsing...`,
      });

      setIsParsing(true);
      try {
        const parseRes = await fetch("/api/resume/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentUrl: data.url }),
          credentials: "include",
        });

        if (parseRes.ok) {
          const parsedData: ParsedResumePayload = await parseRes.json();
          applyParsedResume(parsedData);
          toast({
            title: "Resume parsed",
            description: "Your profile, work history, and skills have been extracted",
          });
        } else {
          const errorData = await parseRes.json().catch(() => ({}));
          console.warn("Resume parsing failed:", errorData);
          toast({
            title: "Parsing notice",
            description: "Resume uploaded, but we couldn't auto-extract your information. You can fill in the details manually.",
          });
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        toast({
          title: "Parsing notice", 
          description: "Resume uploaded successfully. Manual entry may be needed for some sections.",
        });
      } finally {
        setIsParsing(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please make sure you're signed in.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const onSubmit = (values: FormValues) => {
    const shouldOpenIdentity = values.source === "scratch" && !state.identity?.fullName;
    
    const resumeDocumentId = uploadedFile?.id ?? state.baseResume.resumeDocumentId;
    const resumeDocumentUrl = uploadedFile?.url ?? state.baseResume.resumeDocumentUrl;
    const resumeFileName = uploadedFile?.fileName ?? state.baseResume.resumeFileName;
    
    updateState({
      baseResume: {
        source: values.source as BaseResumeSource,
        resumeDocumentId,
        resumeDocumentUrl,
        resumeFileName,
      },
    });
    
    onClose();
    
    if (shouldOpenIdentity && onOpenIdentity) {
      setTimeout(() => {
        onOpenIdentity();
      }, 100);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx"
          className="hidden"
          data-testid="input-resume-file-upload"
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you like to start?</FormLabel>
              <FormDescription>
                Choose your starting point for building tailored resumes
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-3 pt-2"
                >
                  <label
                    className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                      selectedSource === "linkedin"
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid="radio-source-linkedin"
                  >
                    <RadioGroupItem value="linkedin" id="linkedin" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 shrink-0">
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Use LinkedIn Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Import your experience from your connected LinkedIn account
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                      selectedSource === "uploaded"
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid="radio-source-uploaded"
                  >
                    <RadioGroupItem value="uploaded" id="uploaded" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Upload Existing Resume</p>
                      <p className="text-sm text-muted-foreground">
                        Parse and use your current resume as a starting point
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                      selectedSource === "scratch"
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    data-testid="radio-source-scratch"
                  >
                    <RadioGroupItem value="scratch" id="scratch" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Start from Scratch</p>
                      <p className="text-sm text-muted-foreground">
                        Build your resume by filling out the modules manually
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSource === "linkedin" && (
          <div className="space-y-4 p-4 rounded-md bg-muted/50 border">
            <div className="space-y-2">
              <p className="text-sm font-medium">Download Your LinkedIn PDF</p>
              <p className="text-sm text-muted-foreground">
                LinkedIn provides a complete PDF export of your profile. Here's how to get it:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to your LinkedIn profile page</li>
                <li>Click the "More" button below your profile photo</li>
                <li>Select "Save to PDF"</li>
                <li>Upload the downloaded PDF below</li>
              </ol>
              <a 
                href="https://www.linkedin.com/in/me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline gap-1"
                data-testid="link-linkedin-profile"
              >
                Open Your LinkedIn Profile <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            {uploadedFile ? (
              <Card className="overflow-visible">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{uploadedFile.fileName}</p>
                      <p className="text-xs text-muted-foreground">LinkedIn PDF uploaded</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    data-testid="button-remove-linkedin-file"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
                data-testid="button-upload-linkedin-pdf"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload LinkedIn PDF
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {selectedSource === "uploaded" && (
          <div className="space-y-4">
            {uploadedFile ? (
              <Card className="overflow-visible">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{uploadedFile.fileName}</p>
                      <p className="text-xs text-muted-foreground">Resume uploaded</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    data-testid="button-remove-resume-file"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your current resume
                </p>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="button-upload-resume"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: PDF, DOC, DOCX (max 10MB)
                </p>
              </div>
            )}
          </div>
        )}

        {selectedSource === "scratch" && (
          <div className="p-4 rounded-md bg-muted/50 border">
            <p className="text-sm text-muted-foreground">
              You'll fill out your profile information, work history, skills, and other details in the following modules. 
              After saving, we'll open the Profile Snapshot to get you started.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-base-resume">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
