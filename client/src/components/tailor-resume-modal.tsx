import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import type { MockJobMatch } from "@shared/schema";

interface TailorResumeModalProps {
  job: MockJobMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TailorResumeModal({
  job,
  isOpen,
  onClose,
}: TailorResumeModalProps) {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Tailor Resume
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{job.title}</p>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm">
              This will take you to the Tailor Resume flow with this job pre-selected.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll be able to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Optimize your resume for ATS keywords</li>
              <li>Highlight relevant experiences</li>
              <li>Address skill gaps in your summary</li>
              <li>Generate a tailored cover letter</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Coming next in JobSherpa
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-tailor">
            Close
          </Button>
          <Button disabled className="gap-2" data-testid="button-start-tailor">
            Start Tailoring
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
