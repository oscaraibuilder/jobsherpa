import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { Linkedin, Upload, FileText } from "lucide-react";
import type { BaseResumeSource } from "@/types/knowledgeEngine";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { updateState } = useKnowledgeEngine();
  const [selectedSource, setSelectedSource] = useState<BaseResumeSource>("scratch");

  const handleContinue = () => {
    updateState({
      baseResume: {
        source: selectedSource,
      },
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl" data-testid="text-onboarding-title">
            Welcome to JobSherpa
          </DialogTitle>
          <DialogDescription data-testid="text-onboarding-description">
            Let's get started by choosing how to build your base resume. You can always change this later.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedSource}
            onValueChange={(value) => setSelectedSource(value as BaseResumeSource)}
            className="flex flex-col gap-3"
          >
            <label
              className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                selectedSource === "linkedin"
                  ? "border-primary bg-primary/5"
                  : "border-border hover-elevate"
              }`}
              data-testid="onboarding-option-linkedin"
            >
              <RadioGroupItem value="linkedin" id="onboarding-linkedin" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 shrink-0">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Use LinkedIn Profile</p>
                <p className="text-sm text-muted-foreground">
                  Connect and import your experience from LinkedIn
                </p>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                selectedSource === "uploaded"
                  ? "border-primary bg-primary/5"
                  : "border-border hover-elevate"
              }`}
              data-testid="onboarding-option-uploaded"
            >
              <RadioGroupItem value="uploaded" id="onboarding-uploaded" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Upload Existing Resume</p>
                <p className="text-sm text-muted-foreground">
                  Parse your current resume as a starting point
                </p>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-colors ${
                selectedSource === "scratch"
                  ? "border-primary bg-primary/5"
                  : "border-border hover-elevate"
              }`}
              data-testid="onboarding-option-scratch"
            >
              <RadioGroupItem value="scratch" id="onboarding-scratch" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Start from Scratch</p>
                <p className="text-sm text-muted-foreground">
                  Build your resume by filling out each section manually
                </p>
              </div>
            </label>
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleContinue} data-testid="button-onboarding-continue">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
